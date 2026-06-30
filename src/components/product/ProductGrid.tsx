'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'
import ProductCard from './ProductCard'

type Props = {
  limit?: number
  filterBrand?: string
  filterCondition?: string
  filterAvailability?: string
}

export default function ProductGrid({
  limit,
  filterBrand,
  filterCondition,
  filterAvailability,
}: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ useCallback عشان نقدر نستخدمها جوه الـ useEffect وبره
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ fetchProducts error:', error.message)
      setLoading(false)
      return
    }

    setProducts(data as Product[])
    setLoading(false)
  }, [])

  useEffect(() => {
    // ✅ أول fetch لما الصفحة تفتح
    fetchProducts()

    // ✅ Realtime listener
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts() // ✅ بيتحدث أوتوماتيك لما حاجة تتغير
        }
      )
      .subscribe()

    // ✅ Cleanup لما الـ component يتمسح
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts])

  // ─── Apply Filters ────────────────────────────────────
  let displayed = [...products]

  if (filterBrand && filterBrand !== 'All') {
    displayed = displayed.filter(
      (p) => p.brand?.toLowerCase() === filterBrand.toLowerCase()
    )
  }

  if (filterCondition && filterCondition !== 'All') {
    displayed = displayed.filter((p) => p.condition === filterCondition)
  }

  if (filterAvailability === 'In Stock') {
    displayed = displayed.filter((p) => p.status === 'available')
  }

  if (limit) {
    displayed = displayed.slice(0, limit)
  }

  // ─── Loading State ────────────────────────────────────
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

  // ─── Empty State ──────────────────────────────────────
  if (displayed.length === 0) {
    return (
      <p className="text-zinc-500 col-span-3 text-center py-20">
        No products found. Try changing the filters.
      </p>
    )
  }

  // ─── Products Grid ────────────────────────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayed.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}