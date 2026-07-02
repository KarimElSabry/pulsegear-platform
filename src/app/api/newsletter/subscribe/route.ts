// src/app/api/newsletter/subscribe/route.ts

import { NextResponse } from 'next/server'
import { addContactToBrevo } from '@/lib/brevo'

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    await addContactToBrevo(email, name)

    return NextResponse.json(
      { success: true, message: 'Subscribed successfully!' },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Subscription failed' },
      { status: 500 }
    )
  }
}