// src/app/admin/orders/page.tsx
// Assign deals (orders) to registered accounts and add tracking. The customer sees them under /account/orders.

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { loadCustomers } from '@/lib/customers'
import { suggestAccounts, type AccountLite, type DealLite } from '@/lib/orders'
import { AssignForm, TrackingForm, type AccountOption } from './OrderForms'

export const dynamic = 'force-dynamic'

export default async function OrdersAdminPage() {
  await assertAdmin()
  const db = createAdminSupabaseClient()

  const { data, error } = await db.from('deals')
    .select('id, status, customer_name, phone, user_id, product_request_id, created_at, tracking_number, carrier, customer_message')
    .neq('status', 'cancelled').order('created_at', { ascending: false }).limit(300)

  if (error) {
    const needsMigration = error.message.includes('user_id') || error.message.includes('tracking_number')
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-3">Customer orders</h1>
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-4 text-sm">
          {needsMigration ? 'Run supabase/migrations/20261020_01_deals_account_link.sql in the Supabase SQL editor, then reload this page.' : `Could not load orders: ${error.message}`}
        </p>
      </div>
    )
  }

  const deals = (data ?? []) as (DealLite & { customer_message?: string | null })[]
  const customers = await loadCustomers().catch(() => [])
  const accounts: AccountLite[] = customers.map(c => ({ user_id: c.id, email: c.email, name: c.name, phone: c.phone }))
  const options: AccountOption[] = accounts.map(a => ({ user_id: a.user_id, label: [a.name, a.email].filter(Boolean).join(' · ') || a.user_id }))
  const labelOf = new Map(options.map(o => [o.user_id, o.label]))

  const unassigned = deals.filter(d => !d.user_id)
  const assigned = deals.filter(d => d.user_id)

  const Row = ({ d }: { d: DealLite & { customer_message?: string | null } }) => {
    const sug = d.user_id ? [] : suggestAccounts(d, accounts)
    return (
      <li className="px-4 py-4 space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-white font-semibold">{d.customer_name || 'No name'}</span>
          <span className="text-zinc-500 text-xs">{d.phone || 'no phone'}</span>
          <span className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-2 py-0.5">{d.status}</span>
          {d.user_id && <span className="text-xs text-green-400">→ {labelOf.get(d.user_id) ?? d.user_id}</span>}
        </div>
        {sug.length > 0 && <p className="text-xs text-blue-300">Suggested: {sug.map(s => `${s.account.name || s.account.email} (same ${s.reason})`).join(', ')}</p>}
        <AssignForm dealId={d.id} current={d.user_id ?? null} accounts={options} suggestedId={sug[0]?.account.user_id} />
        <TrackingForm dealId={d.id} tracking={d.tracking_number ?? ''} carrier={d.carrier ?? ''} message={d.customer_message ?? ''} />
      </li>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer orders</h1>
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
