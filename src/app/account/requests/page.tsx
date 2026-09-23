// src/app/account/requests/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AccountTabs from '@/components/account/AccountTabs'

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  contacted: 'bg-blue-500/20 text-blue-400',
  sourcing: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  sourcing: 'Sourcing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default async function AccountRequestsPage() {
  const authSupabase = await createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user },
  } = await authSupabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: requests, error } = await adminSupabase
    .from('product_requests')
    .select(`
      id,
      customer_name,
      email,
      phone,
      requested_product,
      budget,
      notes,
      status,
      created_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Account
          </p>
          <h1 className="text-4xl font-black text-white mt-2">My Product Requests</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Review the products you asked us to source for you.
          </p>
        </div>

        <AccountTabs />

        {!requests || requests.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-zinc-300 text-lg font-semibold mb-2">
              No product requests yet
            </p>
            <p className="text-zinc-500 mb-6">
              Once you submit a request while logged in, it will appear here.
            </p>
            <Link
              href="/request-product"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Request a Product
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => {
              const status = request.status || 'pending'

              return (
                <div
                  key={request.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                        Request #{request.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[status] ?? 'bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {statusLabels[status] ?? status}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">
                      {request.requested_product}
                    </h2>

                    <p className="text-sm text-zinc-400">
                      Submitted on{' '}
                      {new Date(request.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>

                    {request.budget && (
                      <p className="text-sm text-zinc-300">
                        Budget:{' '}
                        <span className="text-green-400 font-semibold">
                          {Number(request.budget).toLocaleString('en-US')} EGP
                        </span>
                      </p>
                    )}

                    {request.notes && (
                      <p className="text-sm text-zinc-400">
                        Notes: <span className="text-zinc-300">{request.notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}