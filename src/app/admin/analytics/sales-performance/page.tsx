// src/app/admin/analytics/sales-performance/page.tsx

import Link from 'next/link'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { analyze, type Totals } from '@/lib/finance/engine'
import { loadDataset } from '@/lib/finance/load'
import { netSoFar } from '@/lib/finance/summary'
import { getEgpPerEur, toEur } from '@/lib/finance/fx'
import { filtersToQuery, parseParams, PRESETS, type SearchParams } from '@/lib/finance/params'
import type { ReportId } from '@/lib/finance/reports'
import TrendChart from './TrendChart'

export const dynamic = 'force-dynamic'

const egp = (n: number | null) => (n === null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const pct = (n: number | null) => (n === null ? '—' : (n * 100).toFixed(1) + '%')
const num = (n: number | null) => (n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 }))

type Kpi = {
  label: string
  key: keyof Totals
  fmt: (n: number | null) => string
  /** Which direction is good, for colouring the change. */
  good: 'up' | 'down'
  report: ReportId
  hint?: string
}

const KPIS: Kpi[] = [
  { label: 'Completed Orders', key: 'completedOrders', fmt: num, good: 'up', report: 'sales' },
  { label: 'Net Sales Revenue', key: 'netSalesRevenue', fmt: egp, good: 'up', report: 'sales', hint: 'After discounts and refunds' },
  { label: 'Gross Profit', key: 'grossProfit', fmt: egp, good: 'up', report: 'sales', hint: 'Revenue - product cost at time of sale' },
  { label: 'Gross Margin', key: 'grossMargin', fmt: pct, good: 'up', report: 'products', hint: 'Gross profit / revenue' },
  { label: 'Advertising Spend', key: 'adSpend', fmt: egp, good: 'down', report: 'costs' },
  { label: 'Shipping & Fulfillment Costs', key: 'shippingAndFulfillmentCosts', fmt: egp, good: 'down', report: 'costs' },
  { label: 'Contribution Before Ads', key: 'contributionBeforeAds', fmt: egp, good: 'up', report: 'sales' },
  { label: 'Contribution After Ads', key: 'contributionAfterAds', fmt: egp, good: 'up', report: 'executive' },
  { label: 'Operating Profit', key: 'operatingProfit', fmt: egp, good: 'up', report: 'executive', hint: 'After period expenses' },
  { label: 'Net Profit', key: 'netProfit', fmt: egp, good: 'up', report: 'executive', hint: 'Only when data is complete' },
  { label: 'Average Order Value', key: 'averageOrderValue', fmt: egp, good: 'up', report: 'sales' },
  { label: 'Cost per Completed Order', key: 'costPerCompletedOrder', fmt: egp, good: 'down', report: 'campaigns' },
  { label: 'ROAS', key: 'roas', fmt: (n) => (n === null ? '—' : n.toFixed(2) + 'x'), good: 'up', report: 'campaigns', hint: 'Revenue ratio, not profit' },
  { label: 'Refund Rate', key: 'refundRate', fmt: pct, good: 'down', report: 'sales' },
  { label: 'Failed Delivery Rate', key: 'failedDeliveryRate', fmt: pct, good: 'down', report: 'sales' },
  { label: 'Attribution Coverage', key: 'attributionCoverage', fmt: pct, good: 'up', report: 'campaigns', hint: 'Orders with a known source' },
  { label: 'Missing Cost Records', key: 'missingCostRecords', fmt: num, good: 'down', report: 'quality' },
]

function Delta({ cur, prev, good }: { cur: number | null; prev: number | null | undefined; good: 'up' | 'down' }) {
  if (cur === null || prev === null || prev === undefined || prev === 0) return <span className="text-zinc-600 text-xs">no previous data</span>
  const change = (cur - prev) / Math.abs(prev)
  if (Math.abs(change) < 0.0005) return <span className="text-zinc-500 text-xs">no change</span>
  const up = change > 0
  const isGood = (up && good === 'up') || (!up && good === 'down')
  return <span className={`text-xs font-semibold ${isGood ? 'text-green-400' : 'text-red-400'}`}>{up ? '▲' : '▼'} {Math.abs(change * 100).toFixed(1)}% vs previous</span>
}

