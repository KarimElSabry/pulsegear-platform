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

/** Link a deal to a registered account (by account id), or unlink it when userId is empty. */
export async function assignDealToAccount(_prev: OrderActionResult | null, formData: FormData): Promise<OrderActionResult> {
  await assertAdmin()
  const dealId = clean(formData.get('deal_id'), 64)
  const userId = clean(formData.get('user_id'), 64)
  if (!dealId) return { ok: false, message: 'Missing order.' }
  if (userId && !/^[0-9a-f-]{36}$/i.test(userId)) return { ok: false, message: 'That is not a valid account.' }

  const db = createAdminSupabaseClient()
  if (userId) {
    const { data, error } = await db.auth.admin.getUserById(userId)
    if (error || !data?.user) return { ok: false, message: 'No registered account with that id.' }
  }
  const { error } = await db.from('deals').update({ user_id: userId }).eq('id', dealId)
  if (error) return { ok: false, message: error.message.includes('user_id') ? 'Run migration 20261020_01_deals_account_link.sql first.' : error.message }
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  return { ok: true, message: userId ? 'Order assigned. The customer can now see it under My Orders.' : 'Order unlinked.' }
}

/** The expected delivery date the customer sees (optional). Empty clears it. */
export async function saveExpectedDelivery(_prev: OrderActionResult | null, formData: FormData): Promise<OrderActionResult> {
  await assertAdmin()
  const dealId = clean(formData.get('deal_id'), 64)
  if (!dealId) return { ok: false, message: 'Missing order.' }
  const date = clean(formData.get('expected_delivery_date'), 10)
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: 'The delivery date is not valid.' }

  const { error } = await createAdminSupabaseClient().from('deals').update({ expected_delivery_date: date }).eq('id', dealId)
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
  const dealId = clean(formData.get('deal_id'), 64)
  const status = clean(formData.get('status'), 32)
  const comment = clean(formData.get('comment'), 500)
  if (!dealId || !status || !ADMIN_STATUS_OPTIONS.some((s) => s.value === status)) return { ok: false, message: 'That status is not valid.' }

  const db = createAdminSupabaseClient()
  const { data: current, error: readError } = await db.from('deals').select('status').eq('id', dealId).maybeSingle()
  if (readError || !current) return { ok: false, message: 'Order not found.' }

  try {
    if (adminStatusValue(current.status as string) === status) {
      if (!comment) return { ok: false, message: 'The order already has this status. Write a comment to post an update.' }
      await logOrderEvent(db, { dealId, status, comment, title: ADMIN_STATUS_OPTIONS.find((s) => s.value === status)!.label })
    } else {
      await updateDealStatus(dealId, status as DealStatus, status === 'cancelled' ? comment ?? undefined : undefined, comment ?? undefined)
    }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Could not change the status.' }
  }
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
