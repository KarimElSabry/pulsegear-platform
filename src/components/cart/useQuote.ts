// src/components/cart/useQuote.ts

'use client'

import { useEffect, useRef, useState } from 'react'
import type { CartLine } from '@/lib/cart'
import type { QuoteResult } from '@/lib/quote'

/** Asks the server for the real prices of the cart whenever the cart or the discount code changes. */
export function useQuote(lines: CartLine[], ready: boolean, discountCode: string) {
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const seq = useRef(0)

  const key = JSON.stringify(lines) + '|' + discountCode
  useEffect(() => {
    if (!ready) return
    if (lines.length === 0) { setQuote(null); setLoading(false); setError(null); return }
    const mine = ++seq.current
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines, discountCode: discountCode || undefined }) })
        const data = await res.json()
        if (mine !== seq.current) return // a newer request is already running
        if (!res.ok) { setError(data.error ?? 'Could not load your cart'); setQuote(null) } else { setQuote(data as QuoteResult); setError(null) }
      } catch {
        if (mine === seq.current) setError('Could not reach the shop. Check your connection and try again.')
      } finally {
        if (mine === seq.current) setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready])

  return { quote, loading, error }
}
