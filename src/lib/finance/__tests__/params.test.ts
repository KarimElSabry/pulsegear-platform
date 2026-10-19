import { describe, expect, it } from 'vitest'
import { filtersToQuery, parseParams } from '../params'

const TODAY = '2026-10-14'

describe('parseParams', () => {
  it('defaults to this month with comparison on', () => {
    const p = parseParams({}, TODAY)
    expect(p.filters.from).toBe('2026-10-01')
    expect(p.filters.to).toBe(TODAY)
    expect(p.compare).toBe(true)
  })

  it('supports presets', () => {
    expect(parseParams({ preset: 'last_7' }, TODAY).filters.from).toBe('2026-10-08')
    expect(parseParams({ preset: 'this_year' }, TODAY).filters.from).toBe('2026-01-01')
  })

  it('accepts a custom range, swaps reversed dates and ignores garbage', () => {
    expect(parseParams({ preset: 'custom', from: '2026-09-01', to: '2026-09-30' }, TODAY).filters).toMatchObject({ from: '2026-09-01', to: '2026-09-30' })
    expect(parseParams({ preset: 'custom', from: '2026-09-30', to: '2026-09-01' }, TODAY).filters).toMatchObject({ from: '2026-09-01', to: '2026-09-30' })
    expect(parseParams({ preset: 'custom', from: 'nope', to: '2026-13-45' }, TODAY).filters.from).toBe('2026-10-01')
  })

  it('caps very long ranges', () => {
    const f = parseParams({ preset: 'custom', from: '2000-01-01', to: '2026-10-01' }, TODAY).filters
    expect(f.from > '2024-01-01').toBe(true)
  })

  it('only accepts known enum values', () => {
    const f = parseParams({ orderStatus: 'hacked', deliveryStatus: 'delivered', channel: 'whatsapp' }, TODAY).filters
    expect(f.orderStatus).toBeUndefined()
    expect(f.deliveryStatus).toBe('delivered')
    expect(f.channel).toBe('whatsapp')
  })

  it('round-trips filters through a query string', () => {
    const p = parseParams({ preset: 'custom', from: '2026-09-01', to: '2026-09-30', campaign: 'Fenix', channel: 'instagram' }, TODAY)
    const q = Object.fromEntries(new URLSearchParams(filtersToQuery(p.filters)))
    expect(parseParams(q, TODAY).filters).toEqual(p.filters)
  })
})
