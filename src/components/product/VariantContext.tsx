// src/components/product/VariantContext.tsx

'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { activeVariants, availability, variantPrice, type Availability, type StockProduct, type VariantLite } from '@/lib/stock'

type Value = {
  /** Every active option (one per color, size, or color + size). */
  variants: VariantLite[]
  selected: VariantLite | null
  select: (id: number) => void
  /** Pick a color / size: keeps the other choice when that combination exists. */
  selectColor: (name: string) => void
  selectSize: (size: string) => void
  /** The distinct colors and sizes (empty when the product has none). */
  colors: string[]
  sizes: string[]
  availability: Availability
  /** Price of the chosen option (its own, otherwise the product's). */
  price: number
}

const Ctx = createContext<Value | null>(null)

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase()
const distinct = (list: (string | null | undefined)[]) => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of list) {
    const t = (v ?? '').trim()
    if (t && !seen.has(norm(t))) { seen.add(norm(t)); out.push(t) }
  }
  return out
}

/** Shares the chosen color and size between the photos, the pickers and the buy box. */
export function VariantProvider({
  product,
  variants,
  productPrice = 0,
  children,
}: {
  product: StockProduct
  variants: VariantLite[]
  productPrice?: number
  children: ReactNode
}) {
  const list = useMemo(() => activeVariants(variants), [variants])
  // Start on the first option that can be bought, otherwise on the first one.
  const first = useMemo(() => list.find((v) => availability(product, v).canBuy) ?? list[0] ?? null, [list, product])
  const [selectedId, setSelectedId] = useState<number | null>(first?.id ?? null)
  const selected = list.find((v) => v.id === selectedId) ?? first

  const colors = useMemo(() => distinct(list.map((v) => v.name)), [list])
  const sizes = useMemo(() => distinct(list.map((v) => v.size_name)), [list])

  const value = useMemo<Value>(() => {
    // Choose the option for a new color (or size), keeping the other axis when possible, preferring something that is in stock.
    const pick = (matches: (v: VariantLite) => boolean, keepOther: (v: VariantLite) => boolean) => {
      const pool = list.filter(matches)
      const best = (arr: VariantLite[]) => arr.find((v) => availability(product, v).canBuy) ?? arr[0]
      const hit = best(pool.filter(keepOther)) ?? best(pool)
      if (hit) setSelectedId(hit.id)
    }
    return {
      variants: list,
      selected,
      select: setSelectedId,
      selectColor: (name) => pick((v) => norm(v.name) === norm(name), (v) => norm(v.size_name) === norm(selected?.size_name)),
      selectSize: (size) => pick((v) => norm(v.size_name) === norm(size), (v) => norm(v.name) === norm(selected?.name)),
      colors,
      sizes,
      availability: availability(product, selected),
      price: variantPrice(selected, productPrice),
    }
  }, [list, selected, product, colors, sizes, productPrice])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** null when the page has no provider (for example a listing). */
export function useVariant(): Value | null {
  return useContext(Ctx)
}
