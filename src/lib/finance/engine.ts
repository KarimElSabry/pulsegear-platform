// src/lib/finance/engine.ts
// The single calculation entry point. The dashboard, the reports page and every export call analyze() and read
// from its result, so a figure can never differ between screens.

import { normalizeCampaign, sourceMatches, spendPlatformMatches } from './attribution'
import { campaignPerformance, type CampaignSummary } from './campaigns'
import { eachDay, inRange, previousRange } from './range'
import { ratio, round2, sum } from './money'
import { qualityAlerts, type QualityAlert } from './quality'
import { computeSale, type ItemLine, type SaleResult } from './sale'
import {
  BELOW_OPERATING_LINE,
  type CostCategory,
  type Dataset,
  type Filters,
  type Sale,
} from './types'

export interface Totals {
  completedOrders: number
  grossProductSales: number
  discounts: number
  refunds: number
  netSalesRevenue: number
  cogs: number
  grossProfit: number
  /** Gross profit / net sales revenue (null when there is no revenue). */
  grossMargin: number | null
  shippingRevenue: number
  costsByCategory: Record<CostCategory, number>
  orderCostsTotal: number
  /** Outbound + return shipping, packaging and failed-delivery costs. */
  shippingAndFulfillmentCosts: number
  contributionBeforeAds: number
  adSpend: number
  contributionAfterAds: number
  /** null when the view is filtered by order attributes (period costs cannot be split that way). */
  operatingExpenses: number | null
  operatingProfit: number | null
  taxAndInterest: number | null
  netProfit: number | null
  netProfitUnavailableReasons: string[]
  averageOrderValue: number | null
  costPerCompletedOrder: number | null
  roas: number | null
  refundRate: number | null
  failedDeliveryRate: number | null
  attributionCoverage: number | null
  missingCostRecords: number
  collectedCash: number
  cashRefunded: number
  outstandingReceivables: number
  failedDeliveries: number
}

export interface TrendPoint {
  date: string
  orders: number
  netSalesRevenue: number
  grossProfit: number
  contributionBeforeAds: number
  adSpend: number
  contributionAfterAds: number
}

export interface ChannelRow {
  channel: string
  orders: number
  netSalesRevenue: number
  grossProfit: number
  contributionBeforeAds: number
  averageOrderValue: number | null
  shareOfRevenue: number | null
}

export interface ProductRow {
  productKey: string
  productName: string
  unitsSold: number
  netSalesRevenue: number
  cogs: number
  grossProfit: number
  grossMargin: number | null
  allocatedOrderCosts: number
  contributionBeforeAds: number
}

export interface Analysis {
  filters: Filters
  isFiltered: boolean
  results: SaleResult[]
  totals: Totals
  previous: { range: { from: string; to: string }; totals: Totals } | null
  trend: TrendPoint[]
  channels: ChannelRow[]
  products: ProductRow[]
  campaigns: CampaignSummary
  alerts: QualityAlert[]
}

const ORDER_LEVEL_FILTERS: (keyof Filters)[] = ['channel', 'product', 'orderStatus', 'deliveryStatus']

function matchesProduct(sale: Sale, product: string): boolean {
  const q = product.trim().toLowerCase()
  if (!q) return true
  return sale.items.some((i) => String(i.productId) === q || i.productName.toLowerCase().includes(q))
}

export function filterSales(ds: Dataset, f: Filters): Sale[] {
  const attr = new Map(ds.attributions.map((a) => [a.saleId, a]))
  return ds.sales.filter((s) => {
    if (!inRange(s.date, f.from, f.to)) return false
    if (f.channel && s.channel.toLowerCase() !== f.channel.toLowerCase()) return false
    if (f.orderStatus && s.status !== f.orderStatus) return false
    if (f.deliveryStatus && s.deliveryStatus !== f.deliveryStatus) return false
    if (f.product && !matchesProduct(s, f.product)) return false
    if (f.source || f.campaign) {
      const a = attr.get(s.id)
      if (!a || a.status !== 'attributed') return false
      if (f.source && !sourceMatches(f.source, a.utmSource ?? a.lastNonDirectSource ?? a.closingChannel, a.utmMedium)) return false
      if (f.campaign && normalizeCampaign(a.utmCampaign) !== normalizeCampaign(f.campaign)) return false
    }
    return true
  })
}

function emptyTotals(): Totals {
  return {
    completedOrders: 0, grossProductSales: 0, discounts: 0, refunds: 0, netSalesRevenue: 0, cogs: 0, grossProfit: 0,
    grossMargin: null, shippingRevenue: 0,
    costsByCategory: {
      outbound_shipping: 0, return_shipping: 0, packaging: 0, payment_fee: 0, failed_delivery: 0,
      other_variable: 0, commission: 0,
    },
    orderCostsTotal: 0, shippingAndFulfillmentCosts: 0, contributionBeforeAds: 0, adSpend: 0, contributionAfterAds: 0,
    operatingExpenses: null, operatingProfit: null, taxAndInterest: null, netProfit: null, netProfitUnavailableReasons: [],
    averageOrderValue: null, costPerCompletedOrder: null, roas: null, refundRate: null, failedDeliveryRate: null,
    attributionCoverage: null, missingCostRecords: 0, collectedCash: 0, cashRefunded: 0, outstandingReceivables: 0,
    failedDeliveries: 0,
  }
}

