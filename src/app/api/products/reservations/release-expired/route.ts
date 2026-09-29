// src/app/api/reservations/release-expired/route.ts
// Cron (daily, 03:17 UTC; the free Hobby plan allows at most one run per day): products whose 24h hold has passed go back to "available"
// and their pending reservation rows are marked "cancelled".

import { NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()
  const nowIso = new Date().toISOString()

  const { data: expired, error: findErr } = await supabase
    .from('products')
    .select('id')
    .eq('status', 'reserved')
    .lt('reserved_until', nowIso)

  if (findErr) {
    console.error('[release-expired] find error:', findErr.message)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const ids = (expired ?? []).map((p) => p.id as number)
  if (ids.length === 0) return NextResponse.json({ released: 0 })

  const { error: relErr } = await supabase
    .from('products')
    .update({ status: 'available', reserved_until: null })
    .in('id', ids)
    .eq('status', 'reserved')

  if (relErr) {
    console.error('[release-expired] release error:', relErr.message)
    return NextResponse.json({ error: 'Release failed' }, { status: 500 })
  }

  const { error: resErr } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .in('product_id', ids)
    .eq('status', 'pending')

  if (resErr) console.error('[release-expired] reservation update error:', resErr.message)

  return NextResponse.json({ released: ids.length, ids })
}
