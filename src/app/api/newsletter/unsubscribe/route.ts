// src/app/api/newsletter/unsubscribe/route.ts

import { NextResponse } from 'next/server'
import { removeContactFromBrevo } from '@/lib/brevo'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    await removeContactFromBrevo(email)

    return NextResponse.json(
      { success: true, message: 'Unsubscribed successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}