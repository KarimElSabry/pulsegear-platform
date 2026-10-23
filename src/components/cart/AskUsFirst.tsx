// src/components/cart/AskUsFirst.tsx
// "Not ready to order? Ask us first." Opens WhatsApp or Instagram with the cart in the message. Creates no order and no hold.

'use client'

import { useState } from 'react'
import { askMessage, type AskLine } from '@/lib/ask-message'
import { instagramDmUrl, whatsappOrderUrl } from '@/lib/contact'

export default function AskUsFirst({ lines }: { lines: AskLine[] }) {
  const [copied, setCopied] = useState(false)
  const text = askMessage(lines)

  // Instagram cannot be pre-filled, so the message is copied for the customer to paste.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch { /* ignore: the customer can still type */ }
  }

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4" data-testid="ask-us-first">
      <p className="text-sm font-bold text-white">Not ready to order? Ask us first</p>
      <p className="mt-1 text-xs text-zinc-400">Questions about sizes, colors, delivery or price? Message us. This does not place an order and does not hold your items.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={whatsappOrderUrl(text)} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-green-600 py-2 text-center text-sm font-bold text-white hover:bg-green-500">WhatsApp</a>
        <a href={instagramDmUrl()} onClick={copy} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-pink-600 py-2 text-center text-sm font-bold text-white hover:bg-pink-500">Instagram</a>
      </div>
      {copied && <p className="mt-2 text-xs text-green-400" role="status">Your cart is copied. Paste it in the Instagram chat.</p>}
    </div>
  )
}
