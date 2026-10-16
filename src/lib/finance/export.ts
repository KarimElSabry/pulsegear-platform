// src/lib/finance/export.ts
// CSV, Excel (.xlsx) and printable HTML (use the browser's "Save as PDF") renderings of a Report.

import ExcelJS from 'exceljs'
import type { Cell, Column, Report } from './reports'

/** Values that a spreadsheet would execute as a formula get a leading apostrophe (CSV/formula injection). */
export function safeText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

function exportValue(c: Column, v: Cell): string | number {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') return c.type === 'percent' ? Math.round(v * 10000) / 100 : v
  return safeText(v)
}

function header(c: Column): string {
  return c.type === 'percent' ? `${c.label} (%)` : c.label
}

function csvCell(v: string | number): string {
  const s = String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(report: Report): string {
  const lines = [report.columns.map((c) => csvCell(header(c))).join(',')]
  const all = report.totals ? [...report.rows, report.totals] : report.rows
  for (const r of all) lines.push(report.columns.map((c) => csvCell(exportValue(c, r[c.key] ?? null))).join(','))
  return '﻿' + lines.join('\r\n') + '\r\n'
}

export async function toXlsx(report: Report): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Pulse Gear'
  const ws = wb.addWorksheet(report.title.slice(0, 31))
  ws.columns = report.columns.map((c) => ({
    header: header(c),
    key: c.key,
    width: c.type === 'text' ? 32 : 16,
    style: c.type === 'money' ? { numFmt: '#,##0.00' } : c.type === 'percent' ? { numFmt: '0.00' } : {},
  }))
  ws.getRow(1).font = { bold: true }
  const all = report.totals ? [...report.rows, report.totals] : report.rows
  for (const r of all) {
    const row: Record<string, string | number> = {}
    for (const c of report.columns) row[c.key] = exportValue(c, r[c.key] ?? null)
    ws.addRow(row)
  }
  if (report.totals) ws.lastRow!.font = { bold: true }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
  return Buffer.from(await wb.xlsx.writeBuffer())
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function display(c: Column, v: Cell): string {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'number') {
    if (c.type === 'percent') return (v * 100).toFixed(1) + '%'
    if (c.type === 'int') return Number.isInteger(v) ? String(v) : v.toFixed(2)
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return v
}

export function toHtml(report: Report): string {
  const f = report.filters
  const head = report.columns.map((c) => `<th class="${c.type}">${esc(header(c))}</th>`).join('')
  const body = (rows: typeof report.rows, cls = '') =>
    rows.map((r) => `<tr class="${cls}">${report.columns.map((c) => `<td class="${c.type}">${esc(display(c, r[c.key] ?? null))}</td>`).join('')}</tr>`).join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(report.title)}</title>
<style>
body{font:12px/1.4 -apple-system,Segoe UI,Arial,sans-serif;color:#111;margin:24px}
h1{font-size:18px;margin:0 0 4px}.meta{color:#555;margin-bottom:12px}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;vertical-align:top}
th{background:#f3f3f3;text-align:left}td.money,td.int,td.percent,th.money,th.int,th.percent{text-align:right;white-space:nowrap}
tr.total td{font-weight:bold;background:#fafafa}.note{margin-top:12px;color:#555}
@media print{body{margin:8mm}}
</style></head><body>
<h1>${esc(report.title)}</h1>
<div class="meta">Period ${esc(f.from)} to ${esc(f.to)}${f.channel ? ' · channel ' + esc(f.channel) : ''}${f.source ? ' · source ' + esc(f.source) : ''}${f.campaign ? ' · campaign ' + esc(f.campaign) : ''}${f.product ? ' · product ' + esc(f.product) : ''}${f.orderStatus ? ' · status ' + esc(f.orderStatus) : ''}${f.deliveryStatus ? ' · delivery ' + esc(f.deliveryStatus) : ''}${f.costCategory ? ' · cost ' + esc(f.costCategory) : ''} · Amounts in EGP</div>
<table><thead><tr>${head}</tr></thead><tbody>${body(report.rows)}${report.totals ? body([report.totals], 'total') : ''}</tbody></table>
<p class="note">${esc(report.note)}</p></body></html>`
}
