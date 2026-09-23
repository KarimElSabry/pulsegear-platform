// src/app/account/wishlist/page.tsx

'use client'

import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import AccountTabs from '@/components/account/AccountTabs'
import { useWishlist } from '@/hooks/useWishlist'

export default function AccountWishlistPage() {
  const { wishlist, loading } = useWishlist()

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Account
          </p>
          <h1 className="text-4xl font-black text-white mt-2">My Wishlist</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        <AccountTabs />

        {loading ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4 animate-pulse">❤️</p>
            <p className="text-zinc-500">Loading your wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-6xl mb-4">🤍</p>
            <p className="text-zinc-400 text-lg mb-6">
              No items in your wishlist yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}