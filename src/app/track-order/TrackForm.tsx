// src/app/track-order/TrackForm.tsx

'use client'

import { useActionState } from 'react'
import { trackOrder, type TrackResult } from './actions'
import Link from 'next/link'
import OrderUpdates from '@/components/orders/OrderUpdates'

const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export default function TrackForm({ initialCode }: { initialCode: string }) {
  const [res, action, pending] = useActionState<TrackResult | null, FormData>(trackOrder, null)
  const o = res?.order
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

      {o && (
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

          {o.message && <p className="mt-5 rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">💬 {o.message}</p>}
          {o.trackingNumber && <p className="mt-4 text-sm text-zinc-300">Tracking: <span className="font-mono text-white">{o.trackingNumber}</span>{o.carrier ? ` (${o.carrier})` : ''}</p>}
          {o.lastUpdateAt && <p className="mt-3 text-xs text-zinc-600">Last update: {fmt(o.lastUpdateAt)}</p>}
          {o.orderCode && <Link href={`/contact?order=${o.orderCode}`} className="mt-4 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-red-500 hover:text-white transition-colors">Ask about this order</Link>}
        </div>
      )}
    </div>
  )
}
