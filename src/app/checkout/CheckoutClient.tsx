// src/app/checkout/CheckoutClient.tsx

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { useQuote } from '@/components/cart/useQuote'
import OrderSummary from '@/components/cart/OrderSummary'
import { DISCOUNT_KEY } from '@/lib/cart'
import { normalizeDigits } from '@/lib/digits'
import { egp } from '@/lib/checkout-core'
import { trackEvent } from '@/lib/tracking/client'

type Props = { defaults: { name: string; phone: string; email: string }; loggedIn: boolean }

const input = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none'

export default function CheckoutClient({ defaults, loggedIn }: Props) {
  const cart = useCart()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [form, setForm] = useState({ name: defaults.name, phone: defaults.phone, email: defaults.email, address: '', note: '' })
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const tracked = useRef(false)

  useEffect(() => {
    try { setCode(localStorage.getItem(DISCOUNT_KEY) ?? '') } catch { /* ignore */ }
  }, [])
  const { quote, loading, error: quoteError } = useQuote(cart.lines, cart.ready, code)

  useEffect(() => {
    if (quote?.buyable && !tracked.current) { tracked.current = true; trackEvent('checkout_started') }
  }, [quote?.buyable])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'phone' ? normalizeDigits(e.target.value) : e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending || !quote?.buyable) return
    setSending(true); setError(null); setFields({})
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: cart.lines, discountCode: code || undefined, customer: form }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFields(data.fields ?? {})
        setError(data.fields ? 'Please check the highlighted fields.' : data.error ?? 'Something went wrong. Please try again.')
        return
      }
      // the secret token is kept so this browser can reopen the confirmation page (it is also in the page address)
      try { localStorage.setItem(`pg_order_${data.code}`, data.token); localStorage.removeItem(DISCOUNT_KEY) } catch { /* ignore */ }
      cart.clear()
      router.push(`/checkout/${data.code}?t=${data.token}`)
    } catch {
      setError('Could not reach the shop. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  if (!cart.ready) return <p className="mt-8 text-zinc-400">Loading…</p>
  if (cart.lines.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-lg font-bold text-white">Your cart is empty</p>
        <Link href="/products" className="mt-4 inline-block rounded-full bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500">Browse products</Link>
      </div>
    )
  }

  const err = (k: string) => fields[k] && <p className="mt-1 text-sm text-red-400">{fields[k]}</p>

  return (
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {!loggedIn && (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
            You can order without an account. <Link href="/auth/login" className="font-bold text-red-400 hover:text-red-300">Log in</Link> to see all your orders in one place.
          </p>
        )}

        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-black text-white">Delivery details</h2>
          <label className="block"><span className="text-sm font-semibold text-zinc-300">Full name</span>
            <input className={input} value={form.name} onChange={set('name')} autoComplete="name" required />{err('name')}</label>
          <label className="block"><span className="text-sm font-semibold text-zinc-300">Phone number (we call or message you about delivery)</span>
            <input className={input} value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="01012345678" required />{err('phone')}</label>
          <label className="block"><span className="text-sm font-semibold text-zinc-300">Email (optional)</span>
            <input className={input} type="email" value={form.email} onChange={set('email')} autoComplete="email" />{err('email')}</label>
          <label className="block"><span className="text-sm font-semibold text-zinc-300">Delivery address</span>
            <textarea className={input} rows={3} value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="Street, building, area, city" required />{err('address')}</label>
          <label className="block"><span className="text-sm font-semibold text-zinc-300">Anything we should know about the order? (optional)</span>
            <textarea className={input} rows={2} maxLength={600} value={form.note} onChange={set('note')} placeholder="Delivery time, size, color preference…" />{err('note')}</label>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-300">
          <h2 className="text-lg font-black text-white">What happens next</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>You press <b className="text-white">Confirm order</b>. Nothing is charged on the website.</li>
            <li>We hold your items for 24 hours and message you on WhatsApp on the number above.</li>
            <li>We agree on payment and delivery with you there, and your order is confirmed.</li>
          </ol>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-black text-white">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {(quote?.lines ?? []).map((l) => (
            <li key={`${l.productId}:${l.variantId}`} className="flex justify-between gap-3 text-zinc-300">
              <span>{l.title}{l.colorName ? ` (${l.colorName})` : ''} × {l.quantity}</span>
              <span className="shrink-0 text-white">{egp(l.unitPriceEgp * l.quantity)}</span>
            </li>
          ))}
        </ul>
        {quote ? <OrderSummary quote={quote} /> : <p className="text-sm text-zinc-400">{loading ? 'Calculating…' : ''}</p>}
        {quoteError && <p className="text-sm text-red-400">{quoteError}</p>}
        {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-900/20 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button
          disabled={sending || !quote?.buyable}
          className="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'Sending your order…' : 'Confirm order'}
        </button>
        {quote && !quote.buyable && <p className="text-sm text-amber-300">Some items are no longer available. <Link href="/cart" className="underline">Back to your cart</Link>.</p>}
      </aside>
    </form>
  )
}
