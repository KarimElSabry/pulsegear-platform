import { describe, expect, it } from 'vitest'
import { analyze } from '../engine'
import { computeSale } from '../sale'
import { allocate, round2 } from '../money'
import { addDays, daysInRange, previousRange } from '../range'
import { attribution, cost, dataset, item, RANGE, refund, sale, spend, touch } from './fixtures'

const run = (ds: ReturnType<typeof dataset>, extra = {}) => analyze(ds, { ...RANGE, ...extra })

describe('completed orders', () => {
  it('computes revenue, COGS, gross profit and contribution for a simple prepaid order', () => {
    const s = sale({ shippingRevenue: 50 })
    const a = run(dataset({
      sales: [s],
      orderCosts: [cost(s.id, { category: 'outbound_shipping', amount: 40 }), cost(s.id, { category: 'packaging', amount: 10 })],
    }))
    const t = a.totals
    expect(t.completedOrders).toBe(1)
    expect(t.grossProductSales).toBe(1000)
    expect(t.netSalesRevenue).toBe(1000)
    expect(t.cogs).toBe(600)
    expect(t.grossProfit).toBe(400)
    expect(t.grossMargin).toBeCloseTo(0.4)
    expect(t.shippingRevenue).toBe(50)
    expect(t.orderCostsTotal).toBe(50)
    expect(t.contributionBeforeAds).toBe(400)
    expect(t.averageOrderValue).toBe(1000)
  })

  it('subtracts discounts from revenue', () => {
    const s = sale({ discount: 100 })
    const t = run(dataset({ sales: [s] })).totals
    expect(t.grossProductSales).toBe(1000)
    expect(t.discounts).toBe(100)
    expect(t.netSalesRevenue).toBe(900)
    expect(t.grossProfit).toBe(300)
  })

  it('uses the frozen cost snapshot, not any later product cost', () => {
    const s = sale({ items: [item({ unitCostSnapshot: 500 })] })
    expect(run(dataset({ sales: [s] })).totals.cogs).toBe(500)
  })

  it('ignores sales outside the date range', () => {
    const s = sale({ date: '2026-09-30' })
    expect(run(dataset({ sales: [s] })).totals.completedOrders).toBe(0)
  })
})

describe('cash on delivery and cash vs revenue', () => {
  it('is not revenue until delivered', () => {
    const s = sale({ paymentMethod: 'cod', deliveryStatus: 'shipped' })
    const t = run(dataset({ sales: [s] })).totals
    expect(t.completedOrders).toBe(0)
    expect(t.netSalesRevenue).toBe(0)
  })

  it('is revenue once delivered, and uncollected cash stays outstanding', () => {
    const s = sale({ paymentMethod: 'cod', deliveryStatus: 'delivered', cashCollected: null })
    const t = run(dataset({ sales: [s] })).totals
    expect(t.netSalesRevenue).toBe(1000)
    expect(t.collectedCash).toBe(0)
    expect(t.outstandingReceivables).toBe(1000)
  })

  it('keeps collected cash separate from revenue', () => {
    const s = sale({ paymentMethod: 'cod', deliveryStatus: 'delivered', cashCollected: 1000 })
    const t = run(dataset({ sales: [s] })).totals
    expect(t.netSalesRevenue).toBe(1000)
    expect(t.collectedCash).toBe(1000)
    expect(t.outstandingReceivables).toBe(0)
  })

  it('a deposit-only order shows revenue and the remaining balance as outstanding', () => {
    const s = sale({ paymentMethod: 'deposit', cashCollected: 300 })
    const t = run(dataset({ sales: [s] })).totals
    expect(t.collectedCash).toBe(300)
    expect(t.outstandingReceivables).toBe(700)
  })

  it('assumes legacy rows were fully collected and flags it', () => {
    const s = sale({ legacy: true, paymentMethod: null, deliveryStatus: null })
    const a = run(dataset({ sales: [s] }))
    expect(a.totals.collectedCash).toBe(1000)
    expect(a.alerts.some((x) => x.code === 'cash_assumed')).toBe(true)
  })
})

