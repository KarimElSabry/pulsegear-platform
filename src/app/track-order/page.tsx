// src/app/track-order/page.tsx
// Public order tracking, like a parcel tracker: order ID + last 4 digits of the phone.

import type { Metadata } from 'next'
import Link from 'next/link'
import TrackForm from './TrackForm'
import { normalizeOrderCode } from '@/lib/orders'

export const metadata: Metadata = { title: 'Track your order | Pulse Gear Egypt', robots: { index: false } }

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams
  const orderCode = normalizeOrderCode(code)
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="max-w-xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-red-500 font-bold text-center">Orders</p>
        <h1 className="text-4xl font-black text-white text-center mt-2">Track your order</h1>
        <p className="text-zinc-400 text-center mt-3 mb-8">Enter the order ID we sent you and the last 4 digits of your phone number.</p>
        <TrackForm initialCode={orderCode ?? ''} />
        <p className="text-sm text-zinc-500 text-center mt-8">
          Have an account? <Link href="/account/orders" className="text-red-400 hover:text-red-300">See all your orders</Link>.
          {' '}Something unclear? <Link href={orderCode ? `/contact?order=${orderCode}` : '/contact'} className="text-red-400 hover:text-red-300">Send us a message</Link>.
        </p>
      </div>
    </main>
  )
}
