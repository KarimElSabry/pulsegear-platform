import { beforeEach, describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { placeCheckout, quoteCart } from '../checkout-service'
import { deleteCampaign, saveCampaign, setCampaignActive } from '../campaign-service'
import { cleanPromotion } from '../promotions'
import type { CleanCustomer } from '../checkout-core'

let db: FakeDb
const client = () => db as unknown as SupabaseClient
const NOW = new Date('2026-11-25T10:00:00.000Z')
const customer: CleanCustomer = { name: 'Ahmed Mohamed', phone: '01012345678', email: null, address: '12 Street, Nasr City, Cairo', note: '' }
const line = (productId: number, variantId: number | null = null, quantity = 1) => ({ productId, variantId, quantity, note: '' })
const clean = (over: Record<string, unknown> = {}) => {
  const r = cleanPromotion({ name: 'Early White Friday', starts: '', ends: '', items: [{ product_id: 1, percent_off: 20 }], ...over })
  if ('error' in r) throw new Error(r.error)
  return r.value
}

beforeEach(() => {
  db = new FakeDb()
  db.seed('products', [
    { id: 1, slug: 'p1', title: 'Watch', price_egp: 1000, status: 'available', stock_quantity: 5, discount_enabled: true, reserved_until: null },
    { id: 2, slug: 'p2', title: 'Strap', price_egp: 500, status: 'available', stock_quantity: 5, discount_enabled: true, reserved_until: null },
    { id: 3, slug: 'p3', title: 'No codes', price_egp: 400, status: 'available', stock_quantity: 5, discount_enabled: false, reserved_until: null },
  ])
  db.seed('product_variants', [
    { id: 11, product_id: 2, name: 'Black', size_name: 'M-XL', price_egp: 600, color_hex: null, stock_quantity: 3, is_active: true, display_order: 0 },
  ])
  db.seed('discount_codes', [{ id: 1, code: 'TRIEDGE', discount_percent: 10, is_active: true, usage_count: 0 }])
})

describe('the server prices a live campaign', () => {
  beforeEach(() => {
    db.seed('promotions', [{ id: 1, name: 'Early White Friday', starts_at: '2026-11-20T00:00:00Z', ends_at: '2026-11-30T00:00:00Z', is_active: true, allow_codes: true }])
    db.seed('promotion_products', [{ promotion_id: 1, product_id: 1, percent_off: 20 }, { promotion_id: 1, product_id: 2, percent_off: 50 }])
  })
  it('charges the sale price and keeps the regular price for display', async () => {
    const q = await quoteCart(client(), [line(1)], { now: NOW })
    expect(q.lines[0]).toMatchObject({ unitPriceEgp: 800, regularPriceEgp: 1000, saleName: 'Early White Friday', salePercent: 20 })
    expect(q.totals.total).toBe(800)
  })
  it('takes the percent off an option\'s own price', async () => {
    const q = await quoteCart(client(), [line(2, 11)], { now: NOW })
    expect(q.lines[0]).toMatchObject({ unitPriceEgp: 300, regularPriceEgp: 600 })
  })
  it('before the start, after the end and while switched off the price is the regular one', async () => {
    expect((await quoteCart(client(), [line(1)], { now: new Date('2026-11-19T10:00:00Z') })).lines[0]).toMatchObject({ unitPriceEgp: 1000, regularPriceEgp: null, saleName: null })
    expect((await quoteCart(client(), [line(1)], { now: new Date('2026-11-30T00:00:00Z') })).lines[0].unitPriceEgp).toBe(1000)
    db.rows('promotions')[0].is_active = false
    expect((await quoteCart(client(), [line(1)], { now: NOW })).lines[0].unitPriceEgp).toBe(1000)
  })
  it('products outside the campaign are unchanged', async () => {
    expect((await quoteCart(client(), [line(3)], { now: NOW })).lines[0]).toMatchObject({ unitPriceEgp: 400, regularPriceEgp: null })
  })
  it('a discount code works on top of the sale price, unless the campaign switches codes off', async () => {
    const withCode = await quoteCart(client(), [line(1)], { now: NOW, discountCode: 'TRIEDGE' })
    expect(withCode.totals.total).toBe(720) // 1000 -20% = 800, then -10%
    db.rows('promotions')[0].allow_codes = false
    const noCode = await quoteCart(client(), [line(1)], { now: NOW, discountCode: 'TRIEDGE' })
    expect(noCode.lines[0].discountEnabled).toBe(false)
    expect(noCode.totals.total).toBe(800)
  })
  it('a code never applies to a product that does not allow codes, sale or not', async () => {
    db.rows('promotion_products').push({ promotion_id: 1, product_id: 3, percent_off: 10 })
    const q = await quoteCart(client(), [line(3)], { now: NOW, discountCode: 'TRIEDGE' })
    expect(q.lines[0].discountEnabled).toBe(false)
    expect(q.totals.total).toBe(360)
  })
  it('the order records the sale price the customer pays', async () => {
    const r = await placeCheckout(client(), { lines: [line(1)], customer, now: NOW })
    expect(r.ok).toBe(true)
    expect(db.rows('checkout_items')[0]).toMatchObject({ unit_price_egp: 800 })
    if (r.ok) expect(r.totals.total).toBe(800)
  })
  it('without the campaign tables (migration not run) everything is at the regular price', async () => {
    db.failing.add('promotions')
    expect((await quoteCart(client(), [line(1)], { now: NOW })).lines[0]).toMatchObject({ unitPriceEgp: 1000, regularPriceEgp: null })
  })
})

describe('saveCampaign', () => {
  it('creates a campaign with its products', async () => {
    const r = await saveCampaign(client(), null, clean({ items: [{ product_id: 1, percent_off: 20 }, { product_id: 2, percent_off: 30 }] }))
    expect(r).toMatchObject({ ok: true, warnings: [] })
    expect(db.rows('promotions')).toHaveLength(1)
    expect(db.rows('promotion_products').map((p) => [p.product_id, p.percent_off])).toEqual([[1, 20], [2, 30]])
  })
  it('editing updates percentages and removes products that were taken out', async () => {
    const created = await saveCampaign(client(), null, clean({ items: [{ product_id: 1, percent_off: 20 }, { product_id: 2, percent_off: 30 }] }))
    const id = created.ok ? created.id : 0
    const r = await saveCampaign(client(), id, clean({ name: 'Black Friday', items: [{ product_id: 1, percent_off: 35 }] }))
    expect(r.ok).toBe(true)
    expect(db.rows('promotions')[0]).toMatchObject({ name: 'Black Friday' })
    expect(db.rows('promotion_products').map((p) => [p.product_id, p.percent_off])).toEqual([[1, 35]])
  })
  it('refuses to edit a campaign that is gone', async () => {
    db.seed('promotions', [])
    expect(await saveCampaign(client(), 99, clean())).toMatchObject({ ok: false })
  })
  it('warns when another live campaign at the same time has the same products', async () => {
    await saveCampaign(client(), null, clean({ name: 'First', items: [{ product_id: 1, percent_off: 10 }, { product_id: 2, percent_off: 10 }] }))
    const r = await saveCampaign(client(), null, clean({ name: 'Second', items: [{ product_id: 1, percent_off: 15 }, { product_id: 3, percent_off: 15 }] }))
    expect(r.ok && r.warnings).toEqual(['1 product is also in "First" at the same time. The lower price wins.'])
  })
  it('no warning when the dates do not meet', async () => {
    await saveCampaign(client(), null, clean({ name: 'First', starts: '2026-11-01T00:00', ends: '2026-11-05T00:00' }))
    const r = await saveCampaign(client(), null, clean({ name: 'Second', starts: '2026-11-10T00:00', ends: '2026-11-15T00:00' }))
    expect(r.ok && r.warnings).toEqual([])
  })
  it('explains a missing migration', async () => {
    db.failing.add('promotions')
    const r = await saveCampaign(client(), null, clean())
    expect(r).toMatchObject({ ok: false })
    expect(!r.ok && r.message).toContain('20261110_01_campaigns.sql')
  })
})

describe('switching off and deleting', () => {
  it('switch off and on, and delete', async () => {
    const created = await saveCampaign(client(), null, clean())
    const id = created.ok ? created.id : 0
    expect(await setCampaignActive(client(), id, false)).toMatchObject({ ok: true })
    expect(db.rows('promotions')[0].is_active).toBe(false)
    expect(await setCampaignActive(client(), 12345, true)).toMatchObject({ ok: false })
    expect(await deleteCampaign(client(), id)).toMatchObject({ ok: true })
    expect(db.rows('promotions')).toHaveLength(0)
  })
})
