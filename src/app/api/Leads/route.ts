// src/app/api/leads/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const [reservationsRes, requestsRes] = await Promise.all([
    supabase
      .from('reservations')
      .select('*, product:products(id, title)')
      .order('created_at', { ascending: false }),
    supabase
      .from('product_requests')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  if (reservationsRes.error) {
    return NextResponse.json({ error: reservationsRes.error.message }, { status: 500 })
  }
  if (requestsRes.error) {
    return NextResponse.json({ error: requestsRes.error.message }, { status: 500 })
  }

  return NextResponse.json({
    reservations: reservationsRes.data ?? [],
    requests: requestsRes.data ?? [],
  })
}