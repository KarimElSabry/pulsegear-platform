// src/app/products/ProductsContent.tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/product/ProductGrid'

const conditions = [
  'All', 'New with tags', 'New without tags',
  'Very good', 'Good', 'Satisfactory',
]

const availabilities = ['All', 'In Stock', 'Sold']

// ✅ Updated to match Admin form values exactly
const categories = [
  'All', 'Fitness Watches', 'Heart Rate Straps',
  'Replacement Straps', 'Running Accessories',
  'Cycling Accessories', 'Other',
]

// Match a URL value like "fitness_watches" or "Fitness Watches" to a canonical list entry.
const canon = (list: string[], value: string | null) =>
  value
    ? list.find((x) => x.toLowerCase().replace(/[\s_]+/g, '') === value.toLowerCase().replace(/[\s_]+/g, '')) ?? 'All'
    : 'All'

export default function ProductsContent({ initialBrands }: { initialBrands: string[] }) {
  const searchParams = useSearchParams()
  const [brand, setBrand]               = useState(() => searchParams.get('brand') ?? 'All')
  const [condition, setCondition]       = useState('All')
  const [availability, setAvailability] = useState(() => canon(availabilities, searchParams.get('availability')))
  const [category, setCategory]         = useState(() => canon(categories, searchParams.get('category')))

  // When the URL changes (e.g. a header or homepage link), re-apply it during render.
  const urlKey = searchParams.toString()
  const [seenKey, setSeenKey] = useState(urlKey)
  if (seenKey !== urlKey) {
    setSeenKey(urlKey)
    setBrand(searchParams.get('brand') ?? 'All')
    setAvailability(canon(availabilities, searchParams.get('availability')))
    setCategory(canon(categories, searchParams.get('category')))
  }

  const brands = ['All', ...initialBrands]

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

        {/* ✅ Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full border border-zinc-700 focus:outline-none focus:border-red-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
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
              setCategory('All') // ✅ Reset category too
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
        filterCategory={category} // ✅ NEW
      />

    </main>
  )
}