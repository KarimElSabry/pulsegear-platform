// src/app/admin/checkouts/page.tsx
// Online orders from the cart. The customer pressed "Confirm order"; you contact them on WhatsApp, then approve or reject.

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { releaseExpired, type OrderRow } from '@/lib/checkout-service'
import { CHECKOUT_STATUS_LABEL, egp } from '@/lib/checkout-core'
import { orderWhatsappLink } from '@/lib/checkout-messages'
import { ApproveForm, RejectForm } from './CheckoutForms'

export const dynamic = 'force-dynamic'

const when = (iso: string | null) => iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

type Item = { checkout_id: string; title: string; color_name: string | null; quantity: number; unit_price_egp: number; discount_egp: number; note: string | null }

export default async function CheckoutsAdminPage() {
  await assertAdmin()
  const db = createAdminSupabaseClient()
  await releaseExpired(db)

  const { data, error } = await db.from('checkout_orders').select('*').order('created_at', { ascending: false }).limit(80)
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-3">Online orders</h1>
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-4 text-sm">
          Run supabase/migrations/20261024_01_checkout.sql in the Supabase SQL editor, then reload this page.
        </p>
      </div>
    )
  }
  const orders = (data ?? []) as OrderRow[]
  const ids = orders.map((o) => o.id)
  const { data: itemRows } = ids.length ? await db.from('checkout_items').select('checkout_id, title, color_name, quantity, unit_price_egp, discount_egp, note').in('checkout_id', ids).order('id') : { data: [] }
  const items = (itemRows ?? []) as Item[]

  const pending = orders.filter((o) => o.status === 'pending')
  const closed = orders.filter((o) => o.status !== 'pending').slice(0, 30)

  const Card = ({ o }: { o: OrderRow }) => {
    const mine = items.filter((i) => i.checkout_id === o.id)
    const wa = orderWhatsappLink(o, mine)
    const open = o.status === 'pending' || o.status === 'expired'
    return (
      <li className="p-5 space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-white font-semibold">{o.code}</span>
          <span className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-2 py-0.5">{CHECKOUT_STATUS_LABEL[o.status]}</span>
          <span className="text-xs text-zinc-500">placed {when(o.created_at)}</span>
          {o.user_id && <span className="text-xs text-green-400">has an account</span>}
        </div>

        <div className="text-sm space-y-1 text-zinc-300">
          <p className="text-white font-semibold">{o.customer_name} · {o.phone}</p>
          {o.email && <p>{o.email}</p>}
          <p>{o.address}</p>
          {o.customer_note && <p className="text-amber-300">Order note: {o.customer_note}</p>}
          <ul className="mt-2 space-y-1">
            {mine.map((i, idx) => (
              <li key={idx}>• {i.title}{i.color_name ? ` (${i.color_name})` : ''} × {i.quantity} — {egp(i.unit_price_egp * i.quantity - Number(i.discount_egp || 0))}
                {i.note && <span className="block text-xs text-amber-300 ml-3">Note: {i.note}</span>}</li>
            ))}
          </ul>
          <p className="mt-2">Total <b className="text-white">{egp(o.total_egp)}</b>{o.discount_code ? ` (code ${o.discount_code}, −${egp(o.discount_egp)})` : ''}</p>
          {o.status === 'pending' && <p className="text-xs text-zinc-500">Items held until {when(o.hold_expires_at)}.</p>}
          {o.status === 'expired' && <p className="text-xs text-amber-300">The 24-hour hold ended and the items were released. You can still approve it if they are still available.</p>}
          {o.review_note && <p className="text-zinc-400">{o.review_note}</p>}
        </div>

        {open && (
          <div className="space-y-3">
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">💬 Message the customer on WhatsApp</a>}
            <ApproveForm id={o.id} />
            <RejectForm id={o.id} />
          </div>
        )}
      </li>
    )
  }

  const Section = ({ title, list, empty }: { title: string; list: OrderRow[]; empty: string }) => (
    <section>
      <h2 className="text-lg font-semibold text-white mb-2">{title} ({list.length})</h2>
      <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
        {list.length === 0 ? <li className="p-4 text-sm text-zinc-500">{empty}</li> : list.map((o) => <Card key={o.id} o={o} />)}
      </ul>
    </section>
  )

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Online orders</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Customers who pressed <b>Confirm order</b> in the cart. Nothing is paid on the website. Message them on WhatsApp, and when they confirm,
          press <b>approve</b>: that creates their order (see Admin &gt; Orders and Deals, status &quot;Order received&quot;) and marks one-off items as sold.
          Their items are held for 24 hours; if you do not approve in time they go back on sale.
        </p>
      </div>
      <Section title="Waiting for you" list={pending} empty="No new orders." />
      <Section title="Recently closed" list={closed} empty="Nothing yet." />
    </div>
  )
}
