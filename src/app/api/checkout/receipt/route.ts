// src/app/api/checkout/receipt/route.ts
// Public. The customer uploads the transfer receipt for their order's deposit. The order's secret token (from the link
// they got after ordering) is the proof of ownership. Size, file type and the number of receipts are limited.

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/checkout-http'
import { normalizeOrderCode } from '@/lib/orders'
import { MAX_RECEIPT_BYTES } from '@/lib/receipts'
import { RECEIPT_BUCKET, submitReceipt } from '@/lib/receipt-service'
import { egp } from '@/lib/checkout-core'
import { escapeTelegramHtml as esc, sendTelegramMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const err = (message: string, status: number) => NextResponse.json({ error: message }, { status })

export async function POST(req: Request) {
  if (!rateLimit(`receipt-ip:${clientIp(req)}`, 10, 10 * 60_000)) return err('Too many uploads from this connection. Please wait a few minutes.', 429)
  const declared = Number(req.headers.get('content-length') ?? 0)
  if (declared > MAX_RECEIPT_BYTES + 200_000) return err('The file is too large (4 MB at most). Send a screenshot instead of the original photo.', 413)

  let form: FormData
  try { form = await req.formData() } catch { return err('Invalid request', 400) }

  const code = normalizeOrderCode(String(form.get('code') ?? ''))
  const token = String(form.get('token') ?? '')
  const file = form.get('file')
  if (!code || !token || token.length > 200) return err('We could not find this order.', 404)
  if (!rateLimit(`receipt-order:${code}`, 8, 60 * 60_000)) return err('Too many uploads for this order. Please contact us on WhatsApp.', 429)
  if (!(file instanceof File)) return err('Choose your receipt (a screenshot, photo or PDF).', 400)
  if (file.size > MAX_RECEIPT_BYTES) return err('The file is too large (4 MB at most). Send a screenshot instead of the original photo.', 413)

  const db = createAdminSupabaseClient()
  const result = await submitReceipt(
    db,
    (path, bytes, mime) => db.storage.from(RECEIPT_BUCKET).upload(path, bytes, { contentType: mime, upsert: false }),
    {
      code, token, bytes: new Uint8Array(await file.arrayBuffer()),
      fields: { method: form.get('method'), amount: form.get('amount'), payerName: form.get('payerName'), payerPhone: form.get('payerPhone') },
    },
  )
  if (!result.ok) return err(result.message, result.status)

  await sendTelegramMessage(
    [
      '🧾 <b>Deposit receipt uploaded</b>',
      `<b>Order:</b> ${esc(result.code)}`,
      `<b>Deposit due:</b> ${egp(result.depositDue)}${result.amountEgp !== null ? ` · customer says they sent ${egp(result.amountEgp)}` : ''}`,
      result.payerPhone ? `<b>Paid from:</b> ${esc(result.payerPhone)}` : '',
      '',
      'Check your bank, then press Verify on Admin > Orders.',
    ].filter(Boolean).join('\n'),
  )
  revalidatePath(`/checkout/${code}`)
  revalidatePath('/admin/checkouts')
  return NextResponse.json({ ok: true, message: 'Receipt received. We will check it and confirm your order shortly.' })
}
