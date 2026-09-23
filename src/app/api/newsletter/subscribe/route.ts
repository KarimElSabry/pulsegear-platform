// src/app/api/newsletter/subscribe/route.ts

import { NextResponse } from 'next/server'
import { addContactToBrevo } from '@/lib/brevo'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const allowedSources = ['homepage', 'footer', 'deals', 'account_settings'] as const

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    const name =
      typeof body?.name === 'string' ? body.name.trim() : ''

    const source =
      typeof body?.source === 'string' &&
      allowedSources.includes(body.source as (typeof allowedSources)[number])
        ? body.source
        : 'footer'

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    await addContactToBrevo(email, name || undefined, {
      source,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Subscribed successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    const message = error?.message || 'Subscription failed'

    if (
      message.includes('BREVO_API_KEY') ||
      message.includes('BREVO_NEWSLETTER_LIST_ID')
    ) {
      return NextResponse.json(
        { error: 'Newsletter service is not configured' },
        { status: 500 }
      )
    }

    if (
      message.toLowerCase().includes('duplicate') ||
      message.toLowerCase().includes('already exists') ||
      message.toLowerCase().includes('contact already exist')
    ) {
      return NextResponse.json(
        {
          success: true,
          message: 'You are already subscribed.',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: message || 'Brevo API failure' },
      { status: 502 }
    )
  }
}