describe('cancellations and failed deliveries', () => {
  it('cancelled orders have no revenue or COGS but their costs still count', () => {
    const s = sale({ status: 'cancelled', deliveryStatus: null })
    const t = run(dataset({ sales: [s], orderCosts: [cost(s.id, { category: 'packaging', amount: 20 })] })).totals
    expect(t.completedOrders).toBe(0)
    expect(t.netSalesRevenue).toBe(0)
    expect(t.cogs).toBe(0)
    expect(t.orderCostsTotal).toBe(20)
    expect(t.contributionBeforeAds).toBe(-20)
  })

  it('failed deliveries cost money, earn nothing, and drive the failure rate', () => {
    const ok = sale()
    const bad = sale({ status: 'failed_delivery', deliveryStatus: 'failed' })
    const t = run(dataset({
      sales: [ok, bad],
      orderCosts: [cost(bad.id, { category: 'failed_delivery', amount: 80 }), cost(bad.id, { category: 'return_shipping', amount: 60 })],
    })).totals
    expect(t.completedOrders).toBe(1)
    expect(t.failedDeliveries).toBe(1)
    expect(t.failedDeliveryRate).toBeCloseTo(0.5)
    expect(t.costsByCategory.failed_delivery).toBe(80)
    expect(t.shippingAndFulfillmentCosts).toBe(140)
    expect(t.contributionBeforeAds).toBe(400 - 140)
  })

  it('does not count refunds recorded against an unrecognised order', () => {
    const s = sale({ status: 'cancelled' })
    const a = run(dataset({ sales: [s], refunds: [refund(s.id, { amount: 500 })] }))
    expect(a.totals.refunds).toBe(0)
    expect(a.alerts.some((x) => x.code === 'refund_on_unrecognized')).toBe(true)
  })
})

describe('returns and refunds', () => {
  it('a restocked full return restores COGS and nets revenue to zero', () => {
    const s = sale()
    const t = run(dataset({
      sales: [s],
      refunds: [refund(s.id, { amount: 1000, returnedQuantity: 1, restocked: true, saleItemId: s.items[0].id })],
      orderCosts: [cost(s.id, { category: 'return_shipping', amount: 60 })],
    })).totals
    expect(t.netSalesRevenue).toBe(0)
    expect(t.cogs).toBe(0)
    expect(t.grossProfit).toBe(0)
    expect(t.contributionBeforeAds).toBe(-60)
    expect(t.refundRate).toBe(1)
  })

  it('a refund where the goods are not resellable keeps the cost', () => {
    const s = sale()
    const t = run(dataset({ sales: [s], refunds: [refund(s.id, { amount: 1000, returnedQuantity: 1, restocked: false })] })).totals
    expect(t.cogs).toBe(600)
    expect(t.grossProfit).toBe(-600)
  })

  it('handles a partial refund without touching COGS', () => {
    const s = sale()
    const t = run(dataset({ sales: [s], refunds: [refund(s.id, { amount: 250 })] })).totals
    expect(t.refunds).toBe(250)
    expect(t.netSalesRevenue).toBe(750)
    expect(t.cogs).toBe(600)
    expect(t.grossProfit).toBe(150)
    expect(t.refundRate).toBeCloseTo(0.25)
  })

  it('adds several partial refunds together', () => {
    const s = sale()
    const t = run(dataset({ sales: [s], refunds: [refund(s.id, { amount: 100 }), refund(s.id, { amount: 150 })] })).totals
    expect(t.refunds).toBe(250)
  })

  it('caps refunds at the order value and raises an error alert', () => {
    const s = sale()
    const a = run(dataset({ sales: [s], refunds: [refund(s.id, { amount: 1500 })] }))
    expect(a.totals.refunds).toBe(1000)
    expect(a.totals.netSalesRevenue).toBe(0)
    expect(a.alerts.find((x) => x.code === 'refund_exceeds_order')?.severity).toBe('error')
  })

  it('refunding one product of a multi-product order only restores that product', () => {
    const a1 = item({ productId: 1, productName: 'Watch', unitPrice: 1000, unitCostSnapshot: 600 })
    const b1 = item({ productId: 2, productName: 'Strap', unitPrice: 200, unitCostSnapshot: 50 })
    const s = sale({ items: [a1, b1] })
    const r = refund(s.id, { amount: 200, saleItemId: b1.id, returnedQuantity: 1, restocked: true })
    const res = computeSale(s, [r], [])
    expect(res.netRevenue).toBe(1000)
    expect(res.cogs).toBe(600)
    expect(res.lines.find((l) => l.productName === 'Strap')?.net).toBe(0)
  })
})