function spendInScope(ds: Dataset, f: Filters) {
  return ds.spend.filter((s) => {
    if (!inRange(s.date, f.from, f.to)) return false
    if (f.source && !spendPlatformMatches(f.source, s.platform)) return false
    if (f.campaign && normalizeCampaign(s.campaign) !== normalizeCampaign(f.campaign)) return false
    return true
  })
}

function computeTotals(ds: Dataset, f: Filters, results: SaleResult[], attributedIds: Set<string>): Totals {
  const t = emptyTotals()
  const recognized = results.filter((r) => r.recognized)
  const isFiltered = ORDER_LEVEL_FILTERS.some((k) => f[k]) || !!f.source || !!f.campaign

  t.completedOrders = recognized.length
  t.grossProductSales = sum(results.map((r) => r.gross))
  t.discounts = sum(results.map((r) => r.discount))
  t.refunds = sum(results.map((r) => r.refunds))
  t.netSalesRevenue = sum(results.map((r) => r.netRevenue))
  t.cogs = sum(results.map((r) => r.cogs))
  t.grossProfit = sum(results.map((r) => r.grossProfit))
  t.grossMargin = ratio(t.grossProfit, t.netSalesRevenue)
  t.shippingRevenue = sum(results.map((r) => r.shippingRevenue))

  for (const cat of Object.keys(t.costsByCategory) as CostCategory[]) {
    t.costsByCategory[cat] = sum(results.map((r) => r.costsByCategory[cat]))
  }
  t.orderCostsTotal = sum(results.map((r) => r.orderCostsTotal))
  t.shippingAndFulfillmentCosts = round2(
    t.costsByCategory.outbound_shipping + t.costsByCategory.return_shipping +
    t.costsByCategory.packaging + t.costsByCategory.failed_delivery
  )
  t.contributionBeforeAds = sum(results.map((r) => r.contributionBeforeAds))

  t.adSpend = sum(spendInScope(ds, f).map((s) => s.amountEgp))
  t.contributionAfterAds = round2(t.contributionBeforeAds - t.adSpend)

  const expenses = ds.expenses.filter((e) => inRange(e.date, f.from, f.to))
  if (!isFiltered) {
    const operating = expenses.filter((e) => !BELOW_OPERATING_LINE.includes(e.category))
    const below = expenses.filter((e) => BELOW_OPERATING_LINE.includes(e.category))
    t.operatingExpenses = sum(operating.map((e) => e.amount))
    t.operatingProfit = round2(t.contributionAfterAds - t.operatingExpenses)
    t.taxAndInterest = sum(below.map((e) => e.amount))

    const reasons: string[] = []
    if (expenses.length === 0) reasons.push('no operating expenses recorded for this period')
    const missing = recognized.reduce((a, r) => a + r.missingCostItems, 0)
    if (missing > 0) reasons.push(`${missing} completed item(s) have no product cost`)
    t.netProfitUnavailableReasons = reasons
    t.netProfit = reasons.length === 0 ? round2(t.operatingProfit - t.taxAndInterest) : null
  } else {
    t.netProfitUnavailableReasons = ['filtered view: period costs are not split by order attributes']
  }

  t.averageOrderValue = ratio(t.netSalesRevenue, t.completedOrders) === null ? null : round2(t.netSalesRevenue / t.completedOrders)
  t.costPerCompletedOrder = t.completedOrders > 0 ? round2(t.adSpend / t.completedOrders) : null

  const attributedRevenue = sum(recognized.filter((r) => attributedIds.has(r.sale.id)).map((r) => r.netRevenue))
  const roas = ratio(attributedRevenue, t.adSpend)
  t.roas = roas === null ? null : round2(roas)

  const refundRate = ratio(t.refunds, t.grossProductSales)
  t.refundRate = refundRate === null ? null : refundRate
  t.failedDeliveries = results.filter((r) => r.sale.status === 'failed_delivery' || r.sale.deliveryStatus === 'failed').length
  t.failedDeliveryRate = ratio(t.failedDeliveries, t.completedOrders + t.failedDeliveries)
  t.attributionCoverage = ratio(recognized.filter((r) => attributedIds.has(r.sale.id)).length, recognized.length)
  t.missingCostRecords = recognized.reduce((a, r) => a + r.missingCostItems, 0)
  t.collectedCash = sum(results.map((r) => r.cashCollected))
  t.cashRefunded = sum(results.map((r) => r.cashRefunded))
  t.outstandingReceivables = sum(results.map((r) => r.outstanding))
  return t
}

