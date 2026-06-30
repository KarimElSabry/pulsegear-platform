'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/product/ProductGrid'

const conditions = [
  'All', 'New with tags', 'New without tags',
  'Very good', 'Good', 'Satisfactory',
]
const availabilities = ['All', 'In Stock', 'Sold']

// ✅ بياخد الـ brands جاهزة من الـ Server
export default function ProductsContent({ initialBrands }: { initialBrands: string[] }) {
  const searchParams = useSearchParams()
  const [brand, setBrand] = useState('All')
  const [condition, setCondition] = useState('All')
  const [availability, setAvailability] = useState('All')

  // ✅ مفيش useEffect يجيب data — الـ brands جاية جاهزة!
  const brands = ['All', ...initialBrands]

  useEffect(() => {
    const brandFromURL = searchParams.get('brand')
    setBrand(brandFromURL ?? 'All')
  }, [searchParams])

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-white uppercase mb-10">
        All Products
      </h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-10 p-5 bg-zinc-900 rounded-2xl border border-zinc-800">

        {/* Brand */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full border border-zinc-700 focus:outline-none focus:border-red-500"
          >
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full border border-zinc-700 focus:outline-none focus:border-red-500"
          >
            {conditions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Availability</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full border border-zinc-700 focus:outline-none focus:border-red-500"
          >
            {availabilities.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <div className="flex flex-col justify-end">
          <button
            onClick={() => {
              setBrand('All')
              setCondition('All')
              setAvailability('All')
            }}
            className="text-sm text-zinc-400 hover:text-red-500 transition-colors px-4 py-2 rounded-full border border-zinc-700 hover:border-red-500"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Grid */}
      <ProductGrid
        filterBrand={brand}
        filterCondition={condition}
        filterAvailability={availability}
      />
    </main>
  )
}