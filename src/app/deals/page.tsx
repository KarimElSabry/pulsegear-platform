// src/app/deals/page.tsx

import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/types/product'
import { sortUnsoldFirst } from '@/lib/product-sort'
import { loadLiveCampaigns } from '@/lib/promotions-service'
import { cairoDateDots } from '@/lib/promotions'

export const revalidate = 60

export default async function DealsPage() {
  const supabase = await createAdminSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('is_deal', true)
    // ✅ Removed status filter — shows all deals including sold ones
    .order('created_at', { ascending: false })

  const deals: Product[] = sortUnsoldFirst((data ?? []) as Product[])
  // campaigns that are live now (page refreshes every minute); none if the campaign tables are not set up
  const campaigns = await loadLiveCampaigns(supabase, new Date()).catch(() => [])

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

      {/* ── Live campaigns (for example Early White Friday) ── */}
      {campaigns.map((c) => (
        <section key={c.id} className="w-full border-b border-red-500/20 bg-gradient-to-br from-red-600/15 via-zinc-950 to-zinc-950 py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <span className="text-red-400 font-bold uppercase tracking-widest text-sm">Limited time</span>
            <h2 className="mt-2 text-4xl md:text-5xl font-black uppercase leading-tight">🔥 {c.name}</h2>
            <p className="mt-2 mb-8 text-zinc-300">
              Up to {c.maxPercent}% off{c.endsAt ? `. Until ${cairoDateDots(c.endsAt)} or while stock lasts.` : '. While stock lasts.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── Deals Grid ── */}
      <section className={`w-full py-16 px-6 ${!error && deals.length === 0 && campaigns.length > 0 ? 'hidden' : ''}`}>
        <div className="max-w-6xl mx-auto">

          {error && (
            <p className="text-red-400 text-sm">
              Failed to load deals. Please try again later.
            </p>
          )}

          {!error && deals.length === 0 && campaigns.length === 0 ? (
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
            deals.length > 0 && (
            <>
              {campaigns.length > 0 && <h2 className="mb-2 text-2xl font-black uppercase">Hot deals</h2>}
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
            )
          )}

        </div>
      </section>

    </main>
  )
}