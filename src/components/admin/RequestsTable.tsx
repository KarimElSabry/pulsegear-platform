// src/components/admin/RequestsTable.tsx
'use client'

import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

type LinkedDeal = {
  id:                string
  status:            string
  selling_price_egp: number | null
  deposit_amount_egp: number | null
  created_at:        string
}

type Request = {
  id:                number
  created_at:        string
  customer_name:     string
  email:             string
  phone:             string
  instagram:         string | null
  governorate:       string
  city:              string
  street:            string
  requested_product: string
  budget:            number | null
  notes:             string | null
  status:            string
  deals:             LinkedDeal[]
}

const STATUS_COLORS: Record<string, string> = {
  new:          'bg-blue-500/20   text-blue-400',
  contacted:    'bg-yellow-500/20 text-yellow-400',
  deal_agreed:  'bg-purple-500/20 text-purple-400',
  completed:    'bg-green-500/20  text-green-400',
  cancelled:    'bg-red-500/20    text-red-400',
}

const DEAL_STATUS_COLORS: Record<string, string> = {
  deposit_pending: 'bg-yellow-500/20 text-yellow-400',
  deposit_paid:    'bg-blue-500/20   text-blue-400',
  shipping:        'bg-purple-500/20 text-purple-400',
  arrived_egypt:   'bg-orange-500/20 text-orange-400',
  delivered:       'bg-teal-500/20   text-teal-400',
  completed:       'bg-green-500/20  text-green-400',
  cancelled:       'bg-red-500/20    text-red-400',
}

export default function RequestsTable({ requests }: { requests: Request[] }) {
  const router               = useRouter()
  const [search, setSearch]  = useState('')
  const [filter, setFilter]  = useState('all')
  const [selected, setSelected] = useState<Request | null>(null)
  const [updating, setUpdating] = useState(false)

  const filtered = requests.filter(r => {
    const matchSearch =
      r.customer_name?.toLowerCase().includes(search.toLowerCase())    ||
      r.requested_product?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search)
    const matchFilter = filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  async function handleStatusUpdate(id: number, newStatus: string) {
    setUpdating(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase
      .from('product_requests')
      .update({ status: newStatus })
      .eq('id', id)
    setUpdating(false)
    router.refresh()
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, product, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500
                     rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5
                     focus:outline-none focus:border-red-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="deal_agreed">Deal Agreed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Linked Deals</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-zinc-500 py-12">
                  No requests found
                </td>
              </tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
                <td className="px-4 py-3 text-zinc-500">{r.id}</td>
                <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3 text-white font-medium">{r.customer_name}</td>
                <td className="px-4 py-3 text-zinc-300">{r.phone}</td>
                <td className="px-4 py-3 text-white font-semibold">{r.requested_product}</td>
                <td className="px-4 py-3 text-green-400 font-medium">
                  {r.budget ? `${r.budget.toLocaleString()} EGP` : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.city}, {r.governorate}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                    {r.status}
                  </span>
                </td>

                {/* ✅ Linked Deals Column */}
                <td className="px-4 py-3">
                  {r.deals && r.deals.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {r.deals.map(d => (
                        <a
                          key={d.id}
                          href="/admin/deals"
                          className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap
                            ${DEAL_STATUS_COLORS[d.status] ?? 'bg-zinc-700 text-zinc-300'}`}
                        >
                          🤝 {d.status.replace(/_/g, ' ')}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <a
                      href="/admin/deals"
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline whitespace-nowrap"
                    >
                      + Create Deal
                    </a>
                  )}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(r)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white uppercase">
                Request #{selected.id}
              </h2>
              <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white text-xl">✕</button>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-3 text-sm mb-5">
              {([
                ['Name',        selected.customer_name],
                ['Email',       selected.email],
                ['Phone',       selected.phone],
                ['Instagram',   selected.instagram || '—'],
                ['Governorate', selected.governorate],
                ['City',        selected.city],
                ['Street',      selected.street],
                ['Product',     selected.requested_product],
                ['Budget',      selected.budget ? `${selected.budget.toLocaleString()} EGP` : '—'],
                ['Notes',       selected.notes || '—'],
                ['Submitted',   new Date(selected.created_at).toLocaleString('en-GB')],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-zinc-500 w-28 shrink-0">{label}:</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>

            {/* ✅ Linked Deals in Modal */}
            {selected.deals && selected.deals.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                  Linked Deals
                </p>
                {selected.deals.map(d => (
                  <div key={d.id} className="bg-zinc-800 rounded-xl p-3 flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${DEAL_STATUS_COLORS[d.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                    {d.selling_price_egp && (
                      <span className="text-green-400 text-xs font-bold">
                        {d.selling_price_egp.toLocaleString()} EGP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Update Status */}
            <div className="mb-5">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {['new', 'contacted', 'deal_agreed', 'completed', 'cancelled'].map(s => (
                  <button
                    key={s}
                    disabled={updating || selected.status === s}
                    onClick={() => handleStatusUpdate(selected.id, s)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition
                      ${selected.status === s
                        ? 'opacity-50 cursor-not-allowed ' + (STATUS_COLORS[s] ?? '')
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/2${selected.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-600 hover:bg-green-700
                           text-white py-2.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors"
              >
                📱 WhatsApp Customer
              </a>
              <a
                href="/admin/deals"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700
                           text-white py-2.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors"
              >
                🤝 Go to Deals → Create Deal
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}