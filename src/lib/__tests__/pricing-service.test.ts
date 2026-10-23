import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { applyAnchors, applyChanges, cleanSettings, loadProducts, loadSettings, parseApprovals, recentBatches, runDaily, stillProposed, saveProductFlags, saveSettings, undoBatch } from '../pricing-service'
import { DEFAULT_PRICING } from '../repricing'

const asDb = (f: FakeDb) => f as unknown as SupabaseClient
const rateFetch = (rate: number) => async () => ({ ok: true, json: async () => ({ rates: { EGP: rate } }) })

function seed(f: FakeDb, rows: Record<string, unknown>[] = []) {
  f.seed('products', rows.length ? rows : [
    { id: 1, title: 'Fenix', slug: 'fenix', status: 'available', price_egp: 40000, follows_eur: true, price_anchor_egp: 40000, price_anchor_rate: 57, original_price: 500 },
    { id: 2, title: 'Used', slug: 'used', status: 'available', price_egp: 9000, follows_eur: false },
    { id: 3, title: 'Sold', slug: 'sold', status: 'sold', price_egp: 9000, follows_eur: true, price_anchor_egp: 9000, price_anchor_rate: 57 },
  ])
  f.seed('pricing_settings', [{ id: 1, auto_apply: false, threshold_pct: 2, max_change_pct: 10, allow_lower: true, min_margin_pct: 15, target_margin_pct: 20, landed_factor: 1, manual_rate: null }])
  f.seed('price_changes', [])
  f.seed('job_runs', [])
}

describe('settings', () => {
  it('cleans odd input into safe values', () => {
    const s = cleanSettings({ autoApply: 'yes', thresholdPct: '-5', maxChangePct: 500, minMarginPct: 'abc', targetMarginPct: 5, landedFactor: 0 })
    expect(s).toMatchObject({ autoApply: false, thresholdPct: 0, maxChangePct: 30, minMarginPct: 15, landedFactor: 0.5 })
    expect(s.targetMarginPct).toBeGreaterThanOrEqual(s.minMarginPct)
  })
  it('loads defaults before the migration and saves afterwards', async () => {
    const f = new FakeDb()
    f.failing.add('pricing_settings')
    expect((await loadSettings(asDb(f))).ready).toBe(false)
    const g = new FakeDb(); seed(g)
    const saved = await saveSettings(asDb(g), { ...DEFAULT_PRICING, autoApply: true, maxChangePct: 8 }, 61.5)
    expect(saved.ok).toBe(true)
    const s = await loadSettings(asDb(g))
    expect(s).toMatchObject({ ready: true, manualRate: 61.5 })
    expect(s.settings).toMatchObject({ autoApply: true, maxChangePct: 8 })
  })
  it('creates the settings row when it is missing', async () => {
    const g = new FakeDb(); g.seed('pricing_settings', [])
    expect((await saveSettings(asDb(g), DEFAULT_PRICING, null)).ok).toBe(true)
    expect(g.rows('pricing_settings')).toHaveLength(1)
  })
})

describe('loadProducts', () => {
  it('returns only items for sale', async () => {
    const f = new FakeDb(); seed(f)
    const { products } = await loadProducts(asDb(f))
    expect(products.map((p) => p.id).sort()).toEqual([1, 2])
  })
})