describe('multiple products and multiple costs', () => {
  const a1 = item({ productId: 1, productName: 'Watch', unitPrice: 1000, unitCostSnapshot: 600 })
  const b1 = item({ productId: 2, productName: 'Strap', unitPrice: 500, unitCostSnapshot: 300, quantity: 2 })

  it('sums items, applies the order discount and order-level costs once', () => {
    const s = sale({ items: [a1, b1], discount: 200, shippingRevenue: 60 })
    const t = run(dataset({
      sales: [s],
      orderCosts: [cost(s.id, { category: 'packaging', amount: 30 }), cost(s.id, { category: 'payment_fee', amount: 70 })],
    })).totals
    expect(t.grossProductSales).toBe(2000)
    expect(t.netSalesRevenue).toBe(1800)
    expect(t.cogs).toBe(1200)
    expect(t.grossProfit).toBe(600)
    expect(t.orderCostsTotal).toBe(100)
    expect(t.contributionBeforeAds).toBe(560)
    expect(t.completedOrders).toBe(1)
  })

  it('product rows add up exactly to the order, even with awkward rounding', () => {
    const items = [item({ productId: 1, productName: 'A', unitPrice: 333.33 }), item({ productId: 2, productName: 'B', unitPrice: 333.33 }), item({ productId: 3, productName: 'C', unitPrice: 333.34 })]
    const s = sale({ items, discount: 100.01, shippingRevenue: 33.33 })
    const a = run(dataset({ sales: [s], orderCosts: [cost(s.id, { amount: 77.77 })] }))
    expect(round2(a.products.reduce((x, p) => x + p.netSalesRevenue, 0))).toBe(a.totals.netSalesRevenue)
    expect(round2(a.products.reduce((x, p) => x + p.contributionBeforeAds, 0))).toBe(a.totals.contributionBeforeAds)
  })

  it('does not leak one order\'s costs into another', () => {
    const s1 = sale()
    const s2 = sale()
    const a = run(dataset({ sales: [s1, s2], orderCosts: [cost(s1.id, { amount: 90 })] }))
    const r1 = a.results.find((r) => r.sale.id === s1.id)!
    const r2 = a.results.find((r) => r.sale.id === s2.id)!
    expect(r1.orderCostsTotal).toBe(90)
    expect(r2.orderCostsTotal).toBe(0)
    expect(a.totals.orderCostsTotal).toBe(90)
  })

  it('counts legacy commission once as a cost', () => {
    const s = sale()
    const t = run(dataset({ sales: [s], orderCosts: [cost(s.id, { category: 'commission', amount: 120, source: 'legacy_commission' })] })).totals
    expect(t.costsByCategory.commission).toBe(120)
    expect(t.contributionBeforeAds).toBe(400 - 120)
  })
})

