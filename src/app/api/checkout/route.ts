// src/app/api/checkout/route.ts
// Public. The customer pressed "Confirm order": validates the details, holds the items for 24 hours, tells you on Telegram
// (with a WhatsApp link) and returns the order code plus a secret token for the customer's confirmation page.
// Works for guests and for logged-in customers. No payment is taken here.

import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { egp, validateCustomer } from '@/lib/checkout-core'
import { placeCheckout } from '@/lib/checkout-service'
import { orderWhatsappLink } from '@/lib/checkout-messages'
import { escapeTelegramHtml as esc, sendTelegramMessage } from '@/lib/telegram'
import { clientIp, linesFromBody } from '@/lib/checkout-http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 6, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many orders from this connection. Please wait a few minutes.' }, { status: 429 })
  }
  let body: { lines?: unknown; customer?: Record<string, unknown>; discountCode?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const lines = linesFromBody(body.lines)
  if (lines.length === 0) return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })

  const customer = validateCustomer(body.customer ?? {})
  if (!customer.ok) return NextResponse.json({ error: 'Please check your details', fields: customer.errors }, { status: 400 })

  const db = createAdminSupabaseClient()

  // logged in? then the order is linked to the account (best effort, guests are fine)
  let userId: string | null = null
  try {
    const auth = await createServerSupabaseClient()
    userId = (await auth.auth.getUser()).data.user?.id ?? null
  } catch { /* guest */ }

  const result = await placeCheckout(db, {
    lines, customer: customer.value, userId,
    discountCode: typeof body.discountCode === 'string' ? body.discountCode : null,
  })
  if (!result.ok) {
    const status = result.reason === 'DB' ? 500 : result.reason === 'UNAVAILABLE' ? 409 : 400
    return NextResponse.json({ error: result.message, reason: result.reason }, { status })
  }

  // tell you right away, with a ready WhatsApp message to the customer
  const c = customer.value
  const { data: items } = await db.from('checkout_items').select('title, color_name, quantity, note').eq('checkout_id', result.id)
  const rows = (items ?? []) as { title: string; color_name: string | null; quantity: number; note: string | null }[]
  const wa = orderWhatsappLink({ customer_name: c.name, phone: c.phone, code: result.code }, rows)
  await sendTelegramMessage(
    [
      '🛒 <b>New order to confirm</b>',
      '',
      `<b>Order:</b> ${esc(result.code)}`,
      ...rows.map((i) => `• ${esc(i.title)}${i.color_name ? ` (${esc(i.color_name)})` : ''} x${i.quantity}${i.note ? ` — note: ${esc(i.note)}` : ''}`),
      '',
      `<b>Total:</b> ${egp(result.totals.total)}`,
      `<b>Customer:</b> ${esc(c.name)}  ${esc(c.phone)}`,
      `<b>Address:</b> ${esc(c.address)}`,
      c.note ? `<b>Order note:</b> ${esc(c.note)}` : '',
      '',
      wa ? `<a href="${wa}">Message the customer on WhatsApp</a>` : 'No valid phone number for WhatsApp.',
      'The items are held for 24 hours. After they confirm, press Approve in Admin → Online orders.',
    ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n')
  )

  return NextResponse.json({ code: result.code, token: result.token, totalEgp: result.totals.total, holdExpiresAt: result.holdExpiresAt })
}
