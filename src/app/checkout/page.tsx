// src/app/checkout/page.tsx
// Checkout: delivery details and the Confirm order button. Logged-in customers get their name and phone filled in.

import type { Metadata } from 'next'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = { title: 'Checkout | Pulse Gear Egypt', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const db = createAdminSupabaseClient()
  let defaults = { name: '', phone: '', email: '' }
  let loggedIn = false
  try {
    const { data: { user } } = await (await createServerSupabaseClient()).auth.getUser()
    if (user) {
      loggedIn = true
      const { data: p } = await db.from('profiles').select('first_name, last_name, phone').eq('user_id', user.id).maybeSingle()
      defaults = {
        name: [p?.first_name, p?.last_name].filter(Boolean).join(' '),
        phone: (p?.phone as string | undefined) ?? '',
        email: user.email ?? '',
      }
    }
  } catch { /* guest */ }

  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">Checkout</h1>
      <CheckoutClient defaults={defaults} loggedIn={loggedIn} />
    </div>
  )
}
