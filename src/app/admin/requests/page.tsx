// src/app/admin/requests/page.tsx

import { createClient }  from '@supabase/supabase-js'
import RequestsTable     from '@/components/admin/RequestsTable'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 0

export default async function RequestsPage() {
  const { data: requests, error } = await supabase
    .from('product_requests')
    .select(`
      *,
      deals (
        id,
        status,
        selling_price_egp,
        deposit_amount_egp,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8 text-red-400">
        ❌ Failed to load requests: {error.message}
      </div>
    )
  }

  return (
    <main className="p-6 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase">
              Product Requests
            </h1>
            <p className="text-zinc-400 mt-1">
              {requests?.length ?? 0} total requests
            </p>
          </div>
          <span className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            Admin
          </span>
        </div>
        <RequestsTable requests={requests ?? []} />
      </div>
    </main>
  )
}