describe('applyChanges and undoBatch', () => {
  it('writes prices, logs each change, and undo puts everything back', async () => {
    const f = new FakeDb(); seed(f)
    const res = await applyChanges(asDb(f), [{ id: 1, from: 40000, to: 42500 }], 60.5, 'test')
    expect(res.applied).toHaveLength(1)
    expect(f.rows('products').find((p) => p.id === 1)!.price_egp).toBe(42500)
    expect(f.rows('price_changes')).toHaveLength(1)
    const undo = await undoBatch(asDb(f), res.batchId)
    expect(undo).toEqual({ restored: 1, skipped: 0 })
    expect(f.rows('products').find((p) => p.id === 1)!.price_egp).toBe(40000)
    // a second undo does nothing
    expect(await undoBatch(asDb(f), res.batchId)).toEqual({ restored: 0, skipped: 0 })
  })
  it('skips a product whose price changed since you looked (what you approved is what is applied)', async () => {
    const f = new FakeDb(); seed(f)
    const res = await applyChanges(asDb(f), [{ id: 1, from: 39000, to: 42500 }], 60.5, 'test')
    expect(res.applied).toHaveLength(0)
    expect(res.skipped[0]).toMatchObject({ id: 1 })
    expect(f.rows('products').find((p) => p.id === 1)!.price_egp).toBe(40000)
    expect(f.rows('price_changes')).toHaveLength(0)
  })
  it('does not apply a race: price edited between the read and the write', async () => {
    const f = new FakeDb(); seed(f)
    const orig = f.from.bind(f)
    // simulate the admin editing the price right after the read
    let edited = false
    f.from = ((table: string) => {
      const q = orig(table)
      if (table === 'products' && !edited) {
        const m = q.maybeSingle.bind(q)
        q.maybeSingle = (() => Promise.resolve(m()).then((v) => { edited = true; f.rows('products').find((p) => p.id === 1)!.price_egp = 41000; return v })) as unknown as typeof q.maybeSingle
      }
      return q
    }) as typeof f.from
    const res = await applyChanges(asDb(f), [{ id: 1, from: 40000, to: 42500 }], 60.5, 'test')
    expect(res.applied).toHaveLength(0)
    expect(f.rows('products').find((p) => p.id === 1)!.price_egp).toBe(41000)
  })
  it('first-time setup starts following at today\'s rate, and undo stops it again', async () => {
    const f = new FakeDb(); seed(f)
    const res = await applyChanges(asDb(f), [{ id: 2, from: 9000, to: 9500 }], 60.5, 'setup', { startFollowing: true })
    const p = f.rows('products').find((x) => x.id === 2)!
    expect(p).toMatchObject({ price_egp: 9500, follows_eur: true, price_anchor_egp: 9500, price_anchor_rate: 60.5 })
    await undoBatch(asDb(f), res.batchId)
    expect(f.rows('products').find((x) => x.id === 2)).toMatchObject({ price_egp: 9000, follows_eur: false })
  })
  it('undo leaves a price alone if it was changed again afterwards', async () => {
    const f = new FakeDb(); seed(f)
    const res = await applyChanges(asDb(f), [{ id: 1, from: 40000, to: 42500 }], 60.5, 'test')
    f.rows('products').find((p) => p.id === 1)!.price_egp = 43000
    expect(await undoBatch(asDb(f), res.batchId)).toEqual({ restored: 0, skipped: 1 })
    expect(f.rows('products').find((p) => p.id === 1)!.price_egp).toBe(43000)
  })
  it('lists recent batches', async () => {
    const f = new FakeDb(); seed(f)
    await applyChanges(asDb(f), [{ id: 1, from: 40000, to: 42500 }], 60.5, 'test')
    const b = await recentBatches(asDb(f))
    expect(b).toHaveLength(1)
    expect(b[0]).toMatchObject({ count: 1, undone: false, rate: 60.5 })
  })
  it('rejects an invalid price', async () => {
    const f = new FakeDb(); seed(f)
    expect((await applyChanges(asDb(f), [{ id: 1, from: 40000, to: -5 }], 60, 't')).skipped).toHaveLength(1)
  })
})

describe('anchors and flags', () => {
  it('anchors followed products without changing the price', async () => {
    const f = new FakeDb(); seed(f, [{ id: 5, title: 'A', status: 'available', price_egp: 8000, follows_eur: true, price_anchor_rate: null }])
    expect(await applyAnchors(asDb(f), [{ id: 5, price: 8000, rate: 60 }])).toBe(1)
    expect(f.rows('products')[0]).toMatchObject({ price_egp: 8000, price_anchor_egp: 8000, price_anchor_rate: 60 })
  })
  it('ticking "follows the euro" anchors at today\'s price and saves the cost', async () => {
    const f = new FakeDb(); seed(f)
    await saveProductFlags(asDb(f), [{ id: 2, follows: true, costEur: 120 }], 60)
    expect(f.rows('products').find((p) => p.id === 2)).toMatchObject({ follows_eur: true, cost_eur: 120, price_anchor_egp: 9000, price_anchor_rate: 60 })
  })
})

