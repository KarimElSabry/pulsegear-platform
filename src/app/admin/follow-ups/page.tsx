// src/app/admin/follow-ups/page.tsx
// "Who should I message today": open requests, unpaid deposits and pending reservations, oldest first, with a ready WhatsApp message.

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { buildFollowUps } from '@/lib/orders'

export const dynamic = 'force-dynamic'

const LABEL = { request: 'Open request', deposit: 'Deposit not paid', reservation: 'Reservation pending' } as const
const COLOR = { request: 'bg-blue-500/20 text-blue-300', deposit: 'bg-yellow-500/20 text-yellow-300', reservation: 'bg-purple-500/20 text-purple-300' } as const

export default async function FollowUpsPage() {
  await assertAdmin()
  const db = createAdminSupabaseClient()
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString()
  const [requests, deals, reservations] = await Promise.all([
    db.from('product_requests').select('id, customer_name, phone, requested_product, status, created_at').gte('created_at', since),
    db.from('deals').select('id, product_request_id, customer_name, phone, status, created_at').gte('created_at', since),
    db.from('reservations').select('id, name, phone, status, created_at').gte('created_at', since),
  ])
  const err = [requests, deals, reservations].find(r => r.error)?.error
  const list = err ? [] : buildFollowUps({ requests: requests.data ?? [], deals: deals.data ?? [], reservations: reservations.data ?? [] })

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Follow-ups</h1>
        <p className="text-zinc-400 text-sm mt-1">People who showed interest but have not moved forward (last 60 days). One tap opens WhatsApp with a message already written. Most sales are lost in the silence after the first message, so work this list once a day.</p>
      </div>
      {err && <p className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">Could not load: {err.message}</p>}
      <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
        {list.length === 0 && !err && <li className="p-6 text-sm text-zinc-500">Nobody is waiting. 🎉</li>}
        {list.map(f => (
          <li key={`${f.kind}-${f.ref}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${COLOR[f.kind]}`}>{LABEL[f.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold">{f.name} <span className="text-zinc-500 font-normal">· {f.what}</span></p>
              <p className="text-zinc-500 text-xs">{f.phone || 'no phone'} · waiting {f.ageDays} day{f.ageDays === 1 ? '' : 's'}</p>
            </div>
            {f.whatsapp
              ? <a href={f.whatsapp} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">WhatsApp</a>
              : <span className="text-xs text-zinc-600">no phone</span>}
            <a href={f.link} className="text-xs text-zinc-400 hover:text-white underline">Open</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
