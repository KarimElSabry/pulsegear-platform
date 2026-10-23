import { describe, expect, it } from 'vitest'
import { clampPercent, cleanPhone, computeTotals, holdUntil, validateCustomer } from '../checkout-core'

describe('computeTotals', () => {
  it('adds up quantity times price', () => {
    const t = computeTotals([{ unitPriceEgp: 1000, quantity: 2, discountEnabled: true }], 0)
    expect(t).toMatchObject({ subtotal: 2000, discount: 0, total: 2000 })
    expect(t.lines[0]).toEqual({ lineTotal: 2000, discount: 0, net: 2000 })
  })
  it('applies the discount only to allowed products', () => {
    const t = computeTotals([
      { unitPriceEgp: 1000, quantity: 1, discountEnabled: true },
      { unitPriceEgp: 500, quantity: 1, discountEnabled: false },
    ], 10)
    expect(t.discount).toBe(100)
    expect(t.total).toBe(1400)
    expect(t.lines.map((l) => l.net)).toEqual([900, 500])
  })
  it('line nets always add up to the total', () => {
    const t = computeTotals([
      { unitPriceEgp: 333, quantity: 1, discountEnabled: true },
      { unitPriceEgp: 333, quantity: 1, discountEnabled: true },
      { unitPriceEgp: 334, quantity: 1, discountEnabled: true },
    ], 7.5)
    expect(t.lines.reduce((s, l) => s + l.net, 0)).toBe(t.total)
  })
  it('handles an empty cart and silly percentages', () => {
    expect(computeTotals([], 0).total).toBe(0)
    expect(clampPercent(150)).toBe(100)
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent('abc')).toBe(0)
    expect(computeTotals([{ unitPriceEgp: 100, quantity: 1, discountEnabled: true }], 500).total).toBe(0)
  })
})

describe('validateCustomer', () => {
  const good = { name: 'Ahmed Mohamed', phone: '01012345678', address: '12 Street, Nasr City, Cairo' }
  it('accepts a good order and normalises Arabic digits', () => {
    const r = validateCustomer({ ...good, phone: '٠١٠١٢٣٤٥٦٧٨', email: ' a@b.co ' })
    expect(r.ok).toBe(true)
    if (r.ok) { expect(r.value.phone).toBe('01012345678'); expect(r.value.email).toBe('a@b.co') }
  })
  it('email and note are optional', () => { expect(validateCustomer(good).ok).toBe(true) })
  it('reports every problem', () => {
    const r = validateCustomer({ name: 'A', phone: '123', address: 'x', email: 'bad' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['address', 'email', 'name', 'phone'])
  })
  it('cleanPhone', () => {
    expect(cleanPhone('+20 101 234 5678')).toBe('+201012345678')
    expect(cleanPhone('12345')).toBeNull()
    expect(cleanPhone(42)).toBeNull()
  })
})

describe('hold time', () => {
  it('24 hours by default', () => {
    expect(holdUntil(new Date('2026-10-21T10:00:00Z')).toISOString()).toBe('2026-10-22T10:00:00.000Z')
    expect(holdUntil(new Date('2026-10-21T10:00:00Z'), 1).toISOString()).toBe('2026-10-21T11:00:00.000Z')
  })
})
