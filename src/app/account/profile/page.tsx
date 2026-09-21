// src/app/account/profile/page.tsx

import { redirect } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProfileForm from './ProfileForm'

export default async function AccountProfilePage() {
  const authSupabase = await createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user },
  } = await authSupabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, phone, newsletter_subscribed')
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
      .select('id, user_id, first_name, last_name, phone, newsletter_subscribed')
      .single()

    if (createError) {
      throw new Error(createError.message)
    }

    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
              Account
            </p>
            <h1 className="text-4xl font-black text-white mt-2">Profile</h1>
            <p className="text-zinc-400 mt-3 text-sm">
              Manage your personal details and newsletter preference.
            </p>
          </div>

          <ProfileForm
            userEmail={user.email ?? ''}
            initialProfile={{
              first_name: created.first_name ?? '',
              last_name: created.last_name ?? '',
              phone: created.phone ?? '',
              newsletter_subscribed: created.newsletter_subscribed ?? false,
            }}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Account
          </p>
          <h1 className="text-4xl font-black text-white mt-2">Profile</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Manage your personal details and newsletter preference.
          </p>
        </div>

        <ProfileForm
          userEmail={user.email ?? ''}
          initialProfile={{
            first_name: profile.first_name ?? '',
            last_name: profile.last_name ?? '',
            phone: profile.phone ?? '',
            newsletter_subscribed: profile.newsletter_subscribed ?? false,
          }}
        />
      </div>
    </main>
  )
}