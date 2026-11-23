import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { quoteCart } from '../checkout-service'
import { saveCampaign } from '../campaign-service'
import { cleanPromotion, normalizeItem, saleFor, type Promotion, type PromotionItem } from '../promotions'
import { loadLiveSaleItems, loadPromotionData } from '../promotions-service'

vi.mock('../supabase', () => ({ createAdminSupabaseClient: vi.fn(), createBrowserSupabaseClient: vi.fn() }))

const NOW = new Date('2026-11-25T10:00:00.000Z')
const promo = (id: number, over: Partial<Promotion> = {}): Promotion => ({ id, name: `Campaign ${id}`, starts_at: null, ends_at: null, is_active: true, allow_codes: true, ...over })
const item = (promotion_id: number, product_id: number, percent_off: number, variant_ids: number[] | null = null): PromotionItem => ({ promotion_id, product_id, percent_off, variant_ids })

describe('saleFor with options', () => {
  const items = [item(1, 7, 20, [11])]
  it('only the chosen option gets the sale', () => {
    expect(saleFor(7, 1000, [promo(1)], items, NOW, 11)).toMatchObject({ price: 800, percent: 20 })
    expect(saleFor(7, 1000, [promo(1)], items, NOW, 12)).toBeNull()
  })
  it('no option chosen / a product without options: a limited discount does not apply', () => {
    expect(saleFor(7, 1000, [promo(1)], items, NOW, null)).toBeNull()
  })
  it('in product lists (no option known) it is a partial sale: badge only, price not lowered', () => {
    expect(saleFor(7, 1000, [promo(1)], items, NOW)).toMatchObject({ partial: true, price: 1000, regular: 1000, percent: 20 })
  })
  it('a discount on the whole product wins over a partial one, and a partial one never lowers a price', () => {
    const both = [item(1, 7, 50, [11]), item(2, 7, 10)]
    expect(saleFor(7, 1000, [promo(1), promo(2)], both, NOW)).toMatchObject({ promotionId: 2, price: 900 })
    expect(saleFor(7, 1000, [promo(1), promo(2)], both, NOW)?.partial).toBeUndefined()
  })
  it('for one option the lowest price wins between campaigns', () => {
    const both = [item(1, 7, 50, [11]), item(2, 7, 10)]
    expect(saleFor(7, 1000, [promo(1), promo(2)], both, NOW, 11)).toMatchObject({ promotionId: 1, price: 500 })
    expect(saleFor(7, 1000, [promo(1), promo(2)], both, NOW, 12)).toMatchObject({ promotionId: 2, price: 900 })
  })
  it('an empty list means every option (as before)', () => {
    expect(saleFor(7, 1000, [promo(1)], [item(1, 7, 20, [])], NOW, 99)).toMatchObject({ price: 800 })
    expect(saleFor(7, 1000, [promo(1)], [item(1, 7, 20, null)], NOW, null)).toMatchObject({ price: 800 })
  })
})

describe('normalizeItem / cleanPromotion', () => {
  it('turns database rows into clean items', () => {
    expect(normalizeItem({ promotion_id: '1', product_id: '2', percent_off: '15', variant_ids: ['3', 3, 'x', 0] })).toEqual({ promotion_id: 1, product_id: 2, percent_off: 15, variant_ids: [3] })
    expect(normalizeItem({ promotion_id: 1, product_id: 2, percent_off: 15 }).variant_ids).toBeNull()
    expect(normalizeItem({ promotion_id: 1, product_id: 2, percent_off: 15, variant_ids: [] }).variant_ids).toBeNull()
  })
  it('keeps the chosen options, drops duplicates, refuses nonsense', () => {
    const ok = cleanPromotion({ name: 'X', items: [{ product_id: 1, percent_off: 20, variant_ids: [5, '5', 6] }, { product_id: 2, percent_off: 20, variant_ids: [] }] })
    expect(ok).toMatchObject({ value: { items: [{ product_id: 1, variant_ids: [5, 6] }, { product_id: 2, variant_ids: null }] } })
    expect(cleanPromotion({ name: 'X', items: [{ product_id: 1, percent_off: 20, variant_ids: [5, 'a'] }] })).toHaveProperty('error')
    expect(cleanPromotion({ name: 'X', items: [{ product_id: 1, percent_off: 20, variant_ids: [-1] }] })).toHaveProperty('error')
  })
})

let db: FakeDb
const client = () => db as unknown as SupabaseClient
const line = (productId: number, variantId: number | null = null) => ({ productId, variantId, quantity: 1, note: '' })

/** Pretends migration 20261114 was not run: nothing knows the variant_ids column. */
function withoutColumn(d: FakeDb) {
  const from = d.from.bind(d)
  ;(d as unknown as { from: (t: string) => unknown }).from = (t: string) => {
    const q = from(t) as { select: (c?: string) => unknown; upsert: (v: unknown, o?: unknown) => unknown }
    if (t !== 'promotion_products') return q
    const select = q.select.bind(q), upsert = q.upsert.bind(q)
    const failed = { in: () => failed, then: (res: (v: unknown) => unknown) => res({ data: null, error: { message: 'column promotion_products.variant_ids does not exist' } }) }
    q.select = (c?: string) => (String(c ?? '').includes('variant_ids') ? failed : select(c))
    q.upsert = (v: unknown, o?: unknown) => (JSON.stringify(v).includes('variant_ids') ? Promise.resolve({ data: null, error: { message: 'column variant_ids does not exist' } }) : upsert(v, o))
    return q
  }
}

