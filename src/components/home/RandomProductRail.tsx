// src/components/home/RandomProductRail.tsx
// Shows a different selection of products each browser session, picked from a larger pool the
// server sends. The server render (and no-JS visitors) see the default newest-first order;
// after hydration the session's own order is applied and then stays stable while they browse.
'use client'

import { useMemo } from 'react'
import type { Product } from '@/types/product'
import { useSessionSeed } from '@/hooks/useSessionSeed'
import { seededShuffle } from '@/lib/random'
import ProductCarousel from './ProductCarousel'

export default function RandomProductRail({
  pool,
  limit,
  salt,
}: {
  pool: Product[]
  limit: number
  salt: string
}) {
  const seed = useSessionSeed()
  const items = useMemo(() => seededShuffle(pool, seed, salt).slice(0, limit), [pool, seed, salt, limit])
  return <ProductCarousel products={items} />
}
