// src/app/api/account/profile/route.ts

import { NextResponse } from 'next/server'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase'

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(req: Request) {
  try {
    const authSupabase = await createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const {
      data: { user },
    } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const firstName = cleanString(body?.first_name)
    const lastName = cleanString(body?.last_name)
    const phone = cleanString(body?.phone)
    const newsletterSubscribed = Boolean(body?.newsletter_subscribed)

    const { error } = await adminSupabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          newsletter_subscribed: newsletterSubscribed,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Brevo sync hook can be added here next:
    // - subscribe when newsletterSubscribed = true
    // - unsubscribe when newsletterSubscribed = false

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}