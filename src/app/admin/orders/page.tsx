// src/app/admin/orders/page.tsx
// ONE page for every order: website orders (receipt, confirm, cancel) and their progress (status, delivery date, customer account).
// Replaces the separate Online orders, Orders and Deals status screens. Costs and manual deals stay on the Deals page.

import Link from 'next/link'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { loadCustomers } from '@/lib/customers'
import { suggestAccounts, type AccountLite, type DealLite } from '@/lib/orders'
import { SITE_URL } from '@/lib/site'
import { loadEvents } from '@/lib/order-events'
import { egp } from '@/lib/checkout-core'
import { orderWhatsappLink } from '@/lib/checkout-messages'
import { releaseExpired } from '@/lib/checkout-service'
import { loadReceipts } from '@/lib/receipt-service'
import { FILTERS, buildBoard, countByFilter, parseFilter, visibleOrders, type BoardCheckout, type BoardDeal, type BoardOrder, type Stage } from '@/lib/order-board'
import { ApproveForm, CancelForm } from '../checkouts/CheckoutForms'
import ReceiptsPanel from '../checkouts/ReceiptsPanel'
import { updateWhatsappLink } from '@/lib/order-messages'
import { expectedDelivery } from '@/lib/orders'
import type { Deal } from '@/types/deals'
import { getOpenProductRequests } from '../deals/actions'
import { getDiscountCodes } from '../sales/actions'
import { deleteOrderEvent, editOrderEvent, setEventHidden } from './actions'
import { AssignForm, CopyLinkButton, ExpectedDeliveryForm, StatusForm, type AccountOption } from './OrderForms'
import { DeleteDealButton, EditDealButton, NewOrderButton } from './OrderEditors'

export const dynamic = 'force-dynamic'

const when = (iso: string | null) => iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
const BADGE: Record<Stage, string> = {
  receipt: 'bg-amber-900/50 text-amber-200', remaining: 'bg-amber-900/50 text-amber-200', waiting_payment: 'bg-zinc-800 text-zinc-300',
  active: 'bg-blue-900/40 text-blue-200', completed: 'bg-green-900/40 text-green-200', closed: 'bg-red-900/30 text-red-200',
}

