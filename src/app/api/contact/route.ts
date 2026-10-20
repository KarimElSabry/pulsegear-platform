// src/app/api/contact/route.ts
// Public contact form. Sends the message to your Telegram chat and, as before, to the Google Sheet script.
// Reports success only when at least one of them took the message, so a customer is never told "sent" when nothing arrived.

import { NextResponse } from 'next/server'
import { escapeTelegramHtml as esc, sendTelegramMessage } from '@/lib/telegram'
import { rateLimit } from '@/lib/rate-limit'
import { normalizeOrderCode } from '@/lib/orders'

const GOOGLE_SCRIPT_URL = process.env.CONTACT_FORWARD_URL || 'https://script.google.com/macros/s/AKfycbw_m5sS_5s9Us1vNA1MMeSobyMwg2NnJEJNcUCGa6Vlc-zOtdWeFXGCaCw1GgBDpEhDpg/exec'

const text = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ status: 'error', message: 'Too many messages. Please try again in a few minutes.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ status: 'error', message: 'Invalid request' }, { status: 400 }) }

  // plain-text fields only, with sane limits (the message keeps its line breaks)
  const name = text(body.name, 100)
  const email = text(body.email, 150)
  const phone = text(body.phone, 30)
  const subject = text(body.subject, 150)
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
  const orderCode = normalizeOrderCode(typeof body.orderCode === 'string' ? body.orderCode : null)

  if (!name || !subject || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ status: 'error', message: 'Please fill in your name, a valid email, a subject and your message.' }, { status: 400 })
  }

  const telegramOk = await sendTelegramMessage(
    [
      orderCode ? `❓ <b>Question about order ${esc(orderCode)}</b>` : '✉️ <b>New contact message</b>',
      '',
      `<b>Name:</b> ${esc(name)}`,
      `<b>Email:</b> ${esc(email)}`,
      phone ? `<b>Phone:</b> ${esc(phone)}` : null,
      `<b>Subject:</b> ${esc(subject)}`,
      '',
      esc(message),
      orderCode ? '\nFind it in Admin → Orders.' : null,
    ].filter((l): l is string => l !== null).join('\n')
  )

  // the existing Google Sheet copy; its failure is not shown to the customer if Telegram worked
  let sheetOk = false
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, subject: orderCode ? `[${orderCode}] ${subject}` : subject, message, formType: 'contact' }),
    })
    sheetOk = res.ok
  } catch (err) {
    console.error('[contact] sheet forward failed:', err instanceof Error ? err.message : err)
  }

  if (!telegramOk && !sheetOk) {
    console.error('[contact] message could not be delivered anywhere')
    return NextResponse.json({ status: 'error', message: 'Something went wrong. Please try again.' }, { status: 502 })
  }
  return NextResponse.json({ status: 'success' })
}
