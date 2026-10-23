// src/app/account/orders/page.tsx
// A signed-in customer sees only the orders assigned to their own account, and only customer-safe fields.

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AccountTabs from '@/components/account/AccountTabs'
import OrderUpdates from '@/components/orders/OrderUpdates'
import { CHECKOUT_STATUS_LABEL, type CheckoutStatus } from '@/lib/checkout-core'
import { loadEvents } from '@/lib/order-events'
import { toCustomerOrder, type DealLite } from '@/lib/orders'

export const dynamic = 'force-dynamic'

const fmtShort = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
const egp = (n: number | null) => n === null ? null : `${n.toLocaleString('en-US')} EGP`

export default async function AccountOrdersPage() {
  const auth = await createServerSupabaseClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/auth/login')

  const db = createAdminSupabaseClient()
  // filtered by the session's user id on the server; the browser never queries deals
  const BASE = 'id, status, product_request_id, created_at, deposit_paid_at, shipped_at, arrived_egypt_at, delivered_at, selling_price_egp, deposit_amount_egp, remaining_amount_egp'
  let data: unknown[] | null = null
  let error: { message: string } | null = null
  ;({ data, error } = await db.from('deals').select(`${BASE}, order_code, expected_delivery_date, item_title`).eq('user_id', user.id).order('created_at', { ascending: false }))
  if (error && (error.message.includes('order_code') || error.message.includes('expected_delivery') || error.message.includes('item_title'))) {
    // migration 20261021_01 not applied yet: show the orders without the ID and the date
    ;({ data, error } = await db.from('deals').select(BASE).eq('user_id', user.id).order('created_at', { ascending: false }))
  }

  const notReady = !!error && (error.message.includes('user_id'))
  if (error && !notReady) throw new Error(error.message)

  const deals = (data ?? []) as DealLite[]
  const ids = deals.map(d => d.product_request_id).filter((v): v is number => typeof v === 'number')
  const titles = new Map<number, string>()
  if (ids.length) {
    const { data: reqs } = await db.from('product_requests').select('id, requested_product').in('id', ids)
    for (const r of reqs ?? []) titles.set(r.id as number, (r.requested_product as string) ?? '')
  }
  const events = await loadEvents(db, deals.map(d => d.id))

  // orders placed from the cart that are not confirmed yet (waiting for the receipt, being checked, or closed). Best effort:
  // before migration 20261025_01 there is no such table and nothing is shown.
  const { data: pendingRows } = await db.from('checkout_orders')
    .select('id, code, view_token, status, total_egp, created_at, review_note')
    .eq('user_id', user.id).neq('status', 'approved').order('created_at', { ascending: false }).limit(10)
  const pending = (pendingRows ?? []) as { id: string; code: string; view_token: string; status: CheckoutStatus; total_egp: number; created_at: string; review_note: string | null }[]
  const { data: pendingItems } = pending.length
    ? await db.from('checkout_items').select('checkout_id, title, color_name, quantity').in('checkout_id', pending.map(p => p.id))
    : { data: [] }
  const orders = deals.map(d => toCustomerOrder(d, d.product_request_id ? titles.get(d.product_request_id) : null, new Date(), events.get(d.id) ?? []))

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">Account</p>
          <h1 className="text-4xl font-black text-white mt-2">My Orders</h1>
          <p className="text-zinc-400 mt-3 text-sm">Follow your orders from deposit to delivery.</p>
        </div>
        <AccountTabs />

        {pending.length > 0 && (
          <div className="mb-6 space-y-3">
            <h2 className="text-lg font-bold text-white">Orders waiting for our confirmation</h2>
            {pending.map(p => (
              <div key={p.id} className="bg-zinc-900 border border-amber-900/60 rounded-2xl p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-sm text-zinc-300">{p.code}</span>
                  <span className="text-xs text-zinc-500">Placed {fmtDate(p.created_at)}</span>
                </div>
                <p className="mt-1 text-lg font-bold text-white">{CHECKOUT_STATUS_LABEL[p.status]}</p>
                <ul className="mt-2 space-y-0.5 text-sm text-zinc-300">
                  {((pendingItems ?? []) as { checkout_id: string; title: string; color_name: string | null; quantity: number }[]).filter(i => i.checkout_id === p.id).map((i, idx) => (
                    <li key={idx}>• {i.title}{i.color_name ? ` (${i.color_name})` : ''} × {i.quantity}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-zinc-500">Total {Math.round(p.total_egp).toLocaleString('en-US')} EGP</p>
                {p.review_note && (p.status === 'rejected' || p.status === 'cancelled') && <p className="mt-2 text-sm text-red-300">{p.review_note}</p>}
                <Link href={`/checkout/${p.code}?t=${p.view_token}`} className="mt-3 inline-block rounded-full border border-zinc-600 px-5 py-2 text-sm font-bold text-white hover:bg-zinc-800">View order</Link>
              </div>
            ))}
          </div>
        )}

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
                  <span className="text-xs text-zinc-500">{o.orderCode ? <span className="font-mono text-zinc-400">{o.orderCode}</span> : null}{o.orderCode ? ' · ' : ''}Placed {fmtDate(o.placedAt)}</span>
                </div>
                {!o.cancelled && <p className="mt-2 text-lg font-bold text-white">{o.headline}</p>}
                {o.expected && (
                  <p className="mt-2 inline-block rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-200">
                    📅 {o.expected.estimate ? 'Estimated delivery' : 'Expected delivery'}: <b className="text-white">{fmtShort(o.expected.from)}{o.expected.to ? ` – ${fmtShort(o.expected.to)}` : ''}</b>
                  </p>
                )}

                <OrderUpdates timeline={o.timeline} events={o.events} cancelled={o.cancelled} />

                {o.orderCode && <Link href={`/contact?order=${o.orderCode}`} className="mt-4 mr-4 inline-block text-sm font-semibold text-red-400 hover:text-red-300">Ask about this order</Link>}
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
