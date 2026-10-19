// src/app/account/orders/page.tsx
// A signed-in customer sees only the orders assigned to their own account, and only customer-safe fields.

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AccountTabs from '@/components/account/AccountTabs'
import { toCustomerOrder, type DealLite } from '@/lib/orders'

export const dynamic = 'force-dynamic'

const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
const egp = (n: number | null) => n === null ? null : `${n.toLocaleString('en-US')} EGP`

export default async function AccountOrdersPage() {
  const auth = await createServerSupabaseClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/auth/login')

  const db = createAdminSupabaseClient()
  // filtered by the session's user id on the server; the browser never queries deals
  const { data, error } = await db.from('deals')
    .select('id, status, product_request_id, created_at, deposit_paid_at, shipped_at, arrived_egypt_at, delivered_at, selling_price_egp, deposit_amount_egp, remaining_amount_egp, tracking_number, carrier, customer_message')
    .eq('user_id', user.id).order('created_at', { ascending: false })

  const notReady = !!error && (error.message.includes('user_id') || error.message.includes('tracking_number'))
  if (error && !notReady) throw new Error(error.message)

  const deals = (data ?? []) as DealLite[]
  const ids = deals.map(d => d.product_request_id).filter((v): v is number => typeof v === 'number')
  const titles = new Map<number, string>()
  if (ids.length) {
    const { data: reqs } = await db.from('product_requests').select('id, requested_product').in('id', ids)
    for (const r of reqs ?? []) titles.set(r.id as number, (r.requested_product as string) ?? '')
  }
  const orders = deals.map(d => toCustomerOrder(d, d.product_request_id ? titles.get(d.product_request_id) : null))

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">Account</p>
          <h1 className="text-4xl font-black text-white mt-2">My Orders</h1>
          <p className="text-zinc-400 mt-3 text-sm">Follow your orders from deposit to delivery.</p>
        </div>
        <AccountTabs />

        {orders.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <p className="text-5xl mb-4">🚚</p>
            <p className="text-zinc-300 text-lg font-semibold mb-2">{notReady ? 'Orders are not available yet' : 'No orders yet'}</p>
            <p className="text-zinc-500 mb-6">Once we confirm an order for you it will appear here with live status updates.</p>
            <Link href="/request-product" className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors">Request a Product</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-bold text-white">{o.title}</h2>
                  <span className="text-xs text-zinc-500">Placed {fmtDate(o.placedAt)}</span>
                </div>

                {o.cancelled ? (
                  <p className="mt-4 text-sm text-red-400">This order was cancelled. Message us if you have questions.</p>
                ) : (
                  <ol className="mt-5 space-y-3">
                    {o.timeline.map(s => (
                      <li key={s.key} className="flex items-start gap-3">
                        <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${s.state === 'done' ? 'bg-green-500 border-green-500' : s.state === 'current' ? 'border-red-500 bg-red-500/30 animate-pulse' : 'border-zinc-700'}`} />
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <span className={s.state === 'upcoming' ? 'text-zinc-600 text-sm' : 'text-white text-sm font-semibold'}>{s.label}</span>
                          {s.at && <span className="text-xs text-zinc-500">{fmtDate(s.at)}</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                {o.message && <p className="mt-5 rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">💬 {o.message}</p>}
                {o.trackingNumber && (
                  <p className="mt-4 text-sm text-zinc-300">Tracking: <span className="font-mono text-white">{o.trackingNumber}</span>{o.carrier ? ` (${o.carrier})` : ''}</p>
                )}
                {(o.sellingPriceEgp !== null || o.remainingEgp !== null) && !o.cancelled && (
                  <p className="mt-3 text-xs text-zinc-500">
                    {egp(o.sellingPriceEgp) && <>Total {egp(o.sellingPriceEgp)}</>}
                    {egp(o.paidEgp) && <> · Deposit paid {egp(o.paidEgp)}</>}
                    {egp(o.remainingEgp) && <> · Remaining {egp(o.remainingEgp)}</>}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
