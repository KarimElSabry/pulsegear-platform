// src/app/admin/checkouts/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { approveCheckout, rejectCheckout } from '@/lib/checkout-service'

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

/** The customer did not confirm: the items go back on sale and the customer sees your reason. */
export async function rejectCheckoutOrder(_prev: CheckoutActionResult | null, formData: FormData): Promise<CheckoutActionResult> {
  await assertAdmin()
  const id = idOf(formData)
  if (!id) return { ok: false, message: 'Missing order.' }
  const reason = typeof formData.get('reason') === 'string' ? (formData.get('reason') as string) : ''
  const result = await rejectCheckout(createAdminSupabaseClient(), id, reason)
  if (!result.ok) return { ok: false, message: result.message ?? 'Could not reject.' }
  refresh()
  return { ok: true, message: 'Rejected. The items are available again.' }
}