type SP = { f?: string; q?: string }

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await assertAdmin()
  const db = createAdminSupabaseClient()
  await releaseExpired(db)
  const params = await searchParams
  const filter = parseFilter(params.f)
  const query = typeof params.q === 'string' ? params.q.slice(0, 80) : ''

  const [{ data: checkoutRows, error: checkoutError }, dealsResult] = await Promise.all([
    db.from('checkout_orders').select('id, code, status, customer_name, phone, created_at, total_egp, hold_expires_at').order('created_at', { ascending: false }).limit(200),
    db.from('deals').select('*').order('created_at', { ascending: false }).limit(500),
  ])
  if (dealsResult.error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-3">Orders</h1>
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-4 text-sm">
          Could not load orders: {dealsResult.error.message}. Run the migrations 20261021_01 and 20261025_01 in the Supabase SQL editor, then reload.
        </p>
      </div>
    )
  }

  const checkouts = (checkoutError ? [] : checkoutRows ?? []) as BoardCheckout[]
  const fullDeals = (dealsResult.data ?? []) as (BoardDeal & Deal)[]
  const deals = fullDeals as BoardDeal[]
  const [productRequests, discountCodes] = await Promise.all([getOpenProductRequests().catch(() => []), getDiscountCodes().catch(() => [])])
  const fullById = new Map(fullDeals.map((d) => [d.id, d]))
  const ids = checkouts.map((c) => c.id)
  const { data: itemRows } = ids.length
    ? await db.from('checkout_items').select('checkout_id, title, color_name, quantity, unit_price_egp, discount_egp, note').in('checkout_id', ids).order('id')
    : { data: [] }
  const receipts = await loadReceipts(db, ids)
  // Bank statement says the money arrived (needs migration 20261105; without it the badge simply does not show)
  const bankConfirmed = new Map<string, string>()
  if (ids.length) {
    const { data: pm } = await db.from('tx_matches').select('checkout_id, egp_tx_id').eq('kind', 'payment').eq('status', 'confirmed').in('checkout_id', ids)
    const txIds = ((pm ?? []) as { egp_tx_id: string }[]).map((m) => m.egp_tx_id)
    const { data: txRows } = txIds.length ? await db.from('bank_transactions').select('id, tx_date, amount').in('id', txIds) : { data: [] }
    const txById = new Map(((txRows ?? []) as { id: string; tx_date: string; amount: number }[]).map((t) => [t.id, t]))
    for (const m of (pm ?? []) as { checkout_id: string; egp_tx_id: string }[]) {
      const t = txById.get(m.egp_tx_id)
      if (t) bankConfirmed.set(m.checkout_id, `${egp(Number(t.amount))} on ${String(t.tx_date).slice(0, 10)}`)
    }
  }
  const waitingReceipts = new Set(receipts.filter((r) => r.status === 'submitted').map((r) => r.checkoutId))

  const all = buildBoard({ checkouts, deals, items: (itemRows ?? []) as never[], waitingReceipts })
  const counts = countByFilter(all)
  const list = visibleOrders(all, filter, query)
  const liveDeals = fullDeals.filter((d) => d.status !== 'cancelled')
  const revenue = liveDeals.filter((d) => d.status === 'completed').reduce((sum, d) => sum + (Number(d.selling_price_egp) || 0), 0)

  const customers = await loadCustomers().catch(() => [])
  const accounts: AccountLite[] = customers.map((c) => ({ user_id: c.id, email: c.email, name: c.name, phone: c.phone }))
  const options: AccountOption[] = accounts.map((a) => ({ user_id: a.user_id, label: [a.name, a.email].filter(Boolean).join(' · ') || a.user_id }))
  const labelOf = new Map(options.map((o) => [o.user_id, o.label]))
  const dealIds = list.flatMap((o) => o.deals.map((d) => d.id))
  const events = await loadEvents(db, dealIds, { includeHidden: true })
  const noteById = new Map(((itemRows ?? []) as { checkout_id: string; note: string | null }[]).filter((i) => i.note).map((i) => [i.checkout_id, i.note]))

  const trackUrl = (code: string | null) => `${SITE_URL}/track-order${code ? `?code=${code}` : ''}`

  const Card = ({ o }: { o: BoardOrder }) => {
    const live = o.deals.filter((d) => d.status !== 'cancelled')
    const ids = live.map((d) => d.id)
    const first = live[0] ?? o.deals[0]
    const openOnline = o.checkout && (o.checkout.status === 'pending' || o.checkout.status === 'expired')
    const approvedOnline = o.checkout?.status === 'approved'
    const wa = o.checkout ? orderWhatsappLink({ customer_name: o.checkout.customer_name, phone: o.checkout.phone, code: o.checkout.code }, o.items.map((i) => ({ title: i.title, color_name: i.color, quantity: i.quantity }))) : null
    const sug = first && !first.user_id ? suggestAccounts({ ...first, product_request_id: null } as unknown as DealLite, accounts) : []
    const paidAt = live.find((d) => d.deposit_paid_at)?.deposit_paid_at ?? null
    const depositNow = live.reduce((s, d) => s + (Number(d.deposit_amount_egp) || 0), 0)
    const history = o.deals.flatMap((d) => events.get(d.id) ?? []).sort((a, b) => b.created_at.localeCompare(a.created_at))
    const latest = history.find((e) => !e.hidden)
    const exp = first ? expectedDelivery({ ...first, product_request_id: null } as unknown as DealLite) : null
    const sendUpdate = latest ? updateWhatsappLink(o.phone || first?.phone, {
      customerName: o.customer, code: o.code, title: latest.title, comment: latest.comment,
      trackUrl: trackUrl(first?.checkout_code ?? first?.order_code ?? null), expected: exp ? (exp.to ? `${exp.from} to ${exp.to}` : exp.from) : null,
    }) : null

    return (
      <li className="p-5 space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-white font-semibold">{o.customer}</span>
          {o.code && <span className="font-mono text-sm text-zinc-300">{o.code}</span>}
          <span className="text-zinc-500 text-xs" dir="ltr">{o.phone || 'no phone'}</span>
          <span className={`text-xs rounded-full px-2 py-0.5 font-semibold ${BADGE[o.stage]}`}>{o.stageLabel}</span>
          <span className="text-xs text-zinc-500">{o.kind === 'online' ? 'website' : 'added by you'} · {when(o.createdAt)}</span>
          {first?.user_id && <span className="text-xs text-green-400">→ {labelOf.get(first.user_id) ?? 'account'}</span>}
        </div>

        <div className="text-sm text-zinc-300 space-y-1">
          {o.items.map((i, idx) => <p key={idx}>• {i.title}{i.color ? ` (${i.color})` : ''} × {i.quantity}{o.kind === 'online' ? ` — ${egp(i.net)}` : ''}</p>)}
          {noteById.get(o.checkout?.id ?? '') && <p className="text-xs text-amber-300">Customer note: {noteById.get(o.checkout?.id ?? '')}</p>}
          {live.some((d) => fullById.get(d.id)?.client_listing === true) && (
            <p className="text-xs font-semibold text-sky-300">👤 Client item: not counted in the finance reports or the profit</p>
          )}
          <p className="text-xs text-zinc-400">
            Total <b className="text-white">{egp(o.total)}</b>
            {live.length > 0 && (paidAt ? <> · deposit marked paid {when(paidAt)}{depositNow ? ` (${egp(depositNow)})` : ''}</> : <> · deposit not marked paid</>)}
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {live.map((d) => fullById.get(d.id)).filter((d): d is BoardDeal & Deal => !!d).map((d) => (
              <EditDealButton key={d.id} deal={d} label={live.length > 1 ? `Edit costs: ${d.item_title ?? 'item'}` : 'Edit costs and details'} productRequests={productRequests} discountCodes={discountCodes} />
            ))}
            {o.kind === 'manual' && first && <DeleteDealButton id={first.id} />}
          </p>
        </div>

        {o.checkout && bankConfirmed.has(o.checkout.id) && (
          <p className="text-xs text-emerald-300">✔ Bank statement confirms this payment: {bankConfirmed.get(o.checkout.id)}</p>
        )}

        {o.kind === 'online' && o.checkout && o.checkout.status !== 'rejected' && <ReceiptsPanel receipts={receipts.filter((r) => r.checkoutId === o.checkout!.id)} total={o.total} />}

        {openOnline && (
          <div className="space-y-2">
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">💬 Message the customer on WhatsApp</a>}
            <ApproveForm id={o.checkout!.id} />
            <p className="text-xs text-zinc-500">Use this when the customer pays you through chat. If they uploaded a receipt, press &quot;Money received, verify&quot; above instead: it also confirms the order.</p>
          </div>
        )}

        {ids.length > 0 && (
          <div className="space-y-3 border-t border-zinc-800 pt-3">
            <StatusForm dealIds={ids} status={live[0].status} allowCancel={o.kind === 'manual'} />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <ExpectedDeliveryForm dealIds={ids} expected={live[0].expected_delivery_date?.slice(0, 10) ?? ''} />
              <CopyLinkButton trackUrl={trackUrl(first?.checkout_code ?? first?.order_code ?? null)} />
              <a href={trackUrl(first?.checkout_code ?? first?.order_code ?? null)} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-white underline">Open what the customer sees</a>
              {sendUpdate && <a href={sendUpdate} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-700 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-lg">💬 Send the latest update on WhatsApp</a>}
            </div>
            {sug.length > 0 && <p className="text-xs text-blue-300">Suggested account: {sug.map((s) => `${s.account.name || s.account.email} (same ${s.reason})`).join(', ')}</p>}
            <AssignForm dealIds={ids} current={first?.user_id ?? null} accounts={options} suggestedId={sug[0]?.account.user_id} />
            {live.length > 1 && (
              <details className="text-xs text-zinc-400">
                <summary className="cursor-pointer hover:text-white">Update one item separately ({live.length} items)</summary>
                <ul className="mt-2 space-y-3">
                  {live.map((d) => (
                    <li key={d.id} className="space-y-1"><span className="text-zinc-200">{d.item_title ?? 'Item'}</span><StatusForm dealIds={[d.id]} status={d.status} allowCancel={false} /></li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {history.length > 0 && (
          <details className="text-xs text-zinc-400">
            <summary className="cursor-pointer hover:text-white">History ({history.length} updates the customer sees)</summary>
            <ul className="mt-2 space-y-1.5">
              {history.map((e) => (
                <li key={e.id} className={`space-y-1 ${e.hidden ? 'opacity-60' : ''}`}>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-zinc-500">{when(e.created_at)}</span>
                    <span className="text-zinc-200 font-semibold">{e.title}</span>
                    {e.comment && <span className="text-zinc-400">: {e.comment}</span>}
                    {e.hidden && <span className="text-amber-300">hidden from the customer</span>}
                    <form action={setEventHidden} className="inline">
                      <input type="hidden" name="event_id" value={e.id} />
                      <button name="hide" value={e.hidden ? '0' : '1'} className="text-zinc-300 hover:text-white underline ml-2">{e.hidden ? 'show' : 'hide'}</button>
                    </form>
                    <form action={deleteOrderEvent} className="inline">
                      <input type="hidden" name="event_id" value={e.id} />
                      <button className="text-red-400 hover:text-red-300 underline ml-2">remove</button>
                    </form>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-zinc-500 hover:text-white">edit the words</summary>
                    <form action={editOrderEvent} className="mt-1 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="event_id" value={e.id} />
                      <input name="title" defaultValue={e.title} maxLength={120} required className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white w-56" />
                      <input name="comment" defaultValue={e.comment ?? ''} maxLength={500} placeholder="Comment" className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white w-72" />
                      <button className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold px-3 py-1 rounded-lg">Save</button>
                    </form>
                  </details>
                </li>
              ))}
            </ul>
          </details>
        )}

        {o.checkout && o.checkout.status === 'pending' && <p className="text-xs text-zinc-500">Items held until {when(o.checkout.hold_expires_at)}.</p>}
        {(openOnline || approvedOnline) && <CancelForm id={o.checkout!.id} approved={approvedOnline === true} />}
      </li>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">🚚 Orders</h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Everything about an order in one place: create it, the customer&apos;s receipt, confirming, every status the customer sees, the delivery date, your costs and cancelling.
            Changing the status moves all items of the order together.
          </p>
          <p className="text-xs text-zinc-500 mt-2">{counts.active} active · {counts.completed} completed · revenue of completed orders {egp(revenue)}</p>
        </div>
        <NewOrderButton productRequests={productRequests} discountCodes={discountCodes} />
      </header>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Order filter">
        {FILTERS.map((f) => (
          <Link key={f.value} href={`/admin/orders?f=${f.value}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm ${f.value === filter ? 'bg-purple-600 text-white font-semibold' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
            {f.label} <span className={f.value === 'needs_me' && counts.needs_me > 0 ? 'text-amber-300 font-bold' : 'text-zinc-400'}>({counts[f.value]})</span>
          </Link>
        ))}
        <form method="get" className="ml-auto flex gap-2">
          <input type="hidden" name="f" value={filter} />
          <input name="q" defaultValue={query} placeholder="Name, phone, order ID or item" autoComplete="off" className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white w-64" />
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-sm">Search</button>
        </form>
      </nav>

      <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
        {list.length === 0 ? <li className="p-5 text-sm text-zinc-500">Nothing here{query ? ' for this search' : ''}.</li> : list.map((o) => <Card key={o.key} o={o} />)}
      </ul>
    </div>
  )
}
