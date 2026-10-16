// src/lib/tracking/server.ts
// Server side event recording. Failures are swallowed: analytics must never break a customer action.

import { createAdminSupabaseClient } from '@/lib/supabase'
import { ATTR_COOKIE, VISITOR_COOKIE, parseAttributionCookie, readCookie, type Touch } from './touch'
import type { TrackEvent } from '@/lib/finance/types'

export interface ServerEventInput {
  event: TrackEvent
  /** Request that triggered the event; its cookies provide visitor id and attribution. Omit for admin events. */
  request?: Request
  path?: string
  productId?: number | null
  refType?: string
  refId?: string | number
  saleId?: string
  detail?: string
}

export function touchpointRow(input: ServerEventInput) {
  const cookieHeader = input.request?.headers.get('cookie')
  const attr = parseAttributionCookie(readCookie(cookieHeader, ATTR_COOKIE))
  const last: Touch | null = attr?.lastNonDirect ?? null
  const first: Touch | null = attr?.first ?? null
  return {
    visitor_id: readCookie(cookieHeader, VISITOR_COOKIE) ?? null,
    event: input.event,
    path: input.path ?? null,
    detail: input.detail ?? null,
    product_id: input.productId ?? null,
    ref_type: input.refType ?? null,
    ref_id: input.refId !== undefined ? String(input.refId) : null,
    sale_id: input.saleId ?? null,
    utm_source: last?.source ?? first?.source ?? null,
    utm_medium: last?.medium ?? first?.medium ?? null,
    utm_campaign: last?.campaign ?? first?.campaign ?? null,
    utm_content: last?.content ?? first?.content ?? null,
    click_id_type: last?.clickIdType ?? first?.clickIdType ?? null,
    click_id: last?.clickId ?? first?.clickId ?? null,
    referrer: last?.referrer ?? first?.referrer ?? null,
    first_touch_source: first?.source ?? (first ? 'direct' : null),
    last_non_direct_source: last?.source ?? null,
  }
}

export async function recordServerEvent(input: ServerEventInput): Promise<void> {
  try {
    const { error } = await createAdminSupabaseClient().from('marketing_touchpoints').insert(touchpointRow(input))
    if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
      console.error('[tracking] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[tracking] error:', err instanceof Error ? err.message : err)
  }
}
