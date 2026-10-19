// src/app/admin/analytics/reports/page.tsx

import Link from 'next/link'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { loadDataset } from '@/lib/finance/load'
import { filtersToQuery, parseParams, PRESETS, type SearchParams } from '@/lib/finance/params'
import { getEgpPerEur } from '@/lib/finance/fx'
import { buildReport, REPORT_IDS, REPORT_TITLES, type Cell, type Column, type ReportId } from '@/lib/finance/reports'
import { COST_CATEGORIES } from '@/lib/finance/types'

export const dynamic = 'force-dynamic'
const PREVIEW_ROWS = 200

function show(c: Column, v: Cell): string {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'number') {
    if (c.type === 'percent') return (v * 100).toFixed(1) + '%'
    if (c.type === 'int') return Number.isInteger(v) ? String(v) : v.toFixed(2)
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return v
}

const inputClass = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await assertAdmin()
  const sp = await searchParams
  const { filters, preset, compare } = parseParams(sp)
  const requested = Array.isArray(sp.report) ? sp.report[0] : sp.report
  const id: ReportId = REPORT_IDS.includes(requested as ReportId) ? (requested as ReportId) : 'executive'

  const ds = await loadDataset(createAdminSupabaseClient(), filters)
  const report = buildReport(id, ds, filters, { comparePrevious: compare, egpPerEur: (await getEgpPerEur()).rate })
  const q = (format: string) => `/api/admin/reports/export?${filtersToQuery(filters, { report: id, format, compare: compare ? '1' : '0' })}`
  const channels = [...new Set(ds.sales.map((s) => s.channel))].sort()
  const shown = report.rows.slice(0, PREVIEW_ROWS)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Reports</h1>
          <p className="text-zinc-500 text-sm mt-1">Same numbers as the dashboard. Customer details are never exported.</p>
        </div>
        <Link href="/admin/analytics/sales-performance" className="text-gray-400 hover:text-white text-sm">← Sales performance</Link>
      </div>

      <form method="get" className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs text-gray-400">Report
          <select name="report" defaultValue={id} className={inputClass + ' block'}>{REPORT_IDS.map((r) => <option key={r} value={r}>{REPORT_TITLES[r]}</option>)}</select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">Period
          <select name="preset" defaultValue={preset} className={inputClass + ' block'}>{PRESETS.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}</select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">From<input type="date" name="from" defaultValue={filters.from} className={inputClass + ' block'} /></label>
        <label className="space-y-1 text-xs text-gray-400">To<input type="date" name="to" defaultValue={filters.to} className={inputClass + ' block'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Channel
          <select name="channel" defaultValue={filters.channel ?? ''} className={inputClass + ' block'}><option value="">All</option>{channels.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">Source<input name="source" defaultValue={filters.source ?? ''} className={inputClass + ' block w-28'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Campaign<input name="campaign" defaultValue={filters.campaign ?? ''} className={inputClass + ' block w-32'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Product<input name="product" defaultValue={filters.product ?? ''} className={inputClass + ' block w-32'} /></label>
        <label className="space-y-1 text-xs text-gray-400">Order status
          <select name="orderStatus" defaultValue={filters.orderStatus ?? ''} className={inputClass + ' block'}><option value="">All</option>{['pending', 'completed', 'cancelled', 'failed_delivery'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">Delivery
          <select name="deliveryStatus" defaultValue={filters.deliveryStatus ?? ''} className={inputClass + ' block'}><option value="">All</option>{['pending', 'shipped', 'delivered', 'failed', 'returned'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
        </label>
        <label className="space-y-1 text-xs text-gray-400">Cost category
          <select name="costCategory" defaultValue={filters.costCategory ?? ''} className={inputClass + ' block'}>
            <option value="">All</option>{[...COST_CATEGORIES, 'rent', 'salaries', 'software', 'tools', 'accounting', 'transport', 'other', 'tax', 'interest'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <input type="hidden" name="compare" value={compare ? '1' : '0'} />
        <button className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-lg">Apply</button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-white font-bold text-lg mr-auto">{report.title}</h2>
        <a href={q('csv')} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg">Download CSV</a>
        <a href={q('xlsx')} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg">Download Excel</a>
        <a href={q('html')} target="_blank" className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg">Printable (save as PDF)</a>
      </div>
      <p className="text-xs text-zinc-500">{report.note} {report.rows.length > PREVIEW_ROWS && `Showing the first ${PREVIEW_ROWS} of ${report.rows.length} rows; downloads contain all rows.`}</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-zinc-500 border-b border-gray-800 text-left">{report.columns.map((c) => <th key={c.key} className={`py-2 pr-3 ${c.type === 'text' || c.type === 'date' ? '' : 'text-right'}`}>{c.label}</th>)}</tr></thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className="border-b border-gray-800/50 text-gray-300 align-top">
                {report.columns.map((c) => <td key={c.key} className={`py-1.5 pr-3 ${c.type === 'text' || c.type === 'date' ? '' : 'text-right whitespace-nowrap'}`}>{show(c, r[c.key] ?? null)}</td>)}
              </tr>
            ))}
            {report.totals && (
              <tr className="font-bold text-white bg-gray-800/40">{report.columns.map((c) => <td key={c.key} className={`py-2 pr-3 ${c.type === 'text' || c.type === 'date' ? '' : 'text-right whitespace-nowrap'}`}>{show(c, report.totals![c.key] ?? null)}</td>)}</tr>
            )}
            {report.rows.length === 0 && <tr><td colSpan={report.columns.length} className="py-6 text-zinc-500">No rows for these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
