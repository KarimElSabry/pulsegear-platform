import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from './fakeDb'

const db = new FakeDb()
const assertAdmin = vi.fn()
const recordServerEvent = vi.fn()

vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => db }))
vi.mock('@/lib/admin-auth', () => ({ assertAdmin: () => assertAdmin() }))
vi.mock('@/lib/tracking/server', () => ({ recordServerEvent: (e: unknown) => recordServerEvent(e) }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { analyze } from '@/lib/finance/engine'
import { mapAttributions, mapLegacyCommission, mapOrderCosts, mapRefunds, mapSales, mapSpend } from '@/lib/finance/load'
import type { Dataset } from '@/lib/finance/types'
import * as actions from '../finance-actions'

const SALE = '11111111-1111-4111-8111-111111111111'
const form = (o: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.set(k, v)
  return f
}

function dataset(): Dataset {
  return {
    sales: mapSales(db.rows('sales'), db.rows('sale_items')),
    refunds: mapRefunds(db.rows('refunds')),
    orderCosts: [...mapOrderCosts(db.rows('order_costs')), ...mapLegacyCommission(db.rows('sales'))],
    expenses: [], spend: mapSpend(db.rows('marketing_spend')), attributions: mapAttributions(db.rows('sales_attribution')),
    touchpoints: [], missingTables: [],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  assertAdmin.mockResolvedValue(undefined)
  db.tables = {}
  db.seed('sales', [{
    id: SALE, product_name: 'Fenix 6X', cost_egp: 600, selling_price_egp: 1000, profit_egp: 400, commission_egp: 0,
    sale_channel: 'whatsapp', sale_date: '2026-10-05', discount_egp: 0, shipping_revenue_egp: 0, status: 'completed',
    delivery_status: null, payment_method: null, cash_collected_egp: null, cash_collected_at: null, product_id: null,
  }])
  db.seed('products', [{ id: 7, title: 'Strap', cost_egp: 30 }, { id: 8, title: 'No cost', cost_egp: null }])
})

describe('security and validation', () => {
  it('refuses everything when the admin session is missing', async () => {
    assertAdmin.mockRejectedValue(new Error('UNAUTHORIZED'))
    const r = await actions.addOperatingExpense(null, form({ category: 'rent', amount_egp: '100', expense_date: '2026-10-01' }))
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/session expired/)
    expect(db.rows('operating_expenses')).toHaveLength(0)
  })

  it('validates input on the server (unknown category, negative amount, bad date, bad id)', async () => {
    expect((await actions.addOperatingExpense(null, form({ category: 'hax', amount_egp: '1', expense_date: '2026-10-01' }))).ok).toBe(false)
    expect((await actions.addOperatingExpense(null, form({ category: 'rent', amount_egp: '-1', expense_date: '2026-10-01' }))).ok).toBe(false)
    expect((await actions.addOperatingExpense(null, form({ category: 'rent', amount_egp: '1', expense_date: '2026-02-31' }))).ok).toBe(false)
    expect((await actions.addOrderCost(null, form({ sale_id: "x'; drop table sales;--", category: 'packaging', amount_egp: '1' }))).ok).toBe(false)
    expect(db.rows('operating_expenses')).toHaveLength(0)
  })

  it('does not allow commission to be entered as an order cost (it already lives on the sale row)', async () => {
    const r = await actions.addOrderCost(null, form({ sale_id: SALE, category: 'commission', amount_egp: '10' }))
    expect(r.ok).toBe(false)
    expect(db.rows('order_costs')).toHaveLength(0)
  })

  it('reports an unknown sale instead of inserting orphan rows', async () => {
    const r = await actions.addOrderCost(null, form({ sale_id: '22222222-2222-4222-8222-222222222222', category: 'packaging', amount_egp: '10' }))
    expect(r).toEqual({ ok: false, message: 'Sale not found' })
  })
})

describe('sale details', () => {
  it('saves status, delivery, payment, discount, shipping and cash, and records business events', async () => {
    const r = await actions.saveSaleDetails(null, form({
      sale_id: SALE, status: 'completed', delivery_status: 'delivered', payment_method: 'cod', order_ref: 'A-1',
      discount_egp: '0', shipping_revenue_egp: '50', cash_collected_egp: '1050',
    }))
    expect(r.ok).toBe(true)
    const row = db.rows('sales')[0]
    expect(row).toMatchObject({ delivery_status: 'delivered', payment_method: 'cod', order_ref: 'A-1', shipping_revenue_egp: 50, cash_collected_egp: 1050 })
    expect(row.cash_collected_at).toBeTruthy()
    const events = recordServerEvent.mock.calls.map((c) => c[0].event)
    expect(events).toContain('order_delivered')
    expect(events).toContain('payment_confirmed')
    expect(events).not.toContain('sale_completed') // it was already completed
  })

  it('a COD sale that has not been delivered stays out of revenue', async () => {
    await actions.saveSaleDetails(null, form({ sale_id: SALE, status: 'completed', delivery_status: 'shipped', payment_method: 'cod', discount_egp: '0', shipping_revenue_egp: '0' }))
    const a = analyze(dataset(), { from: '2026-10-01', to: '2026-10-31' })
    expect(a.totals.netSalesRevenue).toBe(0)
  })
})

describe('multi-product orders', () => {
  it('first converts the old single product into a real line, then adds the new one and recalculates', async () => {
    await actions.saveSaleDetails(null, form({ sale_id: SALE, status: 'completed', discount_egp: '100', shipping_revenue_egp: '0' }))
    const r = await actions.addSaleItem(null, form({ sale_id: SALE, product_id: '7', quantity: '2', unit_price_egp: '200' }))
    expect(r.ok).toBe(true)

    const items = db.rows('sale_items')
    expect(items).toHaveLength(2)
    expect(items.map((i) => i.product_name)).toEqual(['Fenix 6X', 'Strap'])
    expect(items[1].unit_cost_egp_snapshot).toBe(30) // frozen from the product's cost at this moment

    // the old 1000 price was already net of the 100 discount, so its line is 1100 gross.
    // gross = 1100 + 2*200 = 1500, minus the 100 discount = 1400; cost = 600 + 2*30 = 660
    expect(db.rows('sales')[0]).toMatchObject({ selling_price_egp: 1400, cost_egp: 660, profit_egp: 740 })

    const a = analyze(dataset(), { from: '2026-10-01', to: '2026-10-31' })
    expect(a.totals.netSalesRevenue).toBe(1400)
    expect(a.totals.cogs).toBe(660)
    expect(a.totals.grossProfit).toBe(740)
    expect(a.alerts.some((x) => x.code === 'reconciliation_mismatch')).toBe(false)
  })

  it('later changes to a product cost never rewrite a recorded sale', async () => {
    await actions.addSaleItem(null, form({ sale_id: SALE, product_id: '7', quantity: '1', unit_price_egp: '100' }))
    await actions.setProductCost(null, form({ product_id: '7', cost_egp: '999' }))
    expect(db.rows('sale_items')[1].unit_cost_egp_snapshot).toBe(30)
  })

  it('rejects a product that does not exist and a line without any name', async () => {
    expect((await actions.addSaleItem(null, form({ sale_id: SALE, product_id: '999', quantity: '1', unit_price_egp: '1' }))).ok).toBe(false)
    expect((await actions.addSaleItem(null, form({ sale_id: SALE, quantity: '1', unit_price_egp: '1' }))).ok).toBe(false)
    expect(db.rows('sale_items')).toHaveLength(0)
  })

  it('a product with no cost leaves the snapshot empty, which the reports flag', async () => {
    await actions.addSaleItem(null, form({ sale_id: SALE, product_id: '8', quantity: '1', unit_price_egp: '100' }))
    expect(db.rows('sale_items')[1].unit_cost_egp_snapshot).toBeNull()
    const a = analyze(dataset(), { from: '2026-10-01', to: '2026-10-31' })
    expect(a.totals.missingCostRecords).toBe(1)
  })
})

describe('refunds', () => {
  it('records a partial refund that flows into the totals', async () => {
    const r = await actions.addRefund(null, form({ sale_id: SALE, amount_egp: '250', refunded_at: '2026-10-08' }))
    expect(r.ok).toBe(true)
    expect(recordServerEvent.mock.calls.map((c) => c[0].event)).toContain('refund_issued')
    const a = analyze(dataset(), { from: '2026-10-01', to: '2026-10-31' })
    expect(a.totals.refunds).toBe(250)
    expect(a.totals.netSalesRevenue).toBe(750)
  })

  it('refuses refunds that would exceed the order value, across several refunds', async () => {
    expect((await actions.addRefund(null, form({ sale_id: SALE, amount_egp: '700' }))).ok).toBe(true)
    const r = await actions.addRefund(null, form({ sale_id: SALE, amount_egp: '400' }))
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/more than the order value/)
    expect(db.rows('refunds')).toHaveLength(1)
  })
})

