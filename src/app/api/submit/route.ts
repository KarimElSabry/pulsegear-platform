// src/app/api/submit/route.ts

import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { escapeTelegramHtml as esc, sendTelegramMessage } from '@/lib/telegram'

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function parseBudget(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function isValidEmail(email: string | null): boolean {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const authSupabase = await createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const {
      data: { user },
    } = await authSupabase.auth.getUser()

    const name = cleanString(body?.name)
    const email = cleanString(body?.email)?.toLowerCase() ?? null
    const phone = cleanString(body?.phone)
    const governorate = cleanString(body?.governorate)
    const city = cleanString(body?.city)
    const street = cleanString(body?.street)
    const product = cleanString(body?.product)
    const budget = parseBudget(body?.budget)
    const notes = cleanString(body?.notes)

    if (!name || !email || !phone || !governorate || !city || !street || !product) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid email address' },
        { status: 400 }
      )
    }

    const { error } = await adminSupabase.from('product_requests').insert([
      {
        customer_name: name,
        email,
        phone,
        governorate,
        city,
        street,
        requested_product: product,
        budget,
        notes,
        status: 'new',
        user_id: user?.id ?? null,
      },
    ])

    if (error) throw error

    // Awaited so the serverless function doesn't exit before Telegram is called; failures are swallowed.
    await sendTelegramMessage(
      [
        '🛒 <b>New product request</b>',
        '',
        `<b>Product:</b> ${esc(product)}`,
        budget ? `<b>Budget:</b> ${budget.toLocaleString('en-US')} EGP` : null,
        `<b>Name:</b> ${esc(name)}`,
        `<b>Phone:</b> ${esc(phone)}`,
        `<b>Email:</b> ${esc(email)}`,
        `<b>Address:</b> ${esc(`${street}, ${city}, ${governorate}`)}`,
        notes ? `<b>Notes:</b> ${esc(notes)}` : null,
        '',
        'Manage it in Admin → Requests.',
      ]
        .filter((line): line is string => line !== null)
        .join('\n')
    )

    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (err: any) {
    console.error('Submit error:', err)
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Something went wrong' },
      { status: 500 }
    )
  }
}