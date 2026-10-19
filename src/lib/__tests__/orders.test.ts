import { describe, expect, it, vi } from 'vitest'
import { etaDays, progressPct, stageMessage } from '../milestones'
import { getEgpPerEur, toEur } from '../finance/fx'
import { netSoFar } from '../finance/summary'
import type { Totals } from '../finance/engine'

const totals = (over: Partial<Totals> = {}): Totals => ({
  completedOrders: 5, grossProductSales: 0, discounts: 0, refunds: 0, netSalesRevenue: 136025, cogs: 0, grossProfit: 32623.69, grossMargin: 0.24,
  shippingRevenue: 0, costsByCategory: {} as Totals['costsByCategory'], orderCostsTotal: 0, shippingAndFulfillmentCosts: 0,
  contributionBeforeAds: 32323.69, adSpend: 5159.46, contributionAfterAds: 27164.23, operatingExpenses: 0, operatingProfit: 27164.23,
  taxAndInterest: 0, netProfit: null, netProfitUnavailableReasons: [], averageOrderValue: null, costPerCompletedOrder: null, roas: null,
  refundRate: null, failedDeliveryRate: null, attributionCoverage: null, missingCostRecords: 0, collectedCash: 0, cashRefunded: 0,
  outstandingReceivables: 0, failedDeliveries: 0, ...over,
})

describe('netSoFar', () => {
  it('always returns a figure and lists what is missing', () => {
    const r = netSoFar(totals())
    expect(r.value).toBe(27164.23)
    expect(r.complete).toBe(false)
    expect(r.missing).toEqual(['no shipping or other order costs entered', 'no monthly expenses entered'])
  })
  it('subtracts the expenses and tax that were entered, and is complete when nothing is missing', () => {
    const r = netSoFar(totals({ orderCostsTotal: 300, operatingExpenses: 4000, taxAndInterest: 100, netProfit: 23064.23 }))
    expect(r.value).toBe(23064.23)
    expect(r.complete).toBe(true)
    expect(r.missing).toEqual([])
  })
  it('works on a filtered view where period costs are unavailable', () => {
    expect(netSoFar(totals({ operatingExpenses: null, operatingProfit: null, taxAndInterest: null })).value).toBe(27164.23)
  })
  it('flags sales with no product cost', () => {
    expect(netSoFar(totals({ orderCostsTotal: 1, operatingExpenses: 1, missingCostRecords: 2 })).missing[0]).toMatch(/2 sale\(s\) have no product cost/)
  })
})

describe('EUR conversion', () => {
  const fetchOk = (egp: number) => (async () => ({ ok: true, json: async () => ({ rates: { EGP: egp } }) })) as never
  it('a manual rate wins, then the live rate, and a silly live rate is refused', async () => {
    expect(await getEgpPerEur(60, fetchOk(55))).toEqual({ rate: 60, source: 'manual' })
    expect(await getEgpPerEur(null, fetchOk(55))).toEqual({ rate: 55, source: 'live' })
    expect(await getEgpPerEur(null, fetchOk(0.5))).toEqual({ rate: null, source: null })
    expect(await getEgpPerEur(null, (async () => { throw new Error('down') }) as never)).toEqual({ rate: null, source: null })
  })
  it('converts and rounds, and returns null without a rate', () => {
    expect(toEur(136025, 55)).toBe(2473.18)
    expect(toEur(100, null)).toBeNull()
    expect(toEur(null, 55)).toBeNull()
  })
})

describe('progress', () => {
  it('computes percent, can exceed 100, never negative', () => {
    expect(progressPct(2500, 5000)).toBe(50)
    expect(progressPct(5500, 5000)).toBe(110)
    expect(progressPct(-10, 5000)).toBe(0)
    expect(progressPct(10, 0)).toBe(0)
  })
  it('stage messages and ETA', () => {
    expect(stageMessage(10)).toMatch(/getting started/i)
    expect(stageMessage(100)).toMatch(/reached/i)
    expect(etaDays(1000, 100)).toBe(10)
    expect(etaDays(1001, 100)).toBe(11)
    expect(etaDays(0, 0)).toBe(0)
    expect(etaDays(500, 0)).toBeNull()
  })
})
