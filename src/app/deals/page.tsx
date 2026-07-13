// src/app/deals/page.tsx

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/types/product'

export const revalidate = 60

export default async function DealsPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_deal', true)
    // ✅ Removed status filter — shows all deals including sold ones
    .order('created_at', { ascending: false })

  const deals: Product[] = data ?? []

  // ✅ Count only available deals for the label
  const availableCount = deals.filter((p) => p.status === 'available').length

  return (
    <main className="w-full min-h-screen bg-zinc-950 text-white">

      {/* ── Hero Banner ── */}
      <section className="w-full bg-gradient-to-br from-orange-600/20 via-zinc-950 to-zinc-950 border-b border-orange-500/20 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <span className="text-orange-400 font-bold uppercase tracking-widest text-sm">
            Limited Time
          </span>
          <h1 className="text-5xl md:text-6xl font-black uppercase leading-tight">
            🔥 Hot Deals
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl">
            Hand-picked products at unbeatable prices. Grab them before they're gone!
          </p>
        </div>
      </section>

      {/* ── Deals Grid ── */}
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto">

          {error && (
            <p className="text-red-400 text-sm">
              Failed to load deals. Please try again later.
            </p>
          )}

          {!error && deals.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <span className="text-6xl">🏷️</span>
              <h2 className="text-2xl font-bold text-white">No deals right now</h2>
              <p className="text-zinc-400 text-sm max-w-sm">
                Check back soon — we drop new deals regularly!
              </p>
              <Link
                href="/products"
                className="mt-4 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <>
              {/* ✅ Shows available count + total for urgency */}
              <p className="text-zinc-400 text-sm mb-8">
                {availableCount} of {deals.length} deal{deals.length !== 1 ? 's' : ''} still available
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}

        </div>
      </section>

    </main>
  )
}