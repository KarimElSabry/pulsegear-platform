// src/lib/finance/reports.ts
// The six management reports. They are views over analyze(): the same Analysis object feeds the dashboard,
// so totals in a report always equal the dashboard figures. No customer-identifying fields are included.

import { analyze, type Analysis } from './engine'
import { inRange } from './range'
import { round2 } from './money'
import { BELOW_OPERATING_LINE, type Dataset, type Filters } from './types'

export type ReportId = 'executive' | 'sales' | 'campaigns' | 'products' | 'costs' | 'quality'
export const REPORT_IDS: ReportId[] = ['executive', 'sales', 'campaigns', 'products', 'costs', 'quality']

export type ColumnType = 'text' | 'money' | 'int' | 'percent' | 'date'
export interface Column { key: string; label: string; type: ColumnType }
export type Cell = string | number | null
export type Row = Record<string, Cell>

export interface Report {
  id: ReportId
  title: string
  columns: Column[]
  rows: Row[]
  /** Last row summing the money/int columns, so a reader can tick the report against the dashboard. */
  totals: Row | null
  filters: Filters
  note: string
}

export const REPORT_TITLES: Record<ReportId, string> = {
  executive: 'Executive Performance Report',
  sales: 'Sales Transactions Report',
  campaigns: 'Campaign Performance Report',
  products: 'Product Profitability Report',
  costs: 'Costs and Expenses Report',
  quality: 'Data Quality and Financial Reconciliation Report',
}

const col = (key: string, label: string, type: ColumnType = 'text'): Column => ({ key, label, type })

function withTotals(columns: Column[], rows: Row[], label: string, firstKey: string, skip: string[] = []): Row {
  const totals: Row = {}
  for (const c of columns) {
    if (c.key === firstKey) totals[c.key] = label
    else if ((c.type === 'money' || c.type === 'int') && !skip.includes(c.key)) {
      totals[c.key] = round2(rows.reduce((a, r) => a + (typeof r[c.key] === 'number' ? (r[c.key] as number) : 0), 0))
    } else totals[c.key] = null
  }
  return totals
}

function executive(a: Analysis, egpPerEur?: number | null): Report {
  const t = a.totals
  const p = a.previous?.totals
  const def: [string, keyof typeof t | null, ColumnType, string][] = [
    ['Completed Orders', 'completedOrders', 'int', 'Orders that are completed and recognised as revenue (COD only once delivered)'],
    ['Gross Product Sales', 'grossProductSales', 'money', 'Unit price x quantity of recognised items, before discounts'],
    ['Discounts', 'discounts', 'money', 'List price minus price charged'],
    ['Refunds', 'refunds', 'money', 'Refunds against recognised orders (capped at order value)'],
    ['Net Sales Revenue', 'netSalesRevenue', 'money', 'Gross - discounts - refunds'],
    ['Cost of Goods Sold', 'cogs', 'money', 'Frozen unit-cost snapshots of items kept by the customer'],
    ['Gross Profit', 'grossProfit', 'money', 'Net sales revenue - COGS'],
    ['Gross Margin', 'grossMargin', 'percent', 'Gross profit / net sales revenue'],
    ['Shipping Revenue', 'shippingRevenue', 'money', 'Delivery fees charged'],
    ['Shipping and Fulfillment Costs', 'shippingAndFulfillmentCosts', 'money', 'Outbound + return shipping, packaging, failed-delivery'],
    ['Total Order Costs', 'orderCostsTotal', 'money', 'All order-level costs incl. payment fees, commission, other variable'],
    ['Contribution Before Ads', 'contributionBeforeAds', 'money', 'Gross profit + shipping revenue - order costs'],
    ['Advertising Spend', 'adSpend', 'money', 'Recorded ad spend in EGP'],
    ['Contribution After Ads', 'contributionAfterAds', 'money', 'Contribution before ads - advertising spend'],
    ['Operating Expenses', 'operatingExpenses', 'money', 'Period costs (excluding tax and interest)'],
    ['Operating Profit', 'operatingProfit', 'money', 'Contribution after ads - operating expenses'],
    ['Net Profit', 'netProfit', 'money', 'Operating profit - tax and interest; blank unless all required data exists'],
    ['Average Order Value', 'averageOrderValue', 'money', 'Net sales revenue / completed orders'],
    ['Cost per Completed Order', 'costPerCompletedOrder', 'money', 'Ad spend / completed orders'],
    ['ROAS', 'roas', 'int', 'Attributed revenue / ad spend. A revenue ratio, NOT profit'],
    ['Refund Rate', 'refundRate', 'percent', 'Refunds / gross product sales'],
    ['Failed Delivery Rate', 'failedDeliveryRate', 'percent', 'Failed deliveries / (completed + failed)'],
    ['Attribution Coverage', 'attributionCoverage', 'percent', 'Completed orders with attributed source / completed orders'],
    ['Missing Cost Records', 'missingCostRecords', 'int', 'Completed items without a product cost'],
    ['Collected Cash', 'collectedCash', 'money', 'Money actually received (separate from revenue)'],
    ['Outstanding Receivables', 'outstandingReceivables', 'money', 'Billed but not yet collected'],
  ]
  const eur = (v: number | null, type: ColumnType): number | null =>
    egpPerEur && type === 'money' && typeof v === 'number' ? round2(v / egpPerEur) : null
  const rows: Row[] = def.map(([metric, key, type, definition]) => {
    const cur = key ? (t[key] as number | null) : null
    const prev = key && p ? (p[key] as number | null) : null
    const change = typeof cur === 'number' && typeof prev === 'number' && prev !== 0 ? (cur - prev) / Math.abs(prev) : null
    const row: Row = { metric, current: cur, previous: prev ?? null, change, definition }
    if (egpPerEur) { row.current_eur = eur(cur, type); row.previous_eur = eur(prev ?? null, type) }
    return row
  })
  const columns = [col('metric', 'Metric'), col('current', 'Current Period (EGP)', 'money'), col('previous', 'Previous Period (EGP)', 'money')]
  if (egpPerEur) columns.push(col('current_eur', 'Current Period (EUR)', 'money'), col('previous_eur', 'Previous Period (EUR)', 'money'))
  columns.push(col('change', 'Change', 'percent'), col('definition', 'Definition'))
  return {
    id: 'executive', title: REPORT_TITLES.executive, filters: a.filters, totals: null, columns, rows,
    note: `Money in EGP${egpPerEur ? ` and EUR (1 EUR = ${egpPerEur.toFixed(2)} EGP)` : ''}. ROAS is a ratio. Percent rows hold fractions (0.25 = 25%). Blank = not available.`,
  }
}

