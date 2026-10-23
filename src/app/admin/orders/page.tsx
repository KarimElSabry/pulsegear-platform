// src/app/admin/orders/page.tsx
// Assign deals (orders) to registered accounts and post status updates. The customer sees them under /account/orders.

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { loadCustomers } from '@/lib/customers'
import { suggestAccounts, type AccountLite, type DealLite } from '@/lib/orders'
import { SITE_URL } from '@/lib/site'
import { loadEvents } from '@/lib/order-events'
import { deleteOrderEvent } from './actions'
import { AssignForm, CopyLinkButton, ExpectedDeliveryForm, StatusForm, type AccountOption } from './OrderForms'

export const dynamic = 'force-dynamic'

export default async function OrdersAdminPage() {
  await assertAdmin()
  const db = createAdminSupabaseClient()

  const BASE = 'id, status, customer_name, phone, user_id, product_request_id, created_at, deposit_paid_at, shipped_at, arrived_egypt_at, delivered_at'
  let data: unknown[] | null = null
  let error: { message: string } | null = null
  ;({ data, error } = await db.from('deals').select(`${BASE}, order_code, expected_delivery_date, item_title`).neq('status', 'cancelled').order('created_at', { ascending: false }).limit(300))
  let withCodes = true
  if (error && (error.message.includes('order_code') || error.message.includes('expected_delivery') || error.message.includes('item_title'))) {
    // migration 20261021_01 not applied yet: the page still works, without IDs and dates
    withCodes = false
    ;({ data, error } = await db.from('deals').select(BASE).neq('status', 'cancelled').order('created_at', { ascending: false }).limit(300))
  }

  if (error) {
    const needsMigration = error.message.includes('user_id')
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-3">Customer orders</h1>
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-4 text-sm">
          {needsMigration ? 'Run supabase/migrations/20261020_01_deals_account_link.sql in the Supabase SQL editor, then reload this page.' : `Could not load orders: ${error.message}`}
        </p>
      </div>
    )
  }

  const deals = (data ?? []) as DealLite[]
  const customers = await loadCustomers().catch(() => [])
  const accounts: AccountLite[] = customers.map(c => ({ user_id: c.id, email: c.email, name: c.name, phone: c.phone }))
  const options: AccountOption[] = accounts.map(a => ({ user_id: a.user_id, label: [a.name, a.email].filter(Boolean).join(' · ') || a.user_id }))
  const labelOf = new Map(options.map(o => [o.user_id, o.label]))

  const eventsByDeal = await loadEvents(db, deals.map((d) => d.id))

  const unassigned = deals.filter(d => !d.user_id)
  const assigned = deals.filter(d => d.user_id)

  const trackUrl = (d: DealLite) => `${SITE_URL}/track-order${d.order_code ? `?code=${d.order_code}` : ''}`

  const Row = ({ d }: { d: DealLite }) => {
    const sug = d.user_id ? [] : suggestAccounts(d, accounts)
    return (
      <li className="px-4 py-4 space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-white font-semibold">{d.customer_name || 'No name'}</span>
          {d.item_title && <span className="text-xs text-zinc-300">{d.item_title}</span>}
          {d.order_code && <span className="text-xs font-mono text-zinc-300">{d.order_code}</span>}
          <span className="text-zinc-500 text-xs">{d.phone || 'no phone'}</span>
          <span className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-2 py-0.5">{d.status}</span>
          {d.user_id && <span className="text-xs text-green-400">→ {labelOf.get(d.user_id) ?? d.user_id}</span>}
        </div>
        {sug.length > 0 && <p className="text-xs text-blue-300">Suggested: {sug.map(s => `${s.account.name || s.account.email} (same ${s.reason})`).join(', ')}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusForm dealId={d.id} status={d.status} />
          <CopyLinkButton trackUrl={trackUrl(d)} />
        </div>
        {(eventsByDeal.get(d.id) ?? []).length > 0 && (
          <details className="text-xs text-zinc-400">
            <summary className="cursor-pointer hover:text-white">History ({(eventsByDeal.get(d.id) ?? []).length} updates the customer sees)</summary>
            <ul className="mt-2 space-y-1.5">
              {(eventsByDeal.get(d.id) ?? []).map((e) => (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-zinc-500">{new Date(e.created_at).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-zinc-200 font-semibold">{e.title}</span>
                  {e.comment && <span className="text-zinc-400">: {e.comment}</span>}
                  <form action={deleteOrderEvent} className="inline">
                    <input type="hidden" name="event_id" value={e.id} />
                    <button className="text-red-400 hover:text-red-300 underline ml-2">remove</button>
                  </form>
                </li>
              ))}
            </ul>
          </details>
        )}
        <AssignForm dealId={d.id} current={d.user_id ?? null} accounts={options} suggestedId={sug[0]?.account.user_id} />
        <ExpectedDeliveryForm dealId={d.id} expected={d.expected_delivery_date?.slice(0, 10) ?? ''} />
      </li>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer orders</h1>
        {!withCodes && <p className="mt-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-3 text-sm">Run supabase/migrations/20261021_01_order_codes.sql to give every order an ID and an expected delivery date.</p>}
        <p className="text-zinc-400 text-sm mt-1">Assign an order to the customer&apos;s account and they can follow its status under <b>My Orders</b>. Orders created from a request made while logged in are linked automatically.</p>
      </div>
      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Not assigned yet ({unassigned.length})</h2>
        <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
          {unassigned.length === 0 ? <li className="p-4 text-sm text-zinc-500">Every order is assigned.</li> : unassigned.map(d => <Row key={d.id} d={d} />)}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Assigned ({assigned.length})</h2>
        <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
          {assigned.length === 0 ? <li className="p-4 text-sm text-zinc-500">None yet.</li> : assigned.map(d => <Row key={d.id} d={d} />)}
        </ul>
      </section>
    </div>
  )
}
