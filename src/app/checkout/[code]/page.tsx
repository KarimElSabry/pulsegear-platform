// src/app/checkout/[code]/page.tsx
// Confirmation after "Confirm order". Opened with the order's secret token in the address (?t=...), which the browser also
// keeps, so only the customer who placed the order can see it.

import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { findByCodeAndToken, releaseExpired } from '@/lib/checkout-service'
import { CHECKOUT_STATUS_LABEL, egp } from '@/lib/checkout-core'
import { normalizeOrderCode } from '@/lib/orders'
import TokenFinder from '@/components/cart/TokenFinder'

export const metadata: Metadata = { title: 'Your order | Pulse Gear Egypt', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CheckoutOrderPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ t?: string }> }) {
  const { code: rawCode } = await params
  const { t } = await searchParams
  const code = normalizeOrderCode(rawCode)
  if (!code) return <Shell><Missing /></Shell>
  if (!t) return <Shell><TokenFinder code={code} /></Shell>

  const db = createAdminSupabaseClient()
  await releaseExpired(db)
  const order = await findByCodeAndToken(db, code, t)
  if (!order) return <Shell><Missing /></Shell>

  const { data: items } = await db.from('checkout_items')
    .select('title, color_name, quantity, unit_price_egp, discount_egp, note').eq('checkout_id', order.id).order('id')

  return (
    <Shell>
      <p className="font-mono text-sm text-zinc-500">{order.code}</p>
      <h1 className="mt-1 text-3xl font-black text-white">{CHECKOUT_STATUS_LABEL[order.status]}</h1>

      {order.status === 'pending' && (
        <Box tone="green">
          <b>Thank you, {order.customer_name.split(' ')[0]}! We received your order.</b> We are holding your items for you and will message you on WhatsApp on{' '}
          <b dir="ltr">{order.phone}</b> to arrange payment and delivery. Nothing has been charged. Please keep your WhatsApp open.
        </Box>
      )}
      {order.status === 'approved' && (
        <Box tone="green">
          <b>Your order is confirmed.</b> Follow every step on{' '}
          <Link href={`/track-order?code=${order.code}`} className="font-bold underline">Track Order</Link> with this order ID and the last 4 digits of your phone.
        </Box>
      )}
      {(order.status === 'rejected' || order.status === 'cancelled') && (
        <Box tone="red">
          {order.status === 'rejected' ? 'We could not confirm this order' : 'This order was cancelled'}{order.review_note ? `: ${order.review_note}` : '.'}{' '}
          The items were released. <Link href={`/contact?order=${order.code}`} className="font-bold underline">Contact us</Link> if you think this is a mistake.
        </Box>
      )}
      {order.status === 'expired' && (
        <Box tone="amber">
          The 24-hour hold ended and the items were released. If you still want them, <Link href={`/contact?order=${order.code}`} className="font-bold underline">send us a message</Link>
          {' '}or place a new order.
        </Box>
      )}

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-black text-white">Your items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(items ?? []).map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3 text-zinc-300">
              <span>{String(i.title)}{i.color_name ? ` (${String(i.color_name)})` : ''} × {i.quantity}{i.note ? <span className="block text-xs text-zinc-500">Note: {String(i.note)}</span> : null}</span>
              <span className="shrink-0 text-white">{egp(Number(i.unit_price_egp) * Number(i.quantity) - Number(i.discount_egp || 0))}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-zinc-800 pt-3 text-sm font-bold text-white"><span>Total</span><span>{egp(order.total_egp)}</span></p>
        <p className="mt-2 text-sm text-zinc-400">Delivering to: {order.address}</p>
      </section>

      <p className="mt-6 text-sm text-zinc-500">
        Questions? <Link href={`/contact?order=${order.code}`} className="text-red-400 hover:text-red-300">Send us a message</Link>. Save this page or your order ID.
      </p>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="container-x max-w-2xl py-10 md:py-14">{children}</div>
}

function Missing() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
      <p className="text-lg font-bold text-white">We could not find this order</p>
      <p className="mt-1 text-zinc-400">Open the link we showed you after you confirmed, or track it with your order ID.</p>
      <Link href="/track-order" className="mt-4 inline-block rounded-full bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500">Track an order</Link>
    </div>
  )
}

function Box({ tone, children }: { tone: 'green' | 'amber' | 'red'; children: React.ReactNode }) {
  const c = tone === 'green' ? 'border-green-800 bg-green-900/20 text-green-200' : tone === 'amber' ? 'border-amber-800 bg-amber-900/20 text-amber-200' : 'border-red-800 bg-red-900/20 text-red-200'
  return <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${c}`}>{children}</p>
}
