// src/app/account/settings/page.tsx

import { redirect } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProfileForm from '@/components/account/ProfileForm'
import AccountTabs from '@/components/account/AccountTabs'

export default async function AccountSettingsPage() {
  const authSupabase = await createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user },
  } = await authSupabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select(`
      id,
      user_id,
      first_name,
      last_name,
      phone,
      newsletter_subscribed,
      current_sport,
      next_event,
      next_event_date,
      current_pr,
      target_pr,
      current_watch,
      current_heart_rate_strap,
      planned_watch,
      planned_heart_rate_strap,
      training_style,
      team_name,
      experience_level,
      primary_goal,
      training_days_per_week
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!profile) {
    const { data: created, error: createError } = await adminSupabase
      .from('profiles')
      .insert({
        user_id: user.id,
        newsletter_subscribed: false,
      })
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        phone,
        newsletter_subscribed,
        current_sport,
        next_event,
        next_event_date,
        current_pr,
        target_pr,
        current_watch,
        current_heart_rate_strap,
        planned_watch,
        planned_heart_rate_strap,
        training_style,
        team_name,
        experience_level,
        primary_goal,
        training_days_per_week
      `)
      .single()

    if (createError) {
      throw new Error(createError.message)
    }

    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
              Account
            </p>
            <h1 className="text-4xl font-black text-white mt-2">Settings</h1>
            <p className="text-zinc-400 mt-3 text-sm">
              Manage your personal details, sports profile, and gear preferences.
            </p>
          </div>

          <AccountTabs />

          <ProfileForm
            userEmail={user.email ?? ''}
            initialProfile={{
              first_name: created.first_name ?? '',
              last_name: created.last_name ?? '',
              phone: created.phone ?? '',
              newsletter_subscribed: created.newsletter_subscribed ?? false,
              current_sport: created.current_sport ?? '',
              next_event: created.next_event ?? '',
              next_event_date: created.next_event_date ?? '',
              current_pr: created.current_pr ?? '',
              target_pr: created.target_pr ?? '',
              current_watch: created.current_watch ?? '',
              current_heart_rate_strap: created.current_heart_rate_strap ?? '',
              planned_watch: created.planned_watch ?? '',
              planned_heart_rate_strap: created.planned_heart_rate_strap ?? '',
              training_style: created.training_style ?? '',
              team_name: created.team_name ?? '',
              experience_level: created.experience_level ?? '',
              primary_goal: created.primary_goal ?? '',
              training_days_per_week:
                created.training_days_per_week !== null &&
                created.training_days_per_week !== undefined
                  ? String(created.training_days_per_week)
                  : '',
            }}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Account
          </p>
          <h1 className="text-4xl font-black text-white mt-2">Settings</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Manage your personal details, sports profile, and gear preferences.
          </p>
        </div>

        <AccountTabs />

        <ProfileForm
          userEmail={user.email ?? ''}
          initialProfile={{
            first_name: profile.first_name ?? '',
            last_name: profile.last_name ?? '',
            phone: profile.phone ?? '',
            newsletter_subscribed: profile.newsletter_subscribed ?? false,
            current_sport: profile.current_sport ?? '',
            next_event: profile.next_event ?? '',
            next_event_date: profile.next_event_date ?? '',
            current_pr: profile.current_pr ?? '',
            target_pr: profile.target_pr ?? '',
            current_watch: profile.current_watch ?? '',
            current_heart_rate_strap: profile.current_heart_rate_strap ?? '',
            planned_watch: profile.planned_watch ?? '',
            planned_heart_rate_strap: profile.planned_heart_rate_strap ?? '',
            training_style: profile.training_style ?? '',
            team_name: profile.team_name ?? '',
            experience_level: profile.experience_level ?? '',
            primary_goal: profile.primary_goal ?? '',
            training_days_per_week:
              profile.training_days_per_week !== null &&
              profile.training_days_per_week !== undefined
                ? String(profile.training_days_per_week)
                : '',
          }}
        />
      </div>
    </main>
  )
}