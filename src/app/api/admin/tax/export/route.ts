// src/app/api/admin/tax/export/route.ts
// Admin-only download of the year's business transactions for the Steuerberater (CSV for German Excel).

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { loadLedger } from '@/lib/tax/service'
import { steuerberaterCsv } from '@/lib/tax/report'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req)
  if (denied) return denied
  const year = Number(req.nextUrl.searchParams.get('year'))
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return NextResponse.json({ error: 'Bad year' }, { status: 400 })
  const ledger = await loadLedger(createAdminSupabaseClient())
  if (!ledger.ok) return NextResponse.json({ error: 'Tax tables are not set up yet' }, { status: 503 })
  return new NextResponse(steuerberaterCsv(ledger.txs, year), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pulsegear-einnahmen-ausgaben-${year}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
