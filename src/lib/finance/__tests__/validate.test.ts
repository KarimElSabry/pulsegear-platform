import { describe, expect, it } from 'vitest'
import { checkbox, date, integer, money, oneOf, requiredText, uuid, ValidationError } from '../validate'

const form = (o: Record<string, string>) => new Map(Object.entries(o)) as unknown as FormData

describe('validators', () => {
  it('money parses commas, rounds to 2 decimals and rejects bad input', () => {
    expect(money(form({ a: '1,250.555' }), 'a')).toBe(1250.56)
    expect(money(form({ a: '' }), 'a')).toBeNull()
    expect(() => money(form({ a: '' }), 'a', { required: true })).toThrow(ValidationError)
    expect(() => money(form({ a: 'abc' }), 'a')).toThrow(/number/)
    expect(() => money(form({ a: '-5' }), 'a')).toThrow(/at least 0/)
    expect(() => money(form({ a: '1e12' }), 'a')).toThrow(/too large/)
    expect(() => money(form({ a: 'Infinity' }), 'a')).toThrow()
  })

  it('integer rejects fractions', () => {
    expect(integer(form({ q: '3' }), 'q', { min: 1 })).toBe(3)
    expect(() => integer(form({ q: '1.5' }), 'q')).toThrow(/whole/)
    expect(() => integer(form({ q: '0' }), 'q', { min: 1 })).toThrow()
  })

  it('date requires a real calendar date', () => {
    expect(date(form({ d: '2026-10-05' }), 'd')).toBe('2026-10-05')
    expect(date(form({ d: '' }), 'd', '2026-01-01')).toBe('2026-01-01')
    expect(() => date(form({ d: '2026-02-30' }), 'd')).toThrow()
    expect(() => date(form({ d: '05/10/2026' }), 'd')).toThrow()
  })

  it('oneOf, uuid, text and checkbox', () => {
    expect(oneOf(form({ s: 'cod' }), 's', ['cod', 'prepaid'] as const)).toBe('cod')
    expect(oneOf(form({ s: '' }), 's', ['cod'] as const, { optional: true })).toBeNull()
    expect(() => oneOf(form({ s: 'hax' }), 's', ['cod'] as const)).toThrow()
    expect(uuid(form({ u: '123e4567-e89b-12d3-a456-426614174000' }), 'u')).toBeTruthy()
    expect(() => uuid(form({ u: "1'; drop table sales;--" }), 'u')).toThrow()
    expect(requiredText(form({ t: '  hi  ' }), 't')).toBe('hi')
    expect(() => requiredText(form({ t: '   ' }), 't')).toThrow()
    expect(checkbox(form({ c: 'on' }), 'c')).toBe(true)
    expect(checkbox(form({}), 'c')).toBe(false)
  })
})
