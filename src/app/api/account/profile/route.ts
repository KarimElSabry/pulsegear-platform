// src/app/api/account/profile/route.ts

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const authSupabase = await createServerSupabaseClient()
    const adminSupabase = createAdminSupabaseClient()

    const {
      data: { user },
    } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const payload = {
      user_id: user.id,
      first_name: body.first_name ?? '',
      last_name: body.last_name ?? '',
      phone: body.phone ?? '',
      newsletter_subscribed: body.newsletter_subscribed ?? false,
      current_sport: body.current_sport ?? '',
      next_event: body.next_event ?? '',
      next_event_date: body.next_event_date || null,
      current_pr: body.current_pr ?? '',
      target_pr: body.target_pr ?? '',
      current_watch: body.current_watch ?? '',
      current_heart_rate_strap: body.current_heart_rate_strap ?? '',
      planned_watch: body.planned_watch ?? '',
      planned_heart_rate_strap: body.planned_heart_rate_strap ?? '',
      training_style: body.training_style ?? '',
      team_name: body.training_style === 'With team' ? body.team_name ?? '' : '',
      experience_level: body.experience_level ?? '',
      primary_goal: body.primary_goal ?? '',
      training_days_per_week:
        body.training_days_per_week !== null &&
        body.training_days_per_week !== undefined &&
        body.training_days_per_week !== ''
          ? Number(body.training_days_per_week)
          : null,
    }

    const { error } = await adminSupabase.from('profiles').upsert(payload)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}