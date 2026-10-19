// src/lib/meta/capi.ts
// Meta Conversions API (server side events). Sent alongside the browser Pixel with the same event_id so Meta
// counts each action once. Personal data is SHA-256 hashed before it leaves the server, as Meta requires.

import { createHash } from 'crypto'
import { ATTR_COOKIE, VISITOR_COOKIE, parseAttributionCookie, readCookie } from '@/lib/tracking/touch'

export type MetaEventName = 'PageView' | 'ViewContent' | 'Contact' | 'InitiateCheckout' | 'Lead'

/** Our event -> Meta standard event. Anything not listed is never sent to Meta. */
export const META_EVENT_MAP: Record<string, MetaEventName> = {
  page_view: 'PageView',
  product_view: 'ViewContent',
  whatsapp_click: 'Contact',
  contact_click: 'Contact',
  checkout_started: 'InitiateCheckout',
  reservation_created: 'Lead',
  product_request_submitted: 'Lead',
}

export interface CapiConfig { pixelId: string; token: string; version: string; testEventCode: string | null }

export function readCapiConfig(env: Record<string, string | undefined> = process.env): CapiConfig | null {
  const pixelId = (env.NEXT_PUBLIC_META_PIXEL_ID ?? '').trim()
  const token = (env.META_CAPI_TOKEN ?? '').trim()
  if (!/^\d{8,20}$/.test(pixelId) || token.length < 20) return null
  return {
    pixelId,
    token,
    version: /^v\d+\.\d+$/.test(env.META_GRAPH_VERSION ?? '') ? (env.META_GRAPH_VERSION as string) : 'v25.0',
    testEventCode: (env.META_TEST_EVENT_CODE ?? '').trim() || null,
  }
}

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex')

export function hashEmail(email?: string | null): string | undefined {
  const e = (email ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? sha256(e) : undefined
}

/** Digits only, with Egypt's country code (01012345678 -> 201012345678), then hashed. */
export function hashPhone(phone?: string | null): string | undefined {
  let d = (phone ?? '').replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('0')) d = `20${d.slice(1)}`
  return d.length >= 10 && d.length <= 15 ? sha256(d) : undefined
}

export interface CapiInput {
  event: string
  eventId: string
  /** Epoch seconds. */
  time?: number
  url?: string
  cookieHeader?: string | null
  ip?: string | null
  userAgent?: string | null
  email?: string | null
  phone?: string | null
  productId?: number | null
  value?: number | null
}

/** Pure: builds one Conversions API event, or null when the event is not one we share with Meta. */
export function buildCapiEvent(i: CapiInput): Record<string, unknown> | null {
  const name = META_EVENT_MAP[i.event]
  if (!name) return null

  const fbp = readCookie(i.cookieHeader, '_fbp')
  let fbc = readCookie(i.cookieHeader, '_fbc')
  if (!fbc) {
    const attr = parseAttributionCookie(readCookie(i.cookieHeader, ATTR_COOKIE))
    const t = attr?.lastNonDirect?.clickIdType === 'fbclid' ? attr.lastNonDirect : attr?.first?.clickIdType === 'fbclid' ? attr.first : null
    if (t?.clickId) fbc = `fb.1.${Date.parse(t.at) || Date.now()}.${t.clickId}`
  }
  const vid = readCookie(i.cookieHeader, VISITOR_COOKIE)

  const userData: Record<string, unknown> = {
    em: hashEmail(i.email) ? [hashEmail(i.email)] : undefined,
    ph: hashPhone(i.phone) ? [hashPhone(i.phone)] : undefined,
    fbp, fbc,
    external_id: vid ? [sha256(vid)] : undefined,
    client_ip_address: i.ip || undefined,
    client_user_agent: i.userAgent || undefined,
  }
  for (const k of Object.keys(userData)) if (userData[k] === undefined) delete userData[k]

  const custom: Record<string, unknown> = {}
  if (i.productId) { custom.content_ids = [String(i.productId)]; custom.content_type = 'product' }
  if (i.value && i.value > 0) { custom.value = i.value; custom.currency = 'EGP' }

  return {
    event_name: name,
    event_time: i.time ?? Math.floor(Date.now() / 1000),
    event_id: i.eventId,
    action_source: 'website',
    event_source_url: i.url,
    user_data: userData,
    ...(Object.keys(custom).length ? { custom_data: custom } : {}),
  }
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; status: number }>

/** Never throws: analytics must not break a customer action. Returns whether Meta accepted the batch. */
export async function sendCapiEvents(events: Record<string, unknown>[], cfg = readCapiConfig(), fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<boolean> {
  if (!cfg || events.length === 0) return false
  try {
    const res = await fetchImpl(`https://graph.facebook.com/${cfg.version}/${cfg.pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.token}` },
      body: JSON.stringify({ data: events, ...(cfg.testEventCode ? { test_event_code: cfg.testEventCode } : {}) }),
    })
    if (!res.ok) console.error('[meta-capi] rejected with status', res.status)
    return res.ok
  } catch (err) {
    console.error('[meta-capi] error:', err instanceof Error ? err.message : err)
    return false
  }
}
