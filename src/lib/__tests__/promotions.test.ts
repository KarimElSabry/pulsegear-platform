import { describe, expect, it } from 'vitest'
import { cairoLocalToIso, cleanPromotion, isLive, isoToCairoLocal, overlaps, promotionStatus, saleFor, salePrice, type Promotion, type PromotionItem } from '../promotions'

const NOW = new Date('2026-11-20T10:00:00.000Z')
const promo = (id: number, over: Partial<Promotion> = {}): Promotion => ({ id, name: `P${id}`, starts_at: null, ends_at: null, is_active: true, allow_codes: true, ...over })
const item = (promotion_id: number, product_id: number, percent_off: number): PromotionItem => ({ promotion_id, product_id, percent_off })

describe('status', () => {
  it('live, scheduled, ended and off', () => {
    expect(promotionStatus(promo(1), NOW)).toBe('live')
    expect(promotionStatus(promo(1, { starts_at: '2026-11-21T00:00:00Z' }), NOW)).toBe('scheduled')
    expect(promotionStatus(promo(1, { ends_at: '2026-11-20T10:00:00Z' }), NOW)).toBe('ended') // the end moment itself is over
    expect(promotionStatus(promo(1, { is_active: false }), NOW)).toBe('off')
    expect(isLive(promo(1, { starts_at: '2026-11-20T10:00:00Z' }), NOW)).toBe(true) // the start moment itself is live
  })
})

describe('saleFor', () => {
  it('prices a product in a live campaign and rounds to whole pounds', () => {
    expect(salePrice(1999, 20)).toBe(1599)
    const s = saleFor(5, 1000, [promo(1)], [item(1, 5, 41)], NOW)
    expect(s).toMatchObject({ promotionId: 1, name: 'P1', regular: 1000, price: 590, percent: 41, allowCodes: true })
  })
  it('ignores products that are not in the campaign, and campaigns that are not live', () => {
    expect(saleFor(6, 1000, [promo(1)], [item(1, 5, 20)], NOW)).toBeNull()
    expect(saleFor(5, 1000, [promo(1, { is_active: false })], [item(1, 5, 20)], NOW)).toBeNull()
    expect(saleFor(5, 1000, [promo(1, { ends_at: '2026-11-19T00:00:00Z' })], [item(1, 5, 20)], NOW)).toBeNull()
    expect(saleFor(5, 0, [promo(1)], [item(1, 5, 20)], NOW)).toBeNull()
  })
  it('the lowest price wins when two live campaigns overlap', () => {
    const s = saleFor(5, 1000, [promo(1), promo(2, { allow_codes: false })], [item(1, 5, 10), item(2, 5, 30)], NOW)
    expect(s).toMatchObject({ promotionId: 2, price: 700, allowCodes: false })
  })
  it('a campaign that has not started does not beat a live one', () => {
    const s = saleFor(5, 1000, [promo(1), promo(2, { starts_at: '2026-12-01T00:00:00Z' })], [item(1, 5, 10), item(2, 5, 50)], NOW)
    expect(s?.promotionId).toBe(1)
  })
})

describe('Egypt time', () => {
  it('uses winter time (UTC+2) and summer time (UTC+3)', () => {
    expect(cairoLocalToIso('2026-01-15T12:00')).toBe('2026-01-15T10:00:00.000Z')
    expect(cairoLocalToIso('2026-07-15T12:00')).toBe('2026-07-15T09:00:00.000Z')
  })
  it('round-trips and rejects nonsense', () => {
    const iso = cairoLocalToIso('2026-11-27T00:00') as string
    expect(isoToCairoLocal(iso)).toBe('2026-11-27T00:00')
    expect(cairoLocalToIso('')).toBeNull()
    expect(cairoLocalToIso('tomorrow')).toBeNull()
    expect(isoToCairoLocal(null)).toBe('')
  })
})

describe('cleanPromotion', () => {
  const ok = { name: ' Early White Friday ', starts: '2026-11-20T00:00', ends: '2026-11-30T23:59', items: [{ product_id: 1, percent_off: '20' }, { product_id: 1, percent_off: 30 }, { product_id: 2, percent_off: 15.555 }] }
  it('cleans a good campaign (duplicate products keep the first)', () => {
    const r = cleanPromotion(ok)
    expect(r).toMatchObject({ value: { name: 'Early White Friday', is_active: true, allow_codes: true } })
    if ('value' in r) expect(r.value.items).toEqual([{ product_id: 1, percent_off: 20 }, { product_id: 2, percent_off: 15.56 }])
  })
  it('rejects bad input', () => {
    expect(cleanPromotion({ ...ok, name: '' })).toHaveProperty('error')
    expect(cleanPromotion({ ...ok, name: 'x'.repeat(61) })).toHaveProperty('error')
    expect(cleanPromotion({ ...ok, ends: '2026-11-19T00:00' })).toHaveProperty('error')
    expect(cleanPromotion({ ...ok, starts: 'soon' })).toHaveProperty('error')
    expect(cleanPromotion({ ...ok, items: [] })).toHaveProperty('error')
    expect(cleanPromotion({ ...ok, items: [{ product_id: 1, percent_off: 0 }] })).toHaveProperty('error')
    expect(cleanPromotion({ ...ok, items: [{ product_id: 1, percent_off: 96 }] })).toHaveProperty('error')
    expect(cleanPromotion({ ...ok, items: [{ product_id: 'x', percent_off: 10 }] })).toHaveProperty('error')
  })
  it('dates are optional', () => {
    expect(cleanPromotion({ name: 'Always', items: [{ product_id: 1, percent_off: 5 }] })).toMatchObject({ value: { starts_at: null, ends_at: null } })
  })
})

describe('overlaps', () => {
  it('detects campaigns that run at the same time', () => {
    const a = { starts_at: '2026-11-01T00:00:00Z', ends_at: '2026-11-10T00:00:00Z' }
    expect(overlaps(a, { starts_at: '2026-11-09T00:00:00Z', ends_at: '2026-11-12T00:00:00Z' })).toBe(true)
    expect(overlaps(a, { starts_at: '2026-11-10T00:00:00Z', ends_at: '2026-11-12T00:00:00Z' })).toBe(false)
    expect(overlaps(a, { starts_at: null, ends_at: null })).toBe(true)
  })
})