function salesReport(a: Analysis, ds: Dataset): Report {
  const attr = new Map(ds.attributions.map((x) => [x.saleId, x]))
  const columns = [
    col('date', 'Date', 'date'), col('sale_id', 'Sale ID'), col('order_ref', 'Order Ref'), col('channel', 'Channel'),
    col('products', 'Products'), col('status', 'Status'), col('delivery_status', 'Delivery'), col('payment_method', 'Payment'),
    col('recognized', 'Counted As Revenue'), col('gross', 'Gross Sales', 'money'), col('discount', 'Discount', 'money'),
    col('refunds', 'Refunds', 'money'), col('net_revenue', 'Net Revenue', 'money'), col('cogs', 'COGS', 'money'),
    col('gross_profit', 'Gross Profit', 'money'), col('shipping_revenue', 'Shipping Revenue', 'money'),
    col('order_costs', 'Order Costs', 'money'), col('contribution', 'Contribution Before Ads', 'money'),
    col('cash_collected', 'Cash Collected', 'money'), col('outstanding', 'Outstanding', 'money'),
    col('attribution', 'Attribution'), col('campaign', 'Campaign'),
  ]
  const rows: Row[] = [...a.results]
    .sort((x, y) => x.sale.date.localeCompare(y.sale.date) || x.sale.id.localeCompare(y.sale.id))
    .map((r) => {
      const at = attr.get(r.sale.id)
      return {
        date: r.sale.date, sale_id: r.sale.id, order_ref: r.sale.orderRef, channel: r.sale.channel,
        products: r.sale.items.map((i) => (i.quantity > 1 ? `${i.productName} x${i.quantity}` : i.productName)).join('; '),
        status: r.sale.status, delivery_status: r.sale.deliveryStatus, payment_method: r.sale.paymentMethod,
        recognized: r.recognized ? 'yes' : `no (${r.notRecognizedReason})`,
        gross: r.gross, discount: r.discount, refunds: r.refunds, net_revenue: r.netRevenue, cogs: r.cogs,
        gross_profit: r.grossProfit, shipping_revenue: r.shippingRevenue, order_costs: r.orderCostsTotal,
        contribution: r.contributionBeforeAds, cash_collected: r.cashCollected, outstanding: r.outstanding,
        attribution: at?.status === 'attributed' ? 'attributed' : 'unknown', campaign: at?.status === 'attributed' ? at.utmCampaign : null,
      }
    })
  return {
    id: 'sales', title: REPORT_TITLES.sales, filters: a.filters, columns, rows,
    totals: withTotals(columns, rows, 'TOTAL', 'date'),
    note: 'One row per order in the selected filters. Customer names, phones and notes are never exported.',
  }
}

