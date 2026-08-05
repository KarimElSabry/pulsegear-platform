// src/app/admin/leads/page.tsx

import { createClient } from '@supabase/supabase-js'
import LeadsClient from './LeadsClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function LeadsPage() {
  const [reservationsRes, requestsRes] = await Promise.all([
    supabase
      .from('reservations')
      .select('*, product:products(id, title)')
      .order('created_at', { ascending: false }),
    supabase
      .from('product_requests')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black text-white uppercase mb-2">
        🎯 Lead Management
      </h1>
      <p className="text-zinc-500 text-sm mb-8">
        Manage reservations and product requests in one place
      </p>
      <LeadsClient
        initialReservations={reservationsRes.data ?? []}
        initialRequests={requestsRes.data ?? []}
      />
    </main>
  )
}