describe('attribution', () => {
  const base = { sale_id: SALE, status: 'attributed', utm_source: 'instagram', utm_campaign: 'Fenix Launch' }

  it('refuses to attribute without written evidence', async () => {
    const r = await actions.saveAttribution(null, form(base))
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/evidence/i)
    expect(db.rows('sales_attribution')).toHaveLength(0)
  })

  it('stores an evidenced attribution once per sale (re-saving updates, never duplicates)', async () => {
    await actions.saveAttribution(null, form({ ...base, evidence: 'Customer said they saw the Reel' }))
    await actions.saveAttribution(null, form({ ...base, utm_campaign: 'Spring', evidence: 'Corrected: Spring ad' }))
    expect(db.rows('sales_attribution')).toHaveLength(1)
    expect(db.rows('sales_attribution')[0]).toMatchObject({ utm_campaign: 'Spring', status: 'attributed' })
  })

  it('uses a tracked reservation as evidence, and refuses when nothing was tracked', async () => {
    const none = await actions.saveAttribution(null, form({ sale_id: SALE, status: 'attributed', ref_type: 'reservation', ref_id: '7' }))
    expect(none.ok).toBe(false)
    expect(none.message).toMatch(/No tracked source/)

    db.seed('marketing_touchpoints', [{ id: 'tp1', ref_type: 'reservation', ref_id: '7', utm_source: 'instagram', utm_medium: 'paid', utm_campaign: 'Fenix Launch', first_touch_source: 'instagram', last_non_direct_source: 'instagram' }])
    const ok = await actions.saveAttribution(null, form({ sale_id: SALE, status: 'attributed', ref_type: 'reservation', ref_id: '7' }))
    expect(ok.ok).toBe(true)
    expect(db.rows('sales_attribution')[0]).toMatchObject({ utm_campaign: 'Fenix Launch', model: 'last_non_direct', status: 'attributed' })
    expect(String(db.rows('sales_attribution')[0].evidence)).toContain('reservation #7')
  })

  it('"unknown" clears any previous campaign so revenue is no longer assigned', async () => {
    await actions.saveAttribution(null, form({ ...base, evidence: 'said so' }))
    await actions.saveAttribution(null, form({ sale_id: SALE, status: 'unknown' }))
    expect(db.rows('sales_attribution')[0]).toMatchObject({ status: 'unknown', utm_campaign: null, evidence: null })
    const a = analyze(dataset(), { from: '2026-10-01', to: '2026-10-31' })
    expect(a.campaigns.attributedOrders).toBe(0)
  })
})

