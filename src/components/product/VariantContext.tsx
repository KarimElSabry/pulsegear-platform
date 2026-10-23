// src/components/product/VariantContext.tsx

'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { activeVariants, availability, type Availability, type StockProduct, type VariantLite } from '@/lib/stock'

type Value = {
  variants: VariantLite[]
  selected: VariantLite | null
  select: (id: number) => void
  availability: Availability
}

const Ctx = createContext<Value | null>(null)

/** Shares the chosen color between the photos, the color picker and the buy box. */
export function VariantProvider({
  product,
  variants,
  children,
}: {
  product: StockProduct
  variants: VariantLite[]
  children: ReactNode
}) {
  const list = useMemo(() => activeVariants(variants), [variants])
  // Start on the first color that can be bought, otherwise on the first color.
  const first = useMemo(() => list.find((v) => availability(product, v).canBuy) ?? list[0] ?? null, [list, product])
  const [selectedId, setSelectedId] = useState<number | null>(first?.id ?? null)
  const selected = list.find((v) => v.id === selectedId) ?? first

  const value = useMemo<Value>(
    () => ({ variants: list, selected, select: setSelectedId, availability: availability(product, selected) }),
    [list, selected, product]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** null when the page has no provider (for example a listing). */
export function useVariant(): Value | null {
  return useContext(Ctx)
}