function campaignsReport(a: Analysis): Report {
  const columns = [
    col('platform', 'Platform'), col('campaign', 'Campaign'), col('spend', 'Spend', 'money'), col('leads', 'Leads', 'int'),
    col('qualified', 'Qualified Leads', 'int'), col('clicks', 'Contact Clicks', 'int'), col('orders', 'Attributed Completed Orders', 'int'),
    col('revenue', 'Attributed Revenue', 'money'), col('cpl', 'Cost per Lead', 'money'), col('cpql', 'Cost per Qualified Lead', 'money'),
    col('cpo', 'Cost per Completed Order', 'money'), col('roas', 'ROAS (revenue ratio, not profit)', 'int'),
    col('contrib_before', 'Contribution Before Ads', 'money'), col('contrib_after', 'Contribution After Ads', 'money'), col('flags', 'Flags'),
  ]
  const rows: Row[] = a.campaigns.rows.map((c) => ({
    platform: c.platform, campaign: c.campaign, spend: c.spend, leads: c.leads, qualified: c.qualifiedLeads, clicks: c.contactClicks,
    orders: c.attributedOrders, revenue: c.attributedRevenue, cpl: c.costPerLead, cpql: c.costPerQualifiedLead, cpo: c.costPerCompletedOrder,
    roas: c.roas, contrib_before: c.contributionBeforeAds, contrib_after: c.contributionAfterAds, flags: c.flags.join(', ') || null,
  }))
  return {
    id: 'campaigns', title: REPORT_TITLES.campaigns, filters: a.filters, columns, rows,
    totals: withTotals(columns, rows, 'TOTAL', 'platform'),
    note: `Attribution coverage: ${a.campaigns.attributionCoverage === null ? 'n/a' : Math.round(a.campaigns.attributionCoverage * 100) + '%'}. Unknown-source orders (${a.campaigns.unknownOrders}) are NOT assigned to any campaign. Spend with no attributed orders: ${a.campaigns.unmatchedSpend} EGP.`,
  }
}

function productsReport(a: Analysis): Report {
  const columns = [
    col('product', 'Product'), col('units', 'Units Sold', 'int'), col('net_revenue', 'Net Revenue', 'money'), col('cogs', 'COGS', 'money'),
    col('gross_profit', 'Gross Profit', 'money'), col('margin', 'Gross Margin', 'percent'),
    col('order_costs', 'Allocated Order Costs', 'money'), col('contribution', 'Contribution Before Ads', 'money'),
  ]
  const rows: Row[] = a.products.map((p) => ({
    product: p.productName, units: p.unitsSold, net_revenue: p.netSalesRevenue, cogs: p.cogs, gross_profit: p.grossProfit,
    margin: p.grossMargin, order_costs: p.allocatedOrderCosts, contribution: p.contributionBeforeAds,
  }))
  return {
    id: 'products', title: REPORT_TITLES.products, filters: a.filters, columns, rows,
    totals: withTotals(columns, rows, 'TOTAL', 'product'),
    note: 'Order-level costs and shipping revenue are split across the items of an order by item value; the split adds up exactly to the order.',
  }
}

export function costRows(ds: Dataset, a: Analysis): Row[] {
  const f = a.filters
  const inScope = new Set(a.results.map((r) => r.sale.id))
  const rows: Row[] = []

  for (const c of ds.orderCosts) {
    if (!inScope.has(c.saleId)) continue
    if (f.costCategory && c.category !== f.costCategory) continue
    rows.push({ type: 'order_cost', date: c.date, sale_id: c.saleId, category: c.category, amount: c.amount, note: c.note, source: c.source })
  }
  if (!a.isFiltered) {
    for (const e of ds.expenses) {
      if (!inRange(e.date, f.from, f.to)) continue
      if (f.costCategory && e.category !== f.costCategory) continue
      rows.push({ type: BELOW_OPERATING_LINE.includes(e.category) ? 'tax_interest' : 'operating_expense', date: e.date, sale_id: null, category: e.category, amount: e.amount, note: e.note, source: 'operating_expenses' })
    }
  }
  if (!f.costCategory) {
    for (const s of ds.spend) {
      if (!inRange(s.date, f.from, f.to)) continue
      rows.push({ type: 'ad_spend', date: s.date, sale_id: null, category: `${s.platform} / ${s.campaign}`, amount: s.amountEgp, note: null, source: 'marketing_spend' })
    }
  }
  return rows.sort((x, y) => String(x.date).localeCompare(String(y.date)))
}

function costsReport(a: Analysis, ds: Dataset): Report {
  const columns = [col('date', 'Date', 'date'), col('type', 'Type'), col('sale_id', 'Sale ID'), col('category', 'Category'), col('amount', 'Amount', 'money'), col('note', 'Note'), col('source', 'Source Table')]
  const rows = costRows(ds, a)
  return {
    id: 'costs', title: REPORT_TITLES.costs, filters: a.filters, columns, rows,
    totals: withTotals(columns, rows, 'TOTAL', 'date'),
    note: 'Order costs (per order), operating expenses (per period) and ad spend (per campaign day) are separate types and never overlap. Legacy sale commission appears as an order_cost with source legacy_commission.',
  }
}

