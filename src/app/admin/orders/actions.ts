// src/app/admin/orders/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

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

/** Tracking number, carrier and the short note the customer sees. */
export async function saveOrderTracking(_prev: OrderActionResult | null, formData: FormData): Promise<OrderActionResult> {
  await assertAdmin()
  const dealId = clean(formData.get('deal_id'), 64)
  if (!dealId) return { ok: false, message: 'Missing order.' }
  const { error } = await createAdminSupabaseClient().from('deals').update({
    tracking_number: clean(formData.get('tracking_number'), 80),
    carrier: clean(formData.get('carrier'), 40),
    customer_message: clean(formData.get('customer_message'), 300),
  }).eq('id', dealId)
  if (error) return { ok: false, message: error.message.includes('tracking_number') ? 'Run migration 20261020_01_deals_account_link.sql first.' : error.message }
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  return { ok: true, message: 'Saved.' }
}
