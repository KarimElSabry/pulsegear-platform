// src/app/api/admin/reports/export/route.ts
// Admin-only report download (CSV, Excel, printable HTML). Built from the same analyze() as the dashboard.

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { loadDataset } from '@/lib/finance/load'
import { parseParams } from '@/lib/finance/params'
import { getEgpPerEur } from '@/lib/finance/fx'
import { buildReport, REPORT_IDS, type ReportId } from '@/lib/finance/reports'
import { toCsv, toHtml, toXlsx } from '@/lib/finance/export'

export const dynamic = 'force-dynamic'

const FORMATS = ['csv', 'xlsx', 'html'] as const

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req)
  if (denied) return denied

  const sp = Object.fromEntries(req.nextUrl.searchParams.entries())
  const id = sp.report as ReportId
  const format = sp.format as (typeof FORMATS)[number]
  if (!REPORT_IDS.includes(id)) return NextResponse.json({ error: 'Unknown report' }, { status: 400 })
  if (!FORMATS.includes(format)) return NextResponse.json({ error: 'Unknown format' }, { status: 400 })

  try {
    const { filters, compare } = parseParams(sp)
    const ds = await loadDataset(createAdminSupabaseClient(), filters)
    const report = buildReport(id, ds, filters, { comparePrevious: compare, egpPerEur: (await getEgpPerEur()).rate })
    const base = `pulsegear-${id}-${filters.from}_to_${filters.to}`
    console.info(`[report-export] ${id}.${format} ${filters.from}..${filters.to}`)

    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
    if (format === 'csv') {
      return new NextResponse(toCsv(report), { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${base}.csv"` } })
    }
    if (format === 'xlsx') {
      return new NextResponse(new Uint8Array(await toXlsx(report)), {
        headers: { ...headers, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${base}.xlsx"` },
      })
    }
    return new NextResponse(toHtml(report), { headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `inline; filename="${base}.html"` } })
  } catch (err) {
    console.error('[report-export] failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not build the report' }, { status: 500 })
  }
}