describe('advertising, attribution and campaigns', () => {
  it('flags spend with no attributed orders as unmatched and never assigns it', () => {
    const s = sale()
    const a = run(dataset({ sales: [s], spend: [spend({ campaign: 'Ghost', amountEgp: 500 })] }))
    expect(a.campaigns.unmatchedSpend).toBe(500)
    expect(a.campaigns.rows[0].flags).toContain('spend_without_orders')
    expect(a.campaigns.attributedRevenue).toBe(0)
    expect(a.totals.roas).toBe(0) // money spent, nothing attributed back
  })

  it('ROAS is null when nothing was spent', () => {
    const s = sale()
    expect(run(dataset({ sales: [s], attributions: [attribution(s.id)] })).totals.roas).toBeNull()
  })

  it('keeps unknown attribution unknown (no campaign gets the revenue)', () => {
    const s = sale()
    const a = run(dataset({ sales: [s], spend: [spend()], attributions: [attribution(s.id, { status: 'unknown', utmCampaign: 'Fenix Launch' })] }))
    expect(a.campaigns.unknownOrders).toBe(1)
    expect(a.campaigns.unattributedRevenue).toBe(1000)
    expect(a.totals.attributionCoverage).toBe(0)
  })

  it('assigns an attributed sale to exactly one campaign and computes ROAS, CPO and contribution', () => {
    const s = sale({ shippingRevenue: 0 })
    const a = run(dataset({ sales: [s], spend: [spend({ amountEgp: 250 })], attributions: [attribution(s.id)] }))
    const row = a.campaigns.rows.find((r) => r.campaign === 'Fenix Launch')!
    expect(row.attributedOrders).toBe(1)
    expect(row.attributedRevenue).toBe(1000)
    expect(row.roas).toBe(4)
    expect(row.costPerCompletedOrder).toBe(250)
    expect(row.contributionBeforeAds).toBe(400)
    expect(row.contributionAfterAds).toBe(150)
    expect(a.totals.attributionCoverage).toBe(1)
  })

  it('does not duplicate revenue if an attribution row is repeated', () => {
    const s = sale()
    const a = run(dataset({ sales: [s], attributions: [attribution(s.id), attribution(s.id)] }))
    expect(a.campaigns.attributedOrders).toBe(1)
    expect(a.campaigns.attributedRevenue).toBeLessThanOrEqual(a.totals.netSalesRevenue)
  })

  it('matches spend and sales case- and alias-insensitively', () => {
    const s = sale()
    const a = run(dataset({ sales: [s], spend: [spend({ platform: 'IG', campaign: ' fenix launch ' })], attributions: [attribution(s.id, { utmSource: 'Instagram', utmCampaign: 'FENIX LAUNCH' })] }))
    expect(a.campaigns.rows).toHaveLength(1)
    expect(a.campaigns.rows[0].spend).toBe(300)
  })

  it('shows orders attributed to a campaign with no recorded spend', () => {
    const s = sale()
    const a = run(dataset({ sales: [s], attributions: [attribution(s.id)] }))
    expect(a.campaigns.rows[0].flags).toContain('orders_without_spend')
    expect(a.campaigns.rows[0].roas).toBeNull()
  })

  it('does not treat a WhatsApp click as a lead; leads are distinct visitors who asked or reserved', () => {
    const s = sale()
    const a = run(dataset({
      sales: [s], spend: [spend({ amountEgp: 300 })], attributions: [attribution(s.id)],
      touchpoints: [
        touch({ event: 'whatsapp_click', visitorId: 'v1' }),
        touch({ event: 'whatsapp_click', visitorId: 'v2' }),
        touch({ event: 'reservation_created', visitorId: 'v1' }),
        touch({ event: 'product_request_submitted', visitorId: 'v1' }),
        touch({ event: 'product_request_submitted', visitorId: 'v3' }),
      ],
    }))
    const row = a.campaigns.rows[0]
    expect(row.contactClicks).toBe(2)
    expect(row.leads).toBe(2)
    expect(row.costPerLead).toBe(150)
    expect(row.qualifiedLeads).toBe(0)
    expect(row.costPerQualifiedLead).toBeNull()
  })

  it('campaign revenue never exceeds total revenue across many orders', () => {
    const sales = [sale(), sale(), sale({ items: [item({ unitPrice: 400 })] })]
    const a = run(dataset({ sales, attributions: [attribution(sales[0].id), attribution(sales[2].id, { utmCampaign: 'Other' })] }))
    const attributed = a.campaigns.rows.reduce((x, r) => x + r.attributedRevenue, 0)
    expect(attributed + a.campaigns.unattributedRevenue).toBe(a.totals.netSalesRevenue)
  })
})

