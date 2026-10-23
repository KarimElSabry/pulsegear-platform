// src/app/cart/CartClient.tsx

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { useQuote } from '@/components/cart/useQuote'
import OrderSummary from '@/components/cart/OrderSummary'
import { isOptimizable } from '@/lib/image-hosts'
import { DISCOUNT_KEY, NOTE_MAX, lineKey } from '@/lib/cart'
import { egp } from '@/lib/checkout-core'
import { problemText } from '@/lib/quote'

export default function CartClient() {
  const cart = useCart()
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState('')
  const { quote, loading, error } = useQuote(cart.lines, cart.ready, applied)

  // a code applied on a product page is picked up here
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DISCOUNT_KEY)
      if (saved) { setCode(saved); setApplied(saved) }
    } catch { /* ignore */ }
  }, [])

  const applyCode = () => {
    const c = code.trim().toUpperCase()
    setApplied(c)
    try { c ? localStorage.setItem(DISCOUNT_KEY, c) : localStorage.removeItem(DISCOUNT_KEY) } catch { /* ignore */ }
  }

  if (!cart.ready) return <p className="mt-8 text-zinc-400">Loading your cart…</p>

  if (cart.lines.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-lg font-bold text-white">Your cart is empty</p>
        <p className="mt-1 text-zinc-400">Find something you like and add it to your cart.</p>
        <Link href="/products" className="mt-5 inline-block rounded-full bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500">Browse products</Link>
      </div>
    )
  }

  const lines = quote?.lines ?? []
  const bad = lines.filter((l) => l.problem !== 'ok')

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-900/20 px-4 py-3 text-red-300">{error}</p>}
        {(quote ? lines : cart.lines.map((l) => ({ ...l, slug: null, title: 'Loading…', colorName: null, imageUrl: null, unitPriceEgp: 0, maxQuantity: 10, discountEnabled: true, oneOff: false, unitsLeft: null, problem: 'ok' as const }))).map((l) => {
          const key = lineKey(l)
          const ok = l.problem === 'ok'
          return (
            <div key={key} className={`flex gap-4 rounded-2xl border bg-zinc-900 p-4 ${ok ? 'border-zinc-800' : 'border-amber-800'}`}>
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                {l.imageUrl && <Image src={l.imageUrl} alt={l.title} fill sizes="96px" unoptimized={!isOptimizable(l.imageUrl)} className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {l.slug ? <Link href={`/products/${l.slug}`} className="font-bold text-white hover:text-red-400">{l.title}</Link> : <p className="font-bold text-white">{l.title}</p>}
                    {l.colorName && <p className="text-sm text-zinc-400">Color: {l.colorName}</p>}
                  </div>
                  <button onClick={() => cart.remove(key)} className="text-sm text-zinc-500 underline hover:text-red-400">Remove</button>
                </div>
                {!ok && <p className="mt-1 text-sm text-amber-300">{problemText(l as never)}. Please remove it to continue.</p>}
                {ok && (
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    {l.oneOff ? (
                      <span className="text-sm text-zinc-400">One of a kind</span>
                    ) : (
                      <select value={l.quantity} onChange={(e) => cart.setQty(key, Number(e.target.value), l.maxQuantity)} aria-label="Quantity" className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-white">
                        {Array.from({ length: Math.max(1, l.maxQuantity) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    )}
                    <span className="font-black text-white">{egp(l.unitPriceEgp * l.quantity)}</span>
                    {l.unitsLeft !== null && l.unitsLeft <= 3 && <span className="text-xs font-semibold text-amber-400">Only {l.unitsLeft} left</span>}
                  </div>
                )}
                <textarea
                  value={l.note}
                  onChange={(e) => cart.setLineNote(key, e.target.value.slice(0, NOTE_MAX))}
                  rows={1}
                  placeholder="Note for this item (optional)"
                  className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          )
        })}
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:sticky lg:top-24">
        <div>
          <label className="text-sm font-semibold text-zinc-300" htmlFor="discount">Discount code</label>
          <div className="mt-1 flex gap-2">
            <input id="discount" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && applyCode()} placeholder="Optional" autoComplete="off" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none" />
            <button onClick={applyCode} className="rounded-xl bg-zinc-700 px-4 py-2 font-bold text-white hover:bg-zinc-600">Apply</button>
          </div>
          {quote?.discountError && <p className="mt-1 text-sm text-red-400">{quote.discountError}</p>}
          {quote && quote.discountPercent > 0 && <p className="mt-1 text-sm text-green-400">{quote.discountPercent}% off products that allow codes</p>}
        </div>

        {quote ? <OrderSummary quote={quote} /> : <p className="text-sm text-zinc-400">{loading ? 'Calculating…' : ' '}</p>}

        {quote?.buyable ? (
          <Link href="/checkout" className="block rounded-xl bg-red-600 py-3 text-center font-bold text-white hover:bg-red-500">Checkout</Link>
        ) : (
          <button disabled className="w-full cursor-not-allowed rounded-xl bg-zinc-700 py-3 font-bold text-zinc-400">
            {bad.length > 0 ? 'Remove unavailable items to continue' : 'Checkout'}
          </button>
        )}
        <p className="text-xs text-zinc-500">Nothing is paid on the website. After you confirm, we hold your items for 24 hours and contact you on WhatsApp.</p>
      </aside>
    </div>
  )
}
