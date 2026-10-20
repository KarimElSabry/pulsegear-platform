// src/lib/order-events.ts
// Reading and writing the order update log. Server only. Every function tolerates a missing table
// (migration 20261022_01 not applied yet): reads return nothing, writes are skipped with a warning.

import type { SupabaseClient } from '@supabase/supabase-js'
import { statusHeadline, type OrderEventLite } from '@/lib/orders'

const missing = (e: { code?: string; message?: string } | null) => !!e && (e.code === 'PGRST205' || e.code === '42P01' || /order_events/.test(e.message ?? ''))

export async function loadEvents(db: SupabaseClient, dealIds: string[]): Promise<Map<string, OrderEventLite[]>> {
  const out = new Map<string, OrderEventLite[]>()
  if (dealIds.length === 0) return out
  const { data, error } = await db.from('order_events').select('id, deal_id, status, title, comment, created_at').in('deal_id', dealIds).order('created_at', { ascending: false })
  if (error) { if (!missing(error)) console.error('[order-events] load failed:', error.message); return out }
  for (const r of data ?? []) out.set(r.deal_id as string, [...(out.get(r.deal_id as string) ?? []), r as OrderEventLite])
  return out
}

/** A status that repeats the previous title without a new comment adds nothing (e.g. deposit_pending then deposit_paid, both "Order received"). */
export function isDuplicateEvent(last: { title: string } | null | undefined, title: string, comment: string | null): boolean {
  return !!last && last.title === title && !comment
}

/** Adds an update for a status change and/or a comment. Returns false when nothing was written. */
export async function logOrderEvent(db: SupabaseClient, input: { dealId: string; status?: string | null; comment?: string | null; title?: string }): Promise<boolean> {
  const comment = input.comment?.trim().slice(0, 500) || null
  const status = input.status ?? null
  const title = input.title ?? (status ? statusHeadline(status) : 'Update from Pulse Gear')
  if (!status && !comment) return false

  const { data: last, error: readError } = await db.from('order_events').select('title').eq('deal_id', input.dealId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (readError) { if (!missing(readError)) console.error('[order-events] read failed:', readError.message); else console.warn('[order-events] table missing, run 20261022_01_order_events.sql'); return false }
  if (status && isDuplicateEvent(last, title, comment)) return false

  const { error } = await db.from('order_events').insert({ deal_id: input.dealId, status, title, comment })
  if (error) { console.error('[order-events] insert failed:', error.message); return false }
  return true
}
