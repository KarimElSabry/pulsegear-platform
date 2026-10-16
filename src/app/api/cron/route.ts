// src/app/api/cron/meta-spend/route.ts
// Daily job (see vercel.json). Also callable by a logged-in admin: /api/cron/meta-spend?days=30 to backfill.

import { NextResponse, type NextRequest } from 'next/server'
import { isAdminToken, isCronAuthorized, ADMIN_COOKIE } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { syncMetaSpend, MAX_SYNC_DAYS } from '@/lib/meta/sync'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req) && !isAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requested = Number(req.nextUrl.searchParams.get('days'))
  const days = Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_SYNC_DAYS) : undefined
  const summary = await syncMetaSpend(createAdminSupabaseClient(), { days })
  return NextResponse.json(summary, { status: summary.ok ? 200 : 502 })
}
