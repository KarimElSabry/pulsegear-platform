// src/app/admin/requests/page.tsx

import { createAdminSupabaseClient } from '@/lib/supabase'
import { updateProductRequestStatus } from '@/app/admin/requests/actions'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'sourcing', label: 'Sourcing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default async function AdminRequestsPage() {
  const supabase = createAdminSupabaseClient()

  const { data: requests, error } = await supabase
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
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Admin
          </p>
          <h1 className="text-4xl font-black text-white mt-2">Product Requests</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Track requests and update whether you have contacted the customer.
          </p>
        </div>

        <div className="space-y-4">
          {requests?.map((request: any) => (
            <div
              key={request.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                      Request #{request.id}
                    </span>
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                      {request.user_id ? 'Account linked' : 'Guest'}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    {request.requested_product}
                  </h2>

                  <p className="text-sm text-zinc-400">
                    {request.customer_name} · {request.email} · {request.phone}
                  </p>

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

                <form action={updateProductRequestStatus} className="min-w-[240px] space-y-3">
                  <input type="hidden" name="request_id" value={request.id} />

                  <label className="block text-sm text-zinc-300">Request Status</label>
                  <select
                    name="status"
                    defaultValue={request.status || 'pending'}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
                  >
                    Save Status
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}