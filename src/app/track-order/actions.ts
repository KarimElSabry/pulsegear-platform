// src/app/track-order/actions.ts
// Public: no login. A visitor proves the order is theirs with the order ID plus the last 4 digits of the phone on it.

'use server'

import { headers } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { loadEvents } from '@/lib/order-events'
import { normalizeOrderCode, phoneLast4Matches, toCustomerOrder, toPublicOrder, type DealLite, type PublicOrder } from '@/lib/orders'

export interface TrackResult { ok: boolean; message?: string; order?: PublicOrder }

// the same answer for "no such order" and "wrong phone", so nobody can test which order IDs exist
const NOT_FOUND = 'We could not find an order with those details. Check the order ID and the last 4 digits of the phone number you gave us, or message us on WhatsApp.'

export async function trackOrder(_prev: TrackResult | null, formData: FormData): Promise<TrackResult> {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (!rateLimit(`track:${ip}`, 10, 10 * 60_000)) return { ok: false, message: 'Too many tries. Please wait a few minutes and try again.' }

  const code = normalizeOrderCode(String(formData.get('order_code') ?? ''))
  const phone = String(formData.get('phone_last4') ?? '')
  if (!code || phone.replace(/\D/g, '').length < 4) return { ok: false, message: NOT_FOUND }

  const db = createAdminSupabaseClient()
  const { data, error } = await db.from('deals')
    .select('id, status, phone, product_request_id, created_at, deposit_paid_at, shipped_at, arrived_egypt_at, delivered_at, order_code, expected_delivery_date, tracking_number, carrier, customer_message')
    .eq('order_code', code).maybeSingle()
  if (error) {
    console.error('[track-order] lookup failed:', error.message)
    return { ok: false, message: 'Tracking is not available right now. Please message us on WhatsApp.' }
  }
  if (!data || !phoneLast4Matches(data.phone, phone)) return { ok: false, message: NOT_FOUND }

  let title: string | null = null
  if (data.product_request_id) {
    const { data: req } = await db.from('product_requests').select('requested_product').eq('id', data.product_request_id).maybeSingle()
    title = (req?.requested_product as string | undefined) ?? null
  }
  const events = (await loadEvents(db, [data.id as string])).get(data.id as string) ?? []
  return { ok: true, order: toPublicOrder(toCustomerOrder(data as DealLite, title, new Date(), events)) }
}
