// src/components/cart/CartProvider.tsx

'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CART_EVENT, CART_KEY, addToCart, cartCount, parseCart, removeLine, serializeCart, setNote, setQuantity,
  type AddResult, type CartLine,
} from '@/lib/cart'

type CartApi = {
  lines: CartLine[]
  count: number
  ready: boolean
  add: (item: { productId: number; variantId: number | null; quantity?: number; note?: string }, maxQuantity: number) => AddResult['status']
  setQty: (key: string, quantity: number, max?: number) => void
  setLineNote: (key: string, note: string) => void
  remove: (key: string) => void
  clear: () => void
}

const Ctx = createContext<CartApi | null>(null)

function read(): CartLine[] {
  try { return parseCart(localStorage.getItem(CART_KEY)) } catch { return [] }
}

/** The cart is kept in the browser (localStorage) so it works for guests and accounts, and survives page reloads. */
export default function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => setLines(read())
    sync()
    setReady(true)
    const onStorage = (e: StorageEvent) => { if (e.key === CART_KEY) sync() } // another tab changed it
    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const commit = useCallback((next: CartLine[]) => {
    try { localStorage.setItem(CART_KEY, serializeCart(next)) } catch { /* private mode: the cart lasts for this page only */ }
    setLines(next)
    window.dispatchEvent(new Event(CART_EVENT))
  }, [])

  const api = useMemo<CartApi>(() => ({
    lines,
    count: cartCount(lines),
    ready,
    add: (item, maxQuantity) => {
      const result = addToCart(read(), item, maxQuantity)
      if (result.status !== 'full') commit(result.lines)
      return result.status
    },
    setQty: (key, quantity, max) => commit(setQuantity(read(), key, quantity, max)),
    setLineNote: (key, note) => commit(setNote(read(), key, note)),
    remove: (key) => commit(removeLine(read(), key)),
    clear: () => commit([]),
  }), [lines, ready, commit])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useCart(): CartApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
