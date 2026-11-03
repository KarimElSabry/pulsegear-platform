// src/app/admin/checkouts/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { approveCheckout, cancelCheckout } from '@/lib/checkout-service'
import { reviewReceipt } from '@/lib/receipt-service'
import { updateDealStatus } from '../deals/actions'

export interface CheckoutActionResult { ok: boolean; message: string }

const UUID = /^[0-9a-f-]{36}$/i
const idOf = (formData: FormData) => {
  const v = formData.get('checkout_id')
  return typeof v === 'string' && UUID.test(v) ? v : null
}

function refresh() {
  revalidatePath('/admin/checkouts')
  revalidatePath('/admin/orders')
  revalidatePath('/admin/deals')
  revalidatePath('/products')
  revalidatePath('/track-order')
  revalidatePath('/account/orders')
}

/** The customer confirmed on WhatsApp: creates the orders (one per item) and marks one-off items as sold. */
export async function approveCheckoutOrder(_prev: CheckoutActionResult | null, formData: FormData): Promise<CheckoutActionResult> {
  await assertAdmin()
  const id = idOf(formData)
  if (!id) return { ok: false, message: 'Missing order.' }
  const result = await approveCheckout(createAdminSupabaseClient(), id)
  if (!result.ok) return { ok: false, message: result.message }
  refresh()
  return { ok: true, message: `Approved. ${result.dealIds.length} order${result.dealIds.length === 1 ? '' : 's'} created (see Admin > Orders). The customer can track ${result.code}.` }
}

/** Cancels an order: the customer did not reply or changed their mind. Works before and after you approved it. */
export async function cancelCheckoutOrder(_prev: CheckoutActionResult | null, formData: FormData): Promise<CheckoutActionResult> {
  await assertAdmin()
  const id = idOf(formData)
  if (!id) return { ok: false, message: 'Missing order.' }
  const reason = typeof formData.get('reason') === 'string' ? (formData.get('reason') as string) : ''
  const result = await cancelCheckout(createAdminSupabaseClient(), id, reason)
  if (!result.ok) return { ok: false, message: result.message }
  refresh()
  if (result.kind === 'pending') return { ok: true, message: 'Cancelled. The items are available again.' }
  return {
    ok: true,
    message: `Cancelled. ${result.dealsCancelled} order${result.dealsCancelled === 1 ? '' : 's'} cancelled and the items are available again.${result.depositMayBePaid ? ' A deposit was marked as paid: remember to refund it.' : ''}`,
  }
}

/**
 * You checked your bank and the money is there. Marks the receipt verified, confirms the order if it was still waiting
 * (creating its orders), and marks the deposit as paid on every order, so the customer sees "Order received".
 */
export async function verifyReceiptAction(_prev: CheckoutActionResult | null, formData: FormData): Promise<CheckoutActionResult> {
  await assertAdmin()
  const receiptId = typeof formData.get('receipt_id') === 'string' ? (formData.get('receipt_id') as string) : ''
  if (!UUID.test(receiptId)) return { ok: false, message: 'Missing receipt.' }
  const db = createAdminSupabaseClient()
  const r = await reviewReceipt(db, receiptId, 'verified', null)
  if (!r.ok) return { ok: false, message: r.message }

  const { data: order } = await db.from('checkout_orders').select('status').eq('id', r.checkoutId).maybeSingle()
  if (order?.status === 'cancelled' || order?.status === 'rejected') {
    refresh()
    return { ok: false, message: 'Receipt marked verified, but this order is cancelled. The customer paid for an order that no longer exists: refund them.' }
  }
  if (order?.status === 'pending' || order?.status === 'expired') {
    const approved = await approveCheckout(db, r.checkoutId)
    if (!approved.ok) { refresh(); return { ok: false, message: `Receipt verified, but the order could not be confirmed: ${approved.message}` } }
  }
  const { data: deals } = await db.from('deals').select('id').eq('checkout_id', r.checkoutId).eq('status', 'deposit_pending')
  for (const d of (deals ?? []) as { id: string }[]) {
    await updateDealStatus(d.id, 'deposit_paid', undefined, 'We received your deposit. Thank you!')
  }
  refresh()
  return { ok: true, message: 'Verified. The order is confirmed and the deposit is marked as paid.' }
}

/** The money is not there (or the receipt is unreadable): the customer is asked to send a new one. */
export async function rejectReceiptAction(_prev: CheckoutActionResult | null, formData: FormData): Promise<CheckoutActionResult> {
  await assertAdmin()
  const receiptId = typeof formData.get('receipt_id') === 'string' ? (formData.get('receipt_id') as string) : ''
  if (!UUID.test(receiptId)) return { ok: false, message: 'Missing receipt.' }
  const note = typeof formData.get('note') === 'string' ? (formData.get('note') as string).trim() : ''
  const r = await reviewReceipt(createAdminSupabaseClient(), receiptId, 'rejected', note || null)
  if (!r.ok) return { ok: false, message: r.message }
  refresh()
  return { ok: true, message: 'Rejected. The customer sees that they should send a new receipt.' }
}
