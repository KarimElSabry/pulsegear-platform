import { beforeEach, describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { cairoDateDots, liveCampaigns, type Promotion, type PromotionItem } from '../promotions'
import { loadLiveCampaigns } from '../promotions-service'

const NOW = new Date('2026-11-25T10:00:00.000Z')
const promo = (id: number, over: Partial<Promotion> = {}): Promotion => ({ id, name: `C${id}`, starts_at: null, ends_at: null, is_active: true, allow_codes: true, ...over })
const item = (promotion_id: number, product_id: number, percent_off: number): PromotionItem => ({ promotion_id, product_id, percent_off })

describe('cairoDateDots', () => {
  it('shows the end date like 30.11.2026, in Egypt time', () => {
    expect(cairoDateDots('2026-11-30T12:00:00.000Z')).toBe('30.11.2026')
    expect(cairoDateDots('2026-11-30T22:30:00.000Z')).toBe('01.12.2026') // already the next day in Egypt (UTC+2)
  })
})

describe('liveCampaigns', () => {
  it('lists live campaigns with products, the one ending first on top, with the best percent', () => {
    const list = liveCampaigns(
      [promo(1, { ends_at: '2026-12-10T00:00:00Z' }), promo(2, { ends_at: '2026-11-30T00:00:00Z' }), promo(3), promo(4, { starts_at: '2026-12-01T00:00:00Z' }), promo(5, { is_active: false }), promo(6)],
      [item(1, 1, 10), item(2, 1, 20), item(2, 2, 41.4), item(3, 1, 5), item(4, 1, 50), item(5, 1, 50)],
      NOW,
    )
    expect(list.map((c) => [c.id, c.maxPercent])).toEqual([[2, 41], [1, 10], [3, 5]]) // 4 not started, 5 off, 6 has no products
  })
})

describe('loadLiveCampaigns', () => {
  let db: FakeDb
  beforeEach(() => {
    db = new FakeDb()
    db.seed('products', [
      { id: 1, slug: 'a', title: 'A', price_egp: 1000, status: 'available' },
      { id: 2, slug: 'b', title: 'B', price_egp: 500, status: 'available' },
      { id: 3, slug: 'c', title: 'C', price_egp: 500, status: 'sold' },
    ])
    db.seed('promotions', [{ id: 1, name: 'Early White Friday', starts_at: '2026-11-20T00:00:00Z', ends_at: '2026-11-30T00:00:00Z', is_active: true, allow_codes: true }, { id: 2, name: 'Only sold', starts_at: null, ends_at: null, is_active: true, allow_codes: true }])
    db.seed('promotion_products', [{ promotion_id: 1, product_id: 1, percent_off: 20 }, { promotion_id: 1, product_id: 2, percent_off: 40 }, { promotion_id: 1, product_id: 3, percent_off: 50 }, { promotion_id: 2, product_id: 3, percent_off: 30 }])
  })
  const load = (now = NOW, perCampaign?: number) => loadLiveCampaigns(db as unknown as SupabaseClient, now, { perCampaign })

  it('returns the available products, biggest discount first, and leaves out campaigns with nothing to buy', async () => {
    const r = await load()
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ id: 1, name: 'Early White Friday', maxPercent: 50, endsAt: '2026-11-30T00:00:00Z' })
    expect(r[0].products.map((p) => p.id)).toEqual([2, 1]) // sold product 3 is not shown
  })
  it('nothing after the end date, and the limit per campaign works', async () => {
    expect(await load(new Date('2026-11-30T00:00:00Z'))).toEqual([])
    expect((await load(NOW, 1))[0].products.map((p) => p.id)).toEqual([2])
  })
  it('without the campaign tables there is simply nothing', async () => {
    db.failing.add('promotions')
    expect(await load()).toEqual([])
  })
})
