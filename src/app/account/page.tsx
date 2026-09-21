// src/app/account/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            My Account
          </p>
          <h1 className="text-4xl font-black text-white mt-2">Welcome back</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Signed in as <span className="text-white font-medium">{user.email}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/account/profile"
            className="bg-zinc-900 border border-zinc-800 hover:border-red-500 rounded-2xl p-6 transition"
          >
            <div className="text-3xl mb-3">👤</div>
            <h2 className="text-white font-bold text-xl">Profile</h2>
            <p className="text-zinc-400 text-sm mt-2">
              Manage your name, phone number, and newsletter preference.
            </p>
          </Link>

          <Link
            href="/account/wishlist"
            className="bg-zinc-900 border border-zinc-800 hover:border-red-500 rounded-2xl p-6 transition"
          >
            <div className="text-3xl mb-3">❤️</div>
            <h2 className="text-white font-bold text-xl">Wishlist</h2>
            <p className="text-zinc-400 text-sm mt-2">
              View and manage your saved products across devices.
            </p>
          </Link>

          <Link
            href="/account/reservations"
            className="bg-zinc-900 border border-zinc-800 hover:border-red-500 rounded-2xl p-6 transition"
          >
            <div className="text-3xl mb-3">📦</div>
            <h2 className="text-white font-bold text-xl">Reservations</h2>
            <p className="text-zinc-400 text-sm mt-2">
              Track your product reservations and their current status.
            </p>
          </Link>

          <Link
            href="/account/requests"
            className="bg-zinc-900 border border-zinc-800 hover:border-red-500 rounded-2xl p-6 transition"
          >
            <div className="text-3xl mb-3">📝</div>
            <h2 className="text-white font-bold text-xl">Product Requests</h2>
            <p className="text-zinc-400 text-sm mt-2">
              See the requests you submitted and follow their progress.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}