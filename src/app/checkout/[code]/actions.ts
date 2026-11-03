// src/app/checkout/[code]/actions.ts
// Public action: the customer cancels their own order before you confirmed it. The order's secret token (from the link
// they got after ordering) is the proof; nobody else can cancel an order.

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cancelByCustomer } from '@/lib/checkout-service'
import { normalizeOrderCode } from '@/lib/orders'
import { escapeTelegramHtml, sendTelegramMessage } from '@/lib/telegram'

export interface CancelMyOrderResult { ok: boolean; message: string }

export async function cancelMyOrder(code: string, token: string): Promise<CancelMyOrderResult> {
  const clean = normalizeOrderCode(code)
  if (!clean || typeof token !== 'string' || token.length === 0 || token.length > 200) return { ok: false, message: 'We could not find this order.' }
  const result = await cancelByCustomer(createAdminSupabaseClient(), clean, token)
  if (!result.ok) return { ok: false, message: result.message }
  await sendTelegramMessage(`🚫 <b>Customer cancelled order ${escapeTelegramHtml(clean)}</b>\nThe items are back on sale. Nothing else to do.`)
  revalidatePath(`/checkout/${clean}`)
  revalidatePath('/admin/checkouts')
  revalidatePath('/products')
  return { ok: true, message: 'Your order was cancelled.' }
}
