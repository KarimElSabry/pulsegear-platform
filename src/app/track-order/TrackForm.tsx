// src/app/track-order/TrackForm.tsx

'use client'

import { useActionState } from 'react'
import { trackOrder, type TrackResult } from './actions'
import Link from 'next/link'
import OrderUpdates from '@/components/orders/OrderUpdates'
import type { PublicOrder } from '@/lib/orders'
import type { PublicCheckout } from '@/lib/checkout-service'
import { CHECKOUT_STATUS_LABEL, egp } from '@/lib/checkout-core'

const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export default function TrackForm({ initialCode }: { initialCode: string }) {
  const [res, action, pending] = useActionState<TrackResult | null, FormData>(trackOrder, null)
  const input = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500'

  return (
    <div className="space-y-6">
      <form action={action} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-zinc-300">Order ID</span>
          <input name="order_code" defaultValue={initialCode} required placeholder="PG-3FA9C21B" autoComplete="off" className={`${input} uppercase font-mono`} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-zinc-300">Last 4 digits of your phone number</span>
          <input name="phone_last4" required inputMode="numeric" maxLength={4} placeholder="1234" autoComplete="off" className={input} />
        </label>
        <button disabled={pending} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-full transition-colors">
          {pending ? 'Checking…' : 'Track my order'}
        </button>
        {res && !res.ok && <p role="alert" className="text-sm text-red-400">{res.message}</p>}
      </form>

      {res?.ok && (res.order ? [res.order] : res.orders ?? []).map((o, i) => <OrderCard key={`${o.orderCode}-${i}`} o={o} />)}
      {res?.ok && res.checkout && <PendingCard c={res.checkout} />}
    </div>
  )
}

function OrderCard({ o }: { o: PublicOrder }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <p className="text-xs text-zinc-500 font-mono">{o.orderCode}</p>
      <h2 className="text-2xl font-black text-white mt-1">{o.headline}</h2>
      <p className="text-zinc-400 text-sm mt-1">{o.title}</p>

      {o.expected && (
        <p className="mt-4 rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">
          📅 {o.expected.estimate ? 'Estimated delivery' : 'Expected delivery'}:{' '}
          <b className="text-white">{fmt(o.expected.from)}{o.expected.to ? ` – ${fmt(o.expected.to)}` : ''}</b>
        </p>
      )}

      <OrderUpdates timeline={o.timeline} events={o.events} cancelled={o.cancelled} />

      {o.lastUpdateAt && <p className="mt-3 text-xs text-zinc-600">Last update: {fmt(o.lastUpdateAt)}</p>}
      {o.orderCode && <Link href={`/contact?order=${o.orderCode}`} className="mt-4 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-red-500 hover:text-white transition-colors">Ask about this order</Link>}
    </div>
  )
}

/** A cart order that is not confirmed yet (waiting for the receipt, being checked, or closed). */
function PendingCard({ c }: { c: PublicCheckout }) {
  const text: Record<string, string> = {
    pending: 'We received your order and will message you on WhatsApp to arrange payment and delivery. Your items are held for you meanwhile.',
    rejected: 'We could not confirm this order.',
    expired: 'The 24-hour hold ended. If you still want the items, please contact us.',
    cancelled: 'This order was cancelled.',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <p className="text-xs text-zinc-500 font-mono">{c.code}</p>
      <h2 className="text-2xl font-black text-white mt-1">{CHECKOUT_STATUS_LABEL[c.status]}</h2>
      <p className="mt-2 text-sm text-zinc-300">{text[c.status] ?? ''}{c.note ? ` ${c.note}` : ''}</p>
      <ul className="mt-4 space-y-1 text-sm text-zinc-300">
        {c.items.map((i, idx) => <li key={idx}>• {i.title}{i.colorName ? ` (${i.colorName})` : ''} × {i.quantity}</li>)}
      </ul>
      <p className="mt-3 text-xs text-zinc-500">Total {egp(c.totalEgp)}</p>
      <Link href={`/contact?order=${c.code}`} className="mt-4 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-red-500 hover:text-white transition-colors">Ask about this order</Link>
    </div>
  )
}
