// src/app/admin/orders/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { updateDealStatus } from '../deals/actions'
import { type DealStatus } from '@/types/deals'
import { ADMIN_STATUS_OPTIONS, adminStatusValue } from '@/lib/orders'
import { logOrderEvent } from '@/lib/order-events'

export interface OrderActionResult { ok: boolean; message: string }

const clean = (v: FormDataEntryValue | null, max: number) => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s ? s.slice(0, max) : null
}

/** One order can hold several deals (one per item). Forms send deal_ids (comma separated) or a single deal_id. */
const dealIdsOf = (formData: FormData): string[] => {
  const raw = [formData.get('deal_ids'), formData.get('deal_id')].map((v) => (typeof v === 'string' ? v : '')).join(',')
  return [...new Set(raw.split(',').map((x) => x.trim()).filter((x) => /^[\w-]{8,64}$/.test(x)))].slice(0, 50)
}

/** Link a deal to a registered account (by account id), or unlink it when userId is empty. */
export async function assignDealToAccount(_prev: OrderActionResult | null, formData: FormData): Promise<OrderActionResult> {
  await assertAdmin()
  const dealIds = dealIdsOf(formData)
  const userId = clean(formData.get('user_id'), 64)
  if (dealIds.length === 0) return { ok: false, message: 'Missing order.' }
  if (userId && !/^[0-9a-f-]{36}$/i.test(userId)) return { ok: false, message: 'That is not a valid account.' }

  const db = createAdminSupabaseClient()
  if (userId) {
    const { data, error } = await db.auth.admin.getUserById(userId)
    if (error || !data?.user) return { ok: false, message: 'No registered account with that id.' }
  }
  const { error } = await db.from('deals').update({ user_id: userId }).in('id', dealIds)
  if (error) return { ok: false, message: error.message.includes('user_id') ? 'Run migration 20261020_01_deals_account_link.sql first.' : error.message }
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  return { ok: true, message: userId ? 'Order assigned. The customer can now see it under My Orders.' : 'Order unlinked.' }
}

/** The expected delivery date the customer sees (optional). Empty clears it. */
export async function saveExpectedDelivery(_prev: OrderActionResult | null, formData: FormData): Promise<OrderActionResult> {
  await assertAdmin()
  const dealIds = dealIdsOf(formData)
  if (dealIds.length === 0) return { ok: false, message: 'Missing order.' }
  const date = clean(formData.get('expected_delivery_date'), 10)
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: 'The delivery date is not valid.' }

  const { error } = await createAdminSupabaseClient().from('deals').update({ expected_delivery_date: date }).in('id', dealIds)
  if (error) return { ok: false, message: error.message.includes('expected_delivery_date') ? 'Run migration 20261021_01_order_codes.sql first.' : error.message }
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  revalidatePath('/track-order')
  return { ok: true, message: 'Saved.' }
}

/**
 * Change the status (and optionally add a comment) from the Orders page. Same logic as the Deals page: timestamps,
 * request status, sale on completion. Every change is written to the update log the customer sees.
 * Choosing the status the order already has only posts the comment.
 */
export async function setOrderStatus(_prev: OrderActionResult | null, formData: FormData): Promise<OrderActionResult> {
  await assertAdmin()
  const dealIds = dealIdsOf(formData)
  const status = clean(formData.get('status'), 32)
  const comment = clean(formData.get('comment'), 500)
  if (dealIds.length === 0 || !status || !ADMIN_STATUS_OPTIONS.some((s) => s.value === status)) return { ok: false, message: 'That status is not valid.' }

  const db = createAdminSupabaseClient()
  const { data: current, error: readError } = await db.from('deals').select('id, status').in('id', dealIds)
  if (readError || !current || current.length === 0) return { ok: false, message: 'Order not found.' }

  // an order with several items moves together; items that are already cancelled stay cancelled
  const targets = (current as { id: string; status: string }[]).filter((d) => d.status !== 'cancelled' || status === 'cancelled')
  if (targets.length === 0) return { ok: false, message: 'This order is cancelled.' }
  const label = ADMIN_STATUS_OPTIONS.find((s) => s.value === status)!.label
  let changed = 0
  try {
    for (const d of targets) {
      if (adminStatusValue(d.status) === status) {
        if (comment) { await logOrderEvent(db, { dealId: d.id, status, comment, title: label }); changed++ }
      } else {
        await updateDealStatus(d.id, status as DealStatus, status === 'cancelled' ? comment ?? undefined : undefined, comment ?? undefined)
        changed++
      }
    }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Could not change the status.' }
  }
  if (changed === 0) return { ok: false, message: 'The order already has this status. Write a comment to post an update.' }
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  revalidatePath('/track-order')
  return { ok: true, message: 'Posted. The customer sees it now.' }
}

/** Removes one update from the log (for a mistake). The order status itself is not changed. */
export async function deleteOrderEvent(formData: FormData): Promise<void> {
  await assertAdmin()
  const id = clean(formData.get('event_id'), 64)
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return
  const { error } = await createAdminSupabaseClient().from('order_events').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  revalidatePath('/track-order')
}

/** Changes the words of one update (the customer sees the new text). */
export async function editOrderEvent(formData: FormData): Promise<void> {
  await assertAdmin()
  const id = clean(formData.get('event_id'), 64)
  const title = clean(formData.get('title'), 120)
  const comment = clean(formData.get('comment'), 500)
  if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !title) return
  const { error } = await createAdminSupabaseClient().from('order_events').update({ title, comment }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  revalidatePath('/track-order')
}

/** Hides one update from the customer (or shows it again) without deleting it. */
export async function setEventHidden(formData: FormData): Promise<void> {
  await assertAdmin()
  const id = clean(formData.get('event_id'), 64)
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return
  const { error } = await createAdminSupabaseClient().from('order_events').update({ hidden: formData.get('hide') === '1' }).eq('id', id)
  if (error) throw new Error(error.message.includes('hidden') ? 'Run migration 20261104_01_order_event_hidden.sql first.' : error.message)
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  revalidatePath('/track-order')
}