describe('runDaily', () => {
  it('proposes (and tells you once) when auto-apply is off', async () => {
    const f = new FakeDb(); seed(f)
    const notify = vi.fn(async (_html: string) => true)
    const a = await runDaily(asDb(f), { notify, fetchImpl: rateFetch(60.5) })
    expect(a).toMatchObject({ ok: true, proposed: 1, followed: 1 })
    expect(f.rows('products').find((p) => p.id === 1)!.price_egp).toBe(40000) // untouched
    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify.mock.calls[0][0]).toContain('waiting for your approval')
    await runDaily(asDb(f), { notify, fetchImpl: rateFetch(60.5) })
    expect(notify).toHaveBeenCalledTimes(1) // same proposal: no repeat message
  })
  it('applies the plan when auto-apply is on, and logs it for undo', async () => {
    const f = new FakeDb(); seed(f)
    f.rows('pricing_settings')[0].auto_apply = true
    const notify = vi.fn(async (_html: string) => true)
    const r = await runDaily(asDb(f), { notify, fetchImpl: rateFetch(60.5) })
    expect(r.changed).toBe(1)
    expect(f.rows('products').find((p) => p.id === 1)!.price_egp).toBe(42450)
    expect(f.rows('price_changes')).toHaveLength(1)
    expect(notify.mock.calls[0][0]).toContain('Prices updated')
  })
  it('does nothing when no product follows the euro, or before the migration', async () => {
    const f = new FakeDb(); seed(f, [{ id: 1, title: 'A', status: 'available', price_egp: 100, follows_eur: false }])
    const notify = vi.fn(async (_html: string) => true)
    expect(await runDaily(asDb(f), { notify, fetchImpl: rateFetch(60) })).toMatchObject({ ok: true, followed: 0 })
    const g = new FakeDb(); g.failing.add('pricing_settings')
    expect(await runDaily(asDb(g), { notify, fetchImpl: rateFetch(60) })).toMatchObject({ ok: true })
    expect(notify).not.toHaveBeenCalled()
  })
  it('fails loudly when the rate is unavailable', async () => {
    const f = new FakeDb(); seed(f)
    const r = await runDaily(asDb(f), { notify: async () => true, fetchImpl: async () => ({ ok: false, json: async () => ({}) }) })
    expect(r.ok).toBe(false)
  })
  it('a manual rate wins over the live one', async () => {
    const f = new FakeDb(); seed(f)
    f.rows('pricing_settings')[0].manual_rate = 64
    const r = await runDaily(asDb(f), { notify: async () => true, fetchImpl: rateFetch(57) })
    expect(r.rate).toBe(64)
  })
})

describe('approvals', () => {
  it('parses the checkbox values and drops junk and duplicates', () => {
    expect(parseApprovals(['1:40000:42500', '1:40000:43000', 'x', '2:100:0', '3:5000.5:5500', 42, '4:1:2:3'])).toEqual([
      { id: 1, from: 40000, to: 42500 }, { id: 3, from: 5000.5, to: 5500 },
    ])
  })
  it('only applies what the fresh calculation still proposes', () => {
    const fresh = [{ id: 1, from: 40000, to: 42500 }, { id: 2, from: 9000, to: 9500 }]
    const r = stillProposed([{ id: 1, from: 40000, to: 42500 }, { id: 2, from: 9000, to: 9000.5 }, { id: 9, from: 1, to: 2 }], fresh)
    expect(r.ok).toEqual([{ id: 1, from: 40000, to: 42500 }])
    expect(r.stale).toBe(2)
  })
})
