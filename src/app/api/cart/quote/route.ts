// src/app/api/cart/quote/route.ts
// Public. Turns the browser's cart (what and how many) into real prices, names and availability.

import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { quoteCart, releaseExpired } from '@/lib/checkout-service'
import { clientIp, linesFromBody } from '@/lib/checkout-http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!rateLimit(`quote:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }
  let body: { lines?: unknown; discountCode?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const lines = linesFromBody(body.lines)
  const db = createAdminSupabaseClient()
  try {
    await releaseExpired(db)
    const quote = await quoteCart(db, lines, { discountCode: typeof body.discountCode === 'string' ? body.discountCode : null })
    return NextResponse.json(quote)
  } catch (e) {
    console.error('[cart/quote]', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Could not load your cart. Please try again.' }, { status: 500 })
  }
}
