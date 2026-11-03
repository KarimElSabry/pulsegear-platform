// src/lib/order-events.ts
// Reading and writing the order update log. Server only. Every function tolerates a missing table
// (migration 20261022_01 not applied yet): reads return nothing, writes are skipped with a warning.

import type { SupabaseClient } from '@supabase/supabase-js'
import { statusHeadline, type OrderEventLite } from '@/lib/orders'

const missing = (e: { code?: string; message?: string } | null) => !!e && (e.code === 'PGRST205' || e.code === '42P01' || /order_events/.test(e.message ?? ''))

/** The updates of some orders, newest first. Hidden updates are left out unless the admin page asks for them. */
export async function loadEvents(db: SupabaseClient, dealIds: string[], opts: { includeHidden?: boolean } = {}): Promise<Map<string, OrderEventLite[]>> {
  const out = new Map<string, OrderEventLite[]>()
  if (dealIds.length === 0) return out
  const query = (cols: string) => db.from('order_events').select(cols).in('deal_id', dealIds).order('created_at', { ascending: false })
  let { data, error } = await query('id, deal_id, status, title, comment, created_at, hidden')
  // migration 20261104_01 not applied yet: nothing can be hidden, so read without that column
  if (error && /hidden/.test(error.message ?? '')) ({ data, error } = await query('id, deal_id, status, title, comment, created_at'))
  if (error) { if (!missing(error)) console.error('[order-events] load failed:', error.message); return out }
  for (const r of (data ?? []) as unknown as (OrderEventLite & { deal_id: string })[]) {
    if (r.hidden === true && !opts.includeHidden) continue
    out.set(r.deal_id, [...(out.get(r.deal_id) ?? []), r])
  }
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