export interface ReconciliationCheck { check: string; expected: number; actual: number; difference: number; status: 'ok' | 'mismatch' }

export function reconciliation(a: Analysis): ReconciliationCheck[] {
  const t = a.totals
  const mk = (check: string, expected: number, actual: number): ReconciliationCheck => {
    const difference = round2(actual - expected)
    return { check, expected: round2(expected), actual: round2(actual), difference, status: Math.abs(difference) <= 0.01 ? 'ok' : 'mismatch' }
  }
  const storedNet = a.results.filter((r) => r.recognized).reduce((s, r) => s + r.sale.recordedNet, 0)
  const computedPreRefund = a.results.reduce((s, r) => s + (r.gross - r.discount), 0)
  return [
    mk('Stored sale prices (recognised) = gross - discounts', storedNet, computedPreRefund),
    mk('Gross - discounts - refunds = net sales revenue', t.grossProductSales - t.discounts - t.refunds, t.netSalesRevenue),
    mk('Net revenue - COGS = gross profit', t.netSalesRevenue - t.cogs, t.grossProfit),
    mk('Sum of product rows = net sales revenue', t.netSalesRevenue, a.products.reduce((s, p) => s + p.netSalesRevenue, 0)),
    mk('Sum of product rows = contribution before ads', t.contributionBeforeAds, a.products.reduce((s, p) => s + p.contributionBeforeAds, 0)),
    mk('Sum of channel rows = net sales revenue', t.netSalesRevenue, a.channels.reduce((s, c) => s + c.netSalesRevenue, 0)),
    mk('Attributed + unattributed revenue = net sales revenue', t.netSalesRevenue, a.campaigns.attributedRevenue + a.campaigns.unattributedRevenue),
    mk('Campaign spend rows = advertising spend', t.adSpend, a.campaigns.totalSpend),
    mk('Gross profit + shipping revenue - order costs = contribution before ads', t.grossProfit + t.shippingRevenue - t.orderCostsTotal, t.contributionBeforeAds),
  ]
}

function qualityReport(a: Analysis): Report {
  const columns = [col('section', 'Section'), col('item', 'Item'), col('severity', 'Severity / Status'), col('count', 'Count / Expected', 'money'), col('actual', 'Actual', 'money'), col('difference', 'Difference', 'money'), col('detail', 'Detail / Record IDs')]
  const rows: Row[] = [
    ...reconciliation(a).map((c) => ({ section: 'Reconciliation', item: c.check, severity: c.status, count: c.expected, actual: c.actual, difference: c.difference, detail: null })),
    ...a.alerts.map((x) => ({ section: 'Data quality', item: x.message, severity: x.severity, count: x.count, actual: null, difference: null, detail: x.ids.join(', ') || null })),
  ]
  return { id: 'quality', title: REPORT_TITLES.quality, filters: a.filters, columns, rows, totals: null, note: 'Every reconciliation check must read "ok". Alerts list up to 10 record ids each.' }
}

/** Adds a "(EUR)" column after every money column, converting each row and the totals at one rate. */
export function withEurColumns(report: Report, egpPerEur: number): Report {
  const columns: Column[] = []
  for (const c of report.columns) {
    columns.push(c)
    if (c.type === 'money') columns.push({ key: `${c.key}_eur`, label: `${c.label} (EUR)`, type: 'money' })
  }
  const convert = (r: Row): Row => {
    const out: Row = { ...r }
    for (const c of report.columns) {
      if (c.type === 'money') out[`${c.key}_eur`] = typeof r[c.key] === 'number' ? round2((r[c.key] as number) / egpPerEur) : null
    }
    return out
  }
  return {
    ...report, columns, rows: report.rows.map(convert), totals: report.totals ? convert(report.totals) : null,
    note: `${report.note} EUR columns use 1 EUR = ${egpPerEur.toFixed(2)} EGP.`,
  }
}

export function buildReport(id: ReportId, ds: Dataset, filters: Filters, opts: { comparePrevious?: boolean; analysis?: Analysis; egpPerEur?: number | null } = {}): Report {
  const a = opts.analysis ?? analyze(ds, filters, { comparePrevious: id === 'executive' ? opts.comparePrevious ?? true : false })
  const rate = opts.egpPerEur && opts.egpPerEur > 0 ? opts.egpPerEur : null
  let report: Report
  switch (id) {
    case 'executive': return executive(a, rate)
    case 'sales': report = salesReport(a, ds); break
    case 'campaigns': report = campaignsReport(a); break
    case 'products': report = productsReport(a); break
    case 'costs': report = costsReport(a, ds); break
    case 'quality': return qualityReport(a)
  }
  return rate ? withEurColumns(report, rate) : report
}