const inputClass = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'

export default async function SalesPerformancePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await assertAdmin()
  const { filters, preset, compare } = parseParams(await searchParams)

  const supabase = createAdminSupabaseClient()
  const ds = await loadDataset(supabase, filters)
  const a = analyze(ds, filters, { comparePrevious: compare })
  const t = a.totals
  const net = netSoFar(t)
  const fx = await getEgpPerEur()
  const eurOf = (n: number | null) => { const v = toEur(n, fx.rate); return v === null ? null : '≈ €' + v.toLocaleString('en-US', { maximumFractionDigits: 0 }) }
  const EUR_KEYS: (keyof Totals)[] = ['netSalesRevenue', 'grossProfit', 'adSpend', 'shippingAndFulfillmentCosts', 'contributionBeforeAds', 'contributionAfterAds', 'operatingProfit', 'netProfit', 'averageOrderValue', 'costPerCompletedOrder']
  const channels = [...new Set(ds.sales.map((s) => s.channel))].sort()
  const trace = (report: ReportId) => `/admin/analytics/reports?${filtersToQuery(filters, { report })}`

  const breakdown: [string, number | null, 'sub' | 'total' | 'plain'][] = [
    ['Gross product sales', t.grossProductSales, 'plain'],
    ['− Discounts', -t.discounts, 'sub'],
    ['− Refunds', -t.refunds, 'sub'],
    ['= Net sales revenue', t.netSalesRevenue, 'total'],
    ['− Cost of goods sold', -t.cogs, 'sub'],
    ['= Gross profit', t.grossProfit, 'total'],
    ['+ Shipping revenue', t.shippingRevenue, 'sub'],
    ['− Outbound shipping', -t.costsByCategory.outbound_shipping, 'sub'],
    ['− Return shipping', -t.costsByCategory.return_shipping, 'sub'],
    ['− Packaging', -t.costsByCategory.packaging, 'sub'],
    ['− Payment processing fees', -t.costsByCategory.payment_fee, 'sub'],
    ['− Failed delivery costs', -t.costsByCategory.failed_delivery, 'sub'],
    ['− Commission', -t.costsByCategory.commission, 'sub'],
    ['− Other variable costs', -t.costsByCategory.other_variable, 'sub'],
    ['= Contribution before ads', t.contributionBeforeAds, 'total'],
    ['− Advertising spend', -t.adSpend, 'sub'],
    ['= Contribution after ads', t.contributionAfterAds, 'total'],
    ['− Operating expenses', t.operatingExpenses === null ? null : -t.operatingExpenses, 'sub'],
    ['= Operating profit', t.operatingProfit, 'total'],
    ['− Tax and interest', t.taxAndInterest === null ? null : -t.taxAndInterest, 'sub'],
    ['= Net profit (final, needs every cost entered)', t.netProfit, 'total'],
    ['= Net result so far (costs entered)', net.value, 'total'],
  ]

  const severityStyle = { error: 'border-red-500/40 bg-red-500/10 text-red-300', warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', info: 'border-zinc-700 bg-zinc-800/50 text-zinc-300' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">Sales Performance</h1>
          <p className="text-zinc-500 text-sm mt-1">{filters.from} to {filters.to}{a.previous ? ` · compared with ${a.previous.range.from} to ${a.previous.range.to}` : ''} · amounts in EGP, with euros beside them</p>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/admin/analytics/finance" className="text-purple-400 hover:text-purple-300">Financial records</Link>
          <Link href="/admin/analytics/ad-spend" className="text-purple-400 hover:text-purple-300">Ad spend</Link>
          <Link href={trace('executive')} className="text-purple-400 hover:text-purple-300">Reports & export</Link>
        </div>
      </div>

      <form method="get" className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs text-gray-400">Period
          <select name="preset" defaultValue={preset} className={inputClass + ' block'}>
            {PRESETS.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">From<input type="date" name="from" defaultValue={filters.from} className={inputClass + ' block'} /></label>
        <label className="space-y-1 text-xs text-gray-400">To<input type="date" name="to" defaultValue={filters.to} className={inputClass + ' block'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Channel
          <select name="channel" defaultValue={filters.channel ?? ''} className={inputClass + ' block'}>
            <option value="">All</option>{channels.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">Source<input name="source" defaultValue={filters.source ?? ''} placeholder="instagram" className={inputClass + ' block w-32'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Campaign<input name="campaign" defaultValue={filters.campaign ?? ''} className={inputClass + ' block w-36'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Product<input name="product" defaultValue={filters.product ?? ''} placeholder="id or name" className={inputClass + ' block w-36'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Order status
          <select name="orderStatus" defaultValue={filters.orderStatus ?? ''} className={inputClass + ' block'}>
            <option value="">All</option>{['pending', 'completed', 'cancelled', 'failed_delivery'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">Delivery
          <select name="deliveryStatus" defaultValue={filters.deliveryStatus ?? ''} className={inputClass + ' block'}>
            <option value="">All</option>{['pending', 'shipped', 'delivered', 'failed', 'returned'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-400 pb-2"><input type="checkbox" name="compare" value="1" defaultChecked={compare} /> Compare previous</label>
        <button className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-lg">Apply</button>
        {!compare && <input type="hidden" name="compare" value="0" />}
      </form>

      {a.alerts.length > 0 && (
        <section>
          <h2 className="text-white text-xl font-bold mb-3">Financial & data-quality alerts</h2>
          <div className="space-y-2">
            {a.alerts.map((al) => (
              <div key={al.code} className={`border rounded-xl px-4 py-3 text-sm ${severityStyle[al.severity]}`}>
                <span className="font-bold uppercase text-xs mr-2">{al.severity}</span>{al.message}
                {al.count > 0 && al.code !== 'migration_not_applied' && <span className="opacity-70"> · {al.count} record(s){al.ids.length ? ` e.g. ${al.ids.slice(0, 3).map((i) => i.slice(0, 8)).join(', ')}` : ''}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-600/20 to-gray-900 border border-purple-500/30 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Net sales revenue</p>
          <p className="text-4xl font-black text-white mt-1">{egp(t.netSalesRevenue)} <span className="text-lg text-zinc-400">EGP</span></p>
          {eurOf(t.netSalesRevenue) && <p className="text-2xl font-bold text-purple-300 mt-1">{eurOf(t.netSalesRevenue)}</p>}
          <p className="text-[11px] text-zinc-500 mt-2">What customers paid in this period, after discounts and refunds. Always shown, whatever costs you have entered.</p>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-gray-900 border border-green-500/30 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Net result so far</p>
          <p className={`text-4xl font-black mt-1 ${net.value < 0 ? 'text-red-400' : 'text-white'}`}>{egp(net.value)} <span className="text-lg text-zinc-400">EGP</span></p>
          {eurOf(net.value) && <p className="text-2xl font-bold text-green-300 mt-1">{eurOf(net.value)}</p>}
          <p className="text-[11px] text-zinc-500 mt-2">Revenue minus product cost, order costs, ad spend and monthly expenses, using only what you have entered.</p>
          {net.missing.length > 0
            ? <p className="text-[11px] text-yellow-400/90 mt-1">Not final: {net.missing.join('; ')}.</p>
            : <p className="text-[11px] text-green-400/90 mt-1">All known costs are included. This equals Net Profit.</p>}
        </div>
        {fx.rate && <p className="md:col-span-2 text-[11px] text-zinc-600">EUR at 1 EUR = {fx.rate.toFixed(2)} EGP ({fx.source === 'live' ? 'live rate, refreshed hourly' : 'manual'}). <Link href="/admin/milestones" className="text-purple-400 hover:text-purple-300">Track a euro milestone →</Link></p>}
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-3">Key figures</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {KPIS.map((k) => {
            const cur = t[k.key] as number | null
            const prev = a.previous ? (a.previous.totals[k.key] as number | null) : undefined
            return (
              <div key={k.key} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-zinc-400">{k.label}</p>
                <p className="text-2xl font-black text-white mt-1">{k.fmt(cur)}</p>
                {EUR_KEYS.includes(k.key) && eurOf(cur) && <p className="text-sm text-zinc-400">{eurOf(cur)}</p>}
                <div className="mt-1 min-h-4">{a.previous && <Delta cur={cur} prev={prev} good={k.good} />}</div>
                {k.hint && <p className="text-[11px] text-zinc-600 mt-1">{k.hint}</p>}
                {k.key === 'netProfit' && t.netProfit === null && <p className="text-[11px] text-yellow-400/80 mt-1">{t.netProfitUnavailableReasons.join('; ')}</p>}
                <Link href={trace(k.report)} className="text-[11px] text-purple-400 hover:text-purple-300 mt-2 inline-block">Trace to records →</Link>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">Collected cash</p><p className="text-2xl font-black text-white">{egp(t.collectedCash)}</p><p className="text-sm text-zinc-400">{eurOf(t.collectedCash)}</p><p className="text-[11px] text-zinc-600">Money actually received. Separate from revenue.</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">Outstanding to collect</p><p className="text-2xl font-black text-white">{egp(t.outstandingReceivables)}</p><p className="text-sm text-zinc-400">{eurOf(t.outstandingReceivables)}</p><p className="text-[11px] text-zinc-600">Billed on completed orders, not yet received.</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">Refunded cash</p><p className="text-2xl font-black text-white">{egp(t.cashRefunded)}</p><p className="text-sm text-zinc-400">{eurOf(t.cashRefunded)}</p><p className="text-[11px] text-zinc-600">Paid back to customers.</p></div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Sales and revenue trend</h2>
        <TrendChart data={a.trend} />
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Revenue and profit breakdown</h2>
        <table className="w-full text-sm">
          <tbody>
            {breakdown.map(([label, value, kind]) => (
              <tr key={label} className={`border-b border-gray-800/60 ${kind === 'total' ? 'bg-gray-800/40 font-bold text-white' : 'text-gray-300'}`}>
                <td className="py-2 px-2">{label}</td>
                <td className="py-2 px-2 text-right">{value === null ? <span className="text-zinc-600">not final yet</span> : egp(value)}</td>
                <td className="py-2 px-2 text-right text-zinc-400">{value === null ? '' : (eurOf(value) ?? '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
        <h2 className="text-white font-bold mb-4">Sales channel performance</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-zinc-500 border-b border-gray-800 text-left"><th className="py-2">Channel</th><th className="text-right">Orders</th><th className="text-right">Net revenue</th><th className="text-right">Share</th><th className="text-right">Gross profit</th><th className="text-right">Contribution</th><th className="text-right">AOV</th></tr></thead>
          <tbody>
            {a.channels.map((c) => (
              <tr key={c.channel} className="border-b border-gray-800/50 text-gray-300">
                <td className="py-2 font-medium text-white">{c.channel}</td><td className="text-right">{c.orders}</td><td className="text-right">{egp(c.netSalesRevenue)}<div className="text-[11px] text-zinc-500">{eurOf(c.netSalesRevenue)}</div></td>
                <td className="text-right">{pct(c.shareOfRevenue)}</td><td className="text-right">{egp(c.grossProfit)}<div className="text-[11px] text-zinc-500">{eurOf(c.grossProfit)}</div></td><td className="text-right">{egp(c.contributionBeforeAds)}<div className="text-[11px] text-zinc-500">{eurOf(c.contributionBeforeAds)}</div></td><td className="text-right">{egp(c.averageOrderValue)}</td>
              </tr>
            ))}
            {a.channels.length === 0 && <tr><td colSpan={7} className="py-4 text-zinc-500">No orders in this period.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4"><h2 className="text-white font-bold">Product profitability</h2><Link href={trace('products')} className="text-xs text-purple-400">Full report →</Link></div>
        <table className="w-full text-sm">
          <thead><tr className="text-zinc-500 border-b border-gray-800 text-left"><th className="py-2">Product</th><th className="text-right">Units</th><th className="text-right">Net revenue</th><th className="text-right">COGS</th><th className="text-right">Gross profit</th><th className="text-right">Margin</th><th className="text-right">Contribution</th></tr></thead>
          <tbody>
            {a.products.slice(0, 15).map((p) => (
              <tr key={p.productKey} className="border-b border-gray-800/50 text-gray-300">
                <td className="py-2 text-white max-w-xs truncate">{p.productName}</td><td className="text-right">{p.unitsSold}</td><td className="text-right">{egp(p.netSalesRevenue)}</td>
                <td className="text-right">{egp(p.cogs)}</td><td className="text-right">{egp(p.grossProfit)}</td><td className="text-right">{pct(p.grossMargin)}</td><td className="text-right">{egp(p.contributionBeforeAds)}</td>
              </tr>
            ))}
            {a.products.length === 0 && <tr><td colSpan={7} className="py-4 text-zinc-500">No sales in this period.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-2"><h2 className="text-white font-bold">Advertising campaign performance</h2><Link href={trace('campaigns')} className="text-xs text-purple-400">Full report →</Link></div>
        <p className="text-xs text-zinc-500 mb-4">
          Attribution coverage {pct(a.campaigns.attributionCoverage)} · {a.campaigns.unknownOrders} completed order(s) have unknown source and are not given to any campaign ·
          {' '}spend with no attributed orders: {egp(a.campaigns.unmatchedSpend)} · ROAS is revenue ÷ spend, not profit.
        </p>
        <table className="w-full text-sm">
          <thead><tr className="text-zinc-500 border-b border-gray-800 text-left"><th className="py-2">Platform / campaign</th><th className="text-right">Spend</th><th className="text-right">Leads</th><th className="text-right">Orders</th><th className="text-right">Revenue</th><th className="text-right">Cost/lead</th><th className="text-right">Cost/order</th><th className="text-right">ROAS</th><th className="text-right">After ads</th></tr></thead>
          <tbody>
            {a.campaigns.rows.map((c) => (
              <tr key={c.key} className="border-b border-gray-800/50 text-gray-300">
                <td className="py-2 text-white">{c.platform} / {c.campaign}{c.flags.length > 0 && <span className="ml-2 text-[10px] text-yellow-400">{c.flags.map((f) => f.replace(/_/g, ' ')).join(', ')}</span>}</td>
                <td className="text-right">{egp(c.spend)}<div className="text-[11px] text-zinc-500">{eurOf(c.spend)}</div></td><td className="text-right">{c.leads}</td><td className="text-right">{c.attributedOrders}</td><td className="text-right">{egp(c.attributedRevenue)}<div className="text-[11px] text-zinc-500">{eurOf(c.attributedRevenue)}</div></td>
                <td className="text-right">{egp(c.costPerLead)}</td><td className="text-right">{egp(c.costPerCompletedOrder)}</td><td className="text-right">{c.roas === null ? '—' : c.roas.toFixed(2) + 'x'}</td><td className="text-right">{egp(c.contributionAfterAds)}<div className="text-[11px] text-zinc-500">{eurOf(c.contributionAfterAds)}</div></td>
              </tr>
            ))}
            {a.campaigns.rows.length === 0 && <tr><td colSpan={9} className="py-4 text-zinc-500">No campaign spend or attributed orders in this period.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  )
}
