// src/app/admin/requests/page.tsx

import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { updateProductRequestStatus } from '@/app/admin/requests/actions'
import { REQUEST_STATUSES } from '@/app/admin/requests/statuses'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  deal_agreed: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filter } = await searchParams
  const supabase = createAdminSupabaseClient()

  const { data: requests, error } = await supabase
    .from('product_requests')
    .select(
      'id, customer_name, email, phone, instagram, governorate, city, street, requested_product, budget, notes, status, created_at, user_id'
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const all = requests ?? []
  const counts: Record<string, number> = {}
  for (const r of all) counts[r.status || 'new'] = (counts[r.status || 'new'] ?? 0) + 1

  const visible = filter ? all.filter((r) => (r.status || 'new') === filter) : all

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">Admin</p>
          <h1 className="text-4xl font-black text-white mt-2">Product Requests</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Everything customers fill in on the request form. New requests also arrive on Telegram.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/admin/requests"
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              !filter
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            All ({all.length})
          </Link>
          {REQUEST_STATUSES.map((s) => (
            <Link
              key={s.value}
              href={`/admin/requests?status=${s.value}`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                filter === s.value
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {s.label} ({counts[s.value] ?? 0})
            </Link>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-zinc-500 text-sm">No requests{filter ? ' with this status' : ''}.</p>
        )}

        <div className="space-y-4">
          {visible.map((request) => {
            const status = request.status || 'new'
            const digits = String(request.phone ?? '').replace(/\D/g, '')
            const waNumber = digits.startsWith('0') ? `2${digits}` : digits
            const address = [request.street, request.city, request.governorate].filter(Boolean).join(', ')

            return (
              <div key={request.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                        Request #{request.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          STATUS_STYLES[status] ?? 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {REQUEST_STATUSES.find((s) => s.value === status)?.label ?? status}
                      </span>
                      <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                        {request.user_id ? 'Account linked' : 'Guest'}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">{request.requested_product}</h2>

                    <p className="text-sm text-zinc-400">
                      {request.customer_name} · {request.email} ·{' '}
                      {digits ? (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:underline"
                        >
                          {request.phone}
                        </a>
                      ) : (
                        request.phone
                      )}
                    </p>

                    {address && <p className="text-sm text-zinc-400">📍 {address}</p>}

                    <p className="text-sm text-zinc-500">
                      Submitted{' '}
                      {new Date(request.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
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
                      defaultValue={status}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    >
                      {REQUEST_STATUSES.map((option) => (
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
            )
          })}
        </div>
      </div>
    </main>
  )
}
