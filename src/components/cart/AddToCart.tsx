// src/components/cart/AddToCart.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { useVariant } from '@/components/product/VariantContext'
import { DISCOUNT_KEY, NOTE_MAX } from '@/lib/cart'

type Props = { productId: number; discountCode?: string }

export default function AddToCart({ productId, discountCode }: Props) {
  const cart = useCart()
  const router = useRouter()
  const variant = useVariant()
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const a = variant?.availability
  const hasColors = (variant?.variants.length ?? 0) > 0
  const variantId = hasColors ? variant?.selected?.id ?? null : null
  const max = a?.maxQuantity ?? 1
  const qty = Math.min(quantity, max) || 1

  const add = (): boolean => {
    if (!a?.canBuy) return false
    const status = cart.add({ productId, variantId, quantity: qty, note: note.trim() }, max)
    if (status === 'full') {
      setMessage({ text: 'Your cart is full (20 different items). Please check out first.', ok: false })
      return false
    }
    try {
      if (discountCode) localStorage.setItem(DISCOUNT_KEY, discountCode)
    } catch { /* ignore */ }
    setMessage(
      status === 'capped'
        ? { text: `Added. Only ${max} available, so your cart now has the maximum.`, ok: true }
        : { text: status === 'merged' ? 'Quantity updated in your cart.' : 'Added to your cart.', ok: true }
    )
    return true
  }

  return (
    <div className="space-y-3">
      {!a?.oneOff && max > 1 && (
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          Quantity
          <select value={qty} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white">
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      )}

      {showNote ? (
        <label className="block text-sm text-zinc-300">
          Note for this item (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
            rows={2}
            placeholder="Size, color preference, or anything we should know"
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          />
        </label>
      ) : (
        <button type="button" onClick={() => setShowNote(true)} className="text-sm text-zinc-400 underline hover:text-white">+ Add a note for this item</button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={add}
          className="rounded-xl border border-red-500 py-3 font-bold text-white transition hover:bg-red-600/20"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={() => { if (add()) router.push('/checkout') }}
          className="rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-500"
        >
          Buy now
        </button>
      </div>

      {message && (
        <p role="status" className={`rounded-xl border px-4 py-2 text-sm ${message.ok ? 'border-green-800 bg-green-900/20 text-green-300' : 'border-red-800 bg-red-900/20 text-red-300'}`}>
          {message.text}{message.ok && <> <Link href="/cart" className="font-bold underline">View cart</Link></>}
        </p>
      )}

      <p className="text-xs text-zinc-500">
        Add to your cart and press Confirm order. Nothing is paid on the website: we contact you on WhatsApp to arrange payment and delivery.
        Questions? <Link href="/contact" className="text-red-400 hover:text-red-300">Contact us</Link>.
      </p>
    </div>
  )
}