describe('advertising spend', () => {
  it('rejects the identical manual entry twice', async () => {
    const f = { platform: 'Instagram', campaign: 'Fenix Launch', spend_date: '2026-10-04', amount: '300' }
    expect((await actions.addSpend(null, form(f))).ok).toBe(true)
    const again = await actions.addSpend(null, form({ ...f, platform: ' instagram ' }))
    expect(again.ok).toBe(false)
    expect(again.message).toMatch(/already recorded/)
    expect(db.rows('marketing_spend')).toHaveLength(1)
  })

  it('imports a CSV, skips repeats, reports bad rows, and importing again adds nothing', async () => {
    const csv = ['platform,campaign,date,currency,amount', 'ig,A,2026-10-01,EGP,100', 'ig,A,2026-10-01,EGP,100', 'ig,B,2026-10-02,EGP,50', 'ig,B,bad-date,EGP,5'].join('\n')
    const first = await actions.importSpendCsv(null, form({ csv_text: csv }))
    expect(first.message).toMatch(/2 new row\(s\) imported/)
    expect(first.message).toMatch(/1 repeated in the file/)
    expect(first.message).toMatch(/1 rejected: line 5/)
    expect(db.rows('marketing_spend')).toHaveLength(2)

    const second = await actions.importSpendCsv(null, form({ csv_text: csv }))
    expect(second.message).toMatch(/0 new row\(s\) imported/)
    expect(second.message).toMatch(/2 already existed/)
    expect(db.rows('marketing_spend')).toHaveLength(2)
  })

  it('rejects an empty import and an oversized file', async () => {
    expect((await actions.importSpendCsv(null, form({}))).ok).toBe(false)
    const big = new File(['x'.repeat(1_000_001)], 'big.csv')
    const f = new FormData(); f.set('file', big)
    expect((await actions.importSpendCsv(null, f)).message).toMatch(/larger than 1 MB/)
  })
})

describe('product cost', () => {
  it('rejects an unknown product', async () => {
    expect((await actions.setProductCost(null, form({ product_id: '404', cost_egp: '10' }))).ok).toBe(false)
  })
})