beforeEach(() => {
  db = new FakeDb()
  db.seed('products', [
    { id: 1, slug: 'band', title: 'Band', price_egp: 1000, status: 'available', stock_quantity: 5, discount_enabled: true, reserved_until: null },
    { id: 2, slug: 'other', title: 'Other', price_egp: 500, status: 'available', stock_quantity: 5, discount_enabled: true, reserved_until: null },
  ])
  db.seed('product_variants', [
    { id: 11, product_id: 1, name: 'Black', size_name: 'M', price_egp: 1000, color_hex: null, stock_quantity: 3, is_active: true, display_order: 0 },
    { id: 12, product_id: 1, name: 'Beige', size_name: 'L', price_egp: 1200, color_hex: null, stock_quantity: 3, is_active: true, display_order: 1 },
    { id: 21, product_id: 2, name: 'Red', size_name: null, price_egp: null, color_hex: null, stock_quantity: 3, is_active: true, display_order: 0 },
  ])
  db.seed('promotions', [{ id: 1, name: 'Early White Friday', starts_at: '2026-11-20T00:00:00Z', ends_at: '2026-11-30T00:00:00Z', is_active: true, allow_codes: true }])
  db.seed('promotion_products', [{ promotion_id: 1, product_id: 1, percent_off: 50, variant_ids: [12] }])
})

describe('the server prices only the chosen options', () => {
  it('the chosen option is discounted from its own price, the other one is not', async () => {
    const q = await quoteCart(client(), [line(1, 12), line(1, 11)], { now: NOW })
    expect(q.lines[0]).toMatchObject({ unitPriceEgp: 600, regularPriceEgp: 1200, saleName: 'Early White Friday', salePercent: 50 })
    expect(q.lines[1]).toMatchObject({ unitPriceEgp: 1000, regularPriceEgp: null, saleName: null })
    expect(q.totals.total).toBe(1600)
  })
  it('a product with no options is not discounted by an option-limited item', async () => {
    db.rows('promotion_products')[0].product_id = 2
    expect((await quoteCart(client(), [line(2, 21)], { now: NOW })).lines[0]).toMatchObject({ unitPriceEgp: 500, regularPriceEgp: null })
  })
  it('before migration 20261114 every campaign still covers every option', async () => {
    withoutColumn(db)
    db.rows('promotion_products')[0].variant_ids = undefined
    const q = await quoteCart(client(), [line(1, 11)], { now: NOW })
    expect(q.lines[0]).toMatchObject({ unitPriceEgp: 500 })
  })
  it('loadPromotionData falls back to the old columns without the migration', async () => {
    withoutColumn(db)
    db.rows('promotion_products')[0].variant_ids = undefined // the old columns do not have it
    const r = await loadPromotionData(client())
    expect(r.items).toHaveLength(1)
    expect(r.items[0].variant_ids).toBeNull()
  })
})

describe('saveCampaign with options', () => {
  const clean = (items: unknown[]) => { const r = cleanPromotion({ name: 'Early White Friday', items }); if ('error' in r) throw new Error(r.error); return r.value }

  it('saves the chosen options and can go back to every option', async () => {
    const created = await saveCampaign(client(), null, clean([{ product_id: 1, percent_off: 20, variant_ids: [11] }]))
    expect(created.ok).toBe(true)
    const id = created.ok ? created.id : 0
    expect(db.rows('promotion_products').find((r) => r.promotion_id === id)?.variant_ids).toEqual([11])
    await saveCampaign(client(), id, clean([{ product_id: 1, percent_off: 20 }]))
    expect(db.rows('promotion_products').find((r) => r.promotion_id === id)?.variant_ids).toBeNull()
  })
  it('refuses an option that belongs to another product and creates nothing', async () => {
    const before = db.rows('promotions').length
    const r = await saveCampaign(client(), null, clean([{ product_id: 1, percent_off: 20, variant_ids: [21] }]))
    expect(r.ok).toBe(false)
    expect(db.rows('promotions')).toHaveLength(before)
  })
  it('explains the missing migration when options are picked, and still saves without them', async () => {
    withoutColumn(db)
    const picked = await saveCampaign(client(), null, clean([{ product_id: 1, percent_off: 20, variant_ids: [11] }]))
    expect(picked.ok).toBe(false)
    expect(!picked.ok && picked.message).toContain('20261114_01_campaign_options.sql')
    expect(db.rows('promotions')).toHaveLength(1) // the new campaign was removed again
    const plain = await saveCampaign(client(), null, clean([{ product_id: 1, percent_off: 20 }]))
    expect(plain.ok).toBe(true)
  })
})

describe('email shows the cheapest discounted option', () => {
  it('uses the option price, not the product price', async () => {
    db.seed('product_images', [])
    const items = await loadLiveSaleItems(client(), NOW)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ regular: 1200, price: 600, percent: 50 })
  })
})