function buildTrend(f: Filters, results: SaleResult[], ds: Dataset): TrendPoint[] {
  const days = eachDay(f.from, f.to)
  const bucketOf = (date: string) => (days.length > 92 ? date.slice(0, 7) + '-01' : date)
  const map = new Map<string, TrendPoint>()
  const point = (date: string) => {
    const key = bucketOf(date)
    let p = map.get(key)
    if (!p) {
      p = { date: key, orders: 0, netSalesRevenue: 0, grossProfit: 0, contributionBeforeAds: 0, adSpend: 0, contributionAfterAds: 0 }
      map.set(key, p)
    }
    return p
  }
  days.forEach((d) => point(d))
  for (const r of results) {
    const p = point(r.sale.date)
    if (r.recognized) p.orders += 1
    p.netSalesRevenue = round2(p.netSalesRevenue + r.netRevenue)
    p.grossProfit = round2(p.grossProfit + r.grossProfit)
    p.contributionBeforeAds = round2(p.contributionBeforeAds + r.contributionBeforeAds)
  }
  for (const s of spendInScope(ds, f)) {
    const p = point(s.date)
    p.adSpend = round2(p.adSpend + s.amountEgp)
  }
  const out = [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
  out.forEach((p) => { p.contributionAfterAds = round2(p.contributionBeforeAds - p.adSpend) })
  return out
}

function buildChannels(results: SaleResult[]): ChannelRow[] {
  const map = new Map<string, ChannelRow>()
  for (const r of results) {
    const key = r.sale.channel || 'unknown'
    const row = map.get(key) ?? { channel: key, orders: 0, netSalesRevenue: 0, grossProfit: 0, contributionBeforeAds: 0, averageOrderValue: null, shareOfRevenue: null }
    if (r.recognized) row.orders += 1
    row.netSalesRevenue = round2(row.netSalesRevenue + r.netRevenue)
    row.grossProfit = round2(row.grossProfit + r.grossProfit)
    row.contributionBeforeAds = round2(row.contributionBeforeAds + r.contributionBeforeAds)
    map.set(key, row)
  }
  const total = round2([...map.values()].reduce((a, r) => a + r.netSalesRevenue, 0))
  for (const row of map.values()) {
    row.averageOrderValue = row.orders > 0 ? round2(row.netSalesRevenue / row.orders) : null
    row.shareOfRevenue = ratio(row.netSalesRevenue, total)
  }
  return [...map.values()].sort((a, b) => b.netSalesRevenue - a.netSalesRevenue)
}

function buildProducts(results: SaleResult[]): ProductRow[] {
  const map = new Map<string, ProductRow>()
  const lines: ItemLine[] = results.flatMap((r) => r.lines)
  for (const l of lines) {
    const row = map.get(l.productKey) ?? {
      productKey: l.productKey, productName: l.productName, unitsSold: 0, netSalesRevenue: 0, cogs: 0,
      grossProfit: 0, grossMargin: null, allocatedOrderCosts: 0, contributionBeforeAds: 0,
    }
    if (l.gross > 0) row.unitsSold += l.quantity
    row.netSalesRevenue = round2(row.netSalesRevenue + l.net)
    row.cogs = round2(row.cogs + l.cogs)
    row.grossProfit = round2(row.grossProfit + l.grossProfit)
    row.allocatedOrderCosts = round2(row.allocatedOrderCosts + l.orderCosts)
    row.contributionBeforeAds = round2(row.contributionBeforeAds + l.contribution)
    map.set(l.productKey, row)
  }
  for (const row of map.values()) row.grossMargin = ratio(row.grossProfit, row.netSalesRevenue)
  return [...map.values()].sort((a, b) => b.grossProfit - a.grossProfit)
}

function analyzeRange(ds: Dataset, f: Filters) {
  const sales = filterSales(ds, f)
  const results = sales.map((s) => computeSale(s, ds.refunds, ds.orderCosts))
  const attributedIds = new Set(ds.attributions.filter((a) => a.status === 'attributed').map((a) => a.saleId))
  const totals = computeTotals(ds, f, results, attributedIds)
  return { results, totals }
}

export function analyze(ds: Dataset, filters: Filters, opts: { comparePrevious?: boolean } = {}): Analysis {
  const isFiltered = ORDER_LEVEL_FILTERS.some((k) => filters[k]) || !!filters.source || !!filters.campaign
  const { results, totals } = analyzeRange(ds, filters)

  let previous: Analysis['previous'] = null
  if (opts.comparePrevious) {
    const range = previousRange(filters.from, filters.to)
    previous = { range, totals: analyzeRange(ds, { ...filters, ...range }).totals }
  }

  // Campaign view only ever sees the filtered orders and in-scope spend, never double counts.
  const scopedSpend = spendInScope(ds, filters)
  const scopedTouch = ds.touchpoints.filter((t) => inRange(t.date, filters.from, filters.to))
  const campaigns = campaignPerformance(results, ds.attributions, scopedSpend, scopedTouch)

  // Operating costs only make sense for the whole business view.
  const alerts = qualityAlerts(
    results,
    { ...ds, expenses: ds.expenses.filter((e) => inRange(e.date, filters.from, filters.to)) },
    { operatingScopeIsFull: !isFiltered }
  )

  return {
    filters,
    isFiltered,
    results,
    totals,
    previous,
    trend: buildTrend(filters, results, ds),
    channels: buildChannels(results),
    products: buildProducts(results),
    campaigns,
    alerts,
  }
}
