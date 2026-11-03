// src/app/api/admin/tax/package/route.ts
// Admin-only download: one ZIP with everything the Steuerberater asks for (summary, income/expenses, exchanges, customer payments,
// sales, proof that every bank statement was read completely, and the open points).

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createZip } from '@/lib/zip'
import { buildYearPackage } from '@/lib/tax/package-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req)
  if (denied) return denied
  const year = Number(req.nextUrl.searchParams.get('year'))
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return NextResponse.json({ error: 'Bad year' }, { status: 400 })
  const pkg = await buildYearPackage(createAdminSupabaseClient(), year)
  if (!pkg.ok) return NextResponse.json({ error: 'Tax tables are not set up yet' }, { status: 503 })
  return new NextResponse(Buffer.from(createZip(pkg.files)), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="pulsegear-steuerunterlagen-${year}.zip"`,
      'Cache-Control': 'no-store',
    },
  })
}
