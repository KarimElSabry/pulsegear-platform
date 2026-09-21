// src/app/api/newsletter/subscribe/route.ts

import { NextResponse } from 'next/server'
import { addContactToBrevo } from '@/lib/brevo'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    await addContactToBrevo(email, name || undefined)

    return NextResponse.json(
      { success: true, message: 'Subscribed successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    const message = error?.message || 'Subscription failed'

    if (message.includes('BREVO_API_KEY') || message.includes('BREVO_NEWSLETTER_LIST_ID')) {
      return NextResponse.json(
        { error: 'Newsletter service is not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: message || 'Brevo API failure' },
      { status: 502 }
    )
  }
}