describe('profit levels', () => {
  const s = sale({ shippingRevenue: 100 })
  const base = () => dataset({
    sales: [s],
    orderCosts: [cost(s.id, { amount: 60 })],
    spend: [spend({ amountEgp: 90, date: '2026-10-03' })],
  })

  it('separates contribution before ads, after ads, operating profit and net profit', () => {
    const ds = base()
    ds.expenses = [
      { id: 'e1', category: 'rent', amount: 100, date: '2026-10-10', note: null },
      { id: 'e2', category: 'tax', amount: 20, date: '2026-10-11', note: null },
    ]
    const t = run(ds).totals
    expect(t.contributionBeforeAds).toBe(400 + 100 - 60)
    expect(t.contributionAfterAds).toBe(440 - 90)
    expect(t.operatingExpenses).toBe(100)
    expect(t.operatingProfit).toBe(350 - 100)
    expect(t.taxAndInterest).toBe(20)
    expect(t.netProfit).toBe(250 - 20)
  })

  it('does not show net profit without operating expenses, and says why', () => {
    const t = run(base()).totals
    expect(t.netProfit).toBeNull()
    expect(t.netProfitUnavailableReasons.join(' ')).toMatch(/operating expenses/)
    expect(t.operatingProfit).toBe(t.contributionAfterAds)
  })

  it('does not show net profit when product costs are missing', () => {
    const ds = base()
    ds.sales = [sale({ items: [item({ unitCostSnapshot: null })] })]
    ds.expenses = [{ id: 'e1', category: 'rent', amount: 10, date: '2026-10-10', note: null }]
    const t = run(ds).totals
    expect(t.missingCostRecords).toBe(1)
    expect(t.netProfit).toBeNull()
  })

  it('hides period-level profit when order filters are active', () => {
    const t = run(base(), { channel: 'whatsapp' }).totals
    expect(t.operatingProfit).toBeNull()
    expect(t.netProfit).toBeNull()
  })
})

describe('filters and comparison', () => {
  it('filters by channel, status and campaign', () => {
    const w = sale({ channel: 'whatsapp' })
    const i = sale({ channel: 'instagram' })
    const ds = dataset({ sales: [w, i], attributions: [attribution(i.id)] })
    expect(run(ds, { channel: 'instagram' }).totals.completedOrders).toBe(1)
    expect(run(ds, { campaign: 'fenix launch' }).totals.completedOrders).toBe(1)
    expect(run(ds, { orderStatus: 'cancelled' }).totals.completedOrders).toBe(0)
  })

  it('previous period has equal length and ends the day before', () => {
    expect(previousRange('2026-10-01', '2026-10-31')).toEqual({ from: '2026-08-31', to: '2026-09-30' })
    expect(daysInRange('2026-10-01', '2026-10-31')).toBe(31)
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
  })

  it('computes the previous period for comparison', () => {
    const cur = sale({ date: '2026-10-05' })
    const prev = sale({ date: '2026-09-10', items: [item({ unitPrice: 500 })] })
    const a = analyze(dataset({ sales: [cur, prev] }), RANGE, { comparePrevious: true })
    expect(a.previous?.totals.netSalesRevenue).toBe(500)
    expect(a.totals.netSalesRevenue).toBe(1000)
  })

  it('trend covers every day and adds up to the totals', () => {
    const s = sale({ date: '2026-10-05' })
    const a = run(dataset({ sales: [s], spend: [spend({ date: '2026-10-07', amountEgp: 100 })] }))
    expect(a.trend).toHaveLength(31)
    expect(round2(a.trend.reduce((x, p) => x + p.netSalesRevenue, 0))).toBe(a.totals.netSalesRevenue)
    expect(round2(a.trend.reduce((x, p) => x + p.adSpend, 0))).toBe(a.totals.adSpend)
  })
})

describe('data quality', () => {
  it('flags missing costs, mismatched stored prices, duplicate order refs and a missing migration', () => {
    const s1 = sale({ orderRef: 'A1', items: [item({ unitCostSnapshot: null })] })
    const s2 = sale({ orderRef: 'A1', recordedNet: 999 })
    const a = run(dataset({ sales: [s1, s2], missingTables: ['order_costs'] }))
    const codes = a.alerts.map((x) => x.code)
    expect(codes).toContain('missing_cost')
    expect(codes).toContain('reconciliation_mismatch')
    expect(codes).toContain('duplicate_order_ref')
    expect(codes).toContain('migration_not_applied')
  })
})

describe('money helpers', () => {
  it('allocate splits exactly', () => {
    const parts = allocate(100, [1, 1, 1])
    expect(round2(parts.reduce((a, b) => a + b, 0))).toBe(100)
    expect(allocate(10, [0, 0])).toEqual([0, 0])
    expect(allocate(5, [])).toEqual([])
  })
})
