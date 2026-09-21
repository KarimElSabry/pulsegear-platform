// src/components/product/ProductGrid.tsx

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Product } from '@/types/product'
import ProductCard from './ProductCard'

type Props = {
  limit?: number
  filterBrand?: string
  filterCondition?: string
  filterAvailability?: string
  filterCategory?: string
  randomize?: boolean
}

export default function ProductGrid({
  limit,
  filterBrand,
  filterCondition,
  filterAvailability,
  filterCategory,
  randomize,
}: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('products')
      .select('*, images:product_images(*)')
      .order('created_at', { ascending: false })

    if (filterAvailability === 'In Stock') {
      query = query.eq('status', 'available')
    } else if (filterAvailability === 'Sold') {
      query = query.eq('status', 'sold')
    } else if (filterAvailability === 'Reserved') {
      query = query.eq('status', 'reserved')
    }

    const { data, error } = await query

    if (error) {
      console.error('fetchProducts error:', error.message)
      setProducts([])
      setLoading(false)
      return
    }

    setProducts((data ?? []) as Product[])
    setLoading(false)
  }, [supabase, filterAvailability])

  useEffect(() => {
    fetchProducts()

    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchProducts])

  let displayed = [...products]

  if (filterBrand && filterBrand !== 'All') {
    displayed = displayed.filter(
      (p) => p.brand?.toLowerCase() === filterBrand.toLowerCase()
    )
  }

  if (filterCondition && filterCondition !== 'All') {
    displayed = displayed.filter((p) => p.condition === filterCondition)
  }

  if (filterCategory && filterCategory !== 'All') {
    displayed = displayed.filter(
      (p) =>
        p.category?.toLowerCase().replace(/ /g, '_') ===
        filterCategory.toLowerCase().replace(/ /g, '_')
    )
  }

  const statusOrder: Record<string, number> = {
    available: 0,
    reserved: 1,
    sold: 2,
  }

  displayed = displayed.sort(
    (a, b) =>
      (statusOrder[a.status ?? ''] ?? 0) - (statusOrder[b.status ?? ''] ?? 0)
  )

  if (randomize) {
    const groups = [
      displayed.filter((p) => p.status === 'available'),
      displayed.filter((p) => p.status === 'reserved'),
      displayed.filter((p) => p.status === 'sold'),
    ].map((group) => group.sort(() => Math.random() - 0.5))

    displayed = groups.flat()
  }

  if (limit) {
    displayed = displayed.slice(0, limit)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit || 6)].map((_, i) => (
          <div
            key={i}
            className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900 animate-pulse"
          >
            <div className="w-full h-64 bg-zinc-800 rounded-xl mb-5" />
            <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
            <div className="h-6 bg-zinc-800 rounded w-2/3 mb-3" />
            <div className="h-4 bg-zinc-800 rounded w-1/4 mb-5" />
            <div className="h-10 bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (displayed.length === 0) {
    return (
      <p className="text-zinc-500 col-span-3 text-center py-20">
        No products found. Try changing the filters.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayed.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}