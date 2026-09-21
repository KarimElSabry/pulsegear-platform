// src/components/StatsBar.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

type Stats = {
  products: number
  sold: number
  brands: number
}

export default function StatsBar() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [stats, setStats] = useState<Stats>({
    products: 0,
    sold: 0,
    brands: 0,
  })
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [{ count: productsCount }, { count: soldCount }, { data: brandsData }] =
          await Promise.all([
            supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'available'),

            supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'sold'),

            supabase
              .from('products')
              .select('brand')
              .not('brand', 'is', null),
          ])

        const uniqueBrands = new Set(
          (brandsData ?? [])
            .map((item: any) => item.brand)
            .filter(Boolean)
        )

        setStats({
          products: productsCount ?? 0,
          sold: soldCount ?? 0,
          brands: uniqueBrands.size,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const items = [
    { label: 'Available Products', value: stats.products },
    { label: 'Sold Products', value: stats.sold },
    { label: 'Brands', value: stats.brands },
  ]

  return (
    <section className="w-full bg-black border-y border-white/10" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-2">
            <span className="text-4xl md:text-5xl font-black text-white">
              {loading ? (
                '...'
              ) : inView ? (
                <CountUp end={item.value} duration={1.8} separator="," />
              ) : (
                0
              )}
            </span>
            <span className="text-sm md:text-base uppercase tracking-widest text-zinc-400">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}