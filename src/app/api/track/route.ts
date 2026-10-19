// src/app/api/track/route.ts
// Public, write-only endpoint for browser events. Only low-trust events are accepted here; reservations,
// requests and sales are recorded by the server routes that create them.

import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import type { TrackEvent } from '@/lib/finance/types'
import { buildCapiEvent, sendCapiEvents } from '@/lib/meta/capi'

const CLIENT_EVENTS: TrackEvent[] = ['page_view', 'product_view', 'contact_click', 'whatsapp_click', 'checkout_started']

// Best-effort per-instance limiter (resets on cold start). The table is write-only and every field is length-capped.
const hits = new Map<string, { count: number; reset: number }>()
const LIMIT = 120
const WINDOW_MS = 60_000

function limited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now > h.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS })
    if (hits.size > 5000) hits.clear()
    return false
  }
  h.count += 1
  return h.count > LIMIT
}

const text = (v: unknown, n: number): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null)

interface TouchBody { source?: unknown; medium?: unknown; campaign?: unknown; content?: unknown; clickIdType?: unknown; clickId?: unknown; referrer?: unknown }
const touch = (v: unknown): TouchBody => (v && typeof v === 'object' ? (v as TouchBody) : {})

export async function POST(req: Request) {
  const ua = req.headers.get('user-agent') ?? ''
  if (/bot|crawl|spider|headless|lighthouse/i.test(ua)) return new NextResponse(null, { status: 204 })

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  if (limited(ip)) return new NextResponse(null, { status: 429 })

  try {
    const body = await req.json()
    const event = body?.event as TrackEvent
    if (!CLIENT_EVENTS.includes(event)) return NextResponse.json({ error: 'Unsupported event' }, { status: 400 })

    const last = touch(body.lastNonDirect)
    const first = touch(body.first)
    const productId = Number.isInteger(body.productId) && body.productId > 0 ? body.productId : null

    await createAdminSupabaseClient().from('marketing_touchpoints').insert({
      visitor_id: text(body.visitorId, 64),
      event,
      path: text(body.path, 300),
      detail: text(body.detail, 100),
      product_id: productId,
      utm_source: text(last.source ?? first.source, 120),
      utm_medium: text(last.medium ?? first.medium, 120),
      utm_campaign: text(last.campaign ?? first.campaign, 120),
      utm_content: text(last.content ?? first.content, 120),
      click_id_type: text(last.clickIdType ?? first.clickIdType, 20),
      click_id: text(last.clickId ?? first.clickId, 200),
      referrer: text(last.referrer ?? first.referrer, 200),
      first_touch_source: text(first.source, 120) ?? (body.first ? 'direct' : null),
      last_non_direct_source: text(last.source, 120),
    })
    const capi = buildCapiEvent({
      event,
      eventId: text(body.eventId, 64) ?? crypto.randomUUID(),
      url: req.headers.get('referer') ?? undefined,
      cookieHeader: req.headers.get('cookie'),
      ip,
      userAgent: ua,
      productId,
    })
    if (capi) await sendCapiEvents([capi])
    return new NextResponse(null, { status: 204 })
  } catch {
    // never tell the browser anything useful, and never fail the page
    return new NextResponse(null, { status: 204 })
  }
}
