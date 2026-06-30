// src/app/sold/page.tsx
import { ProductService } from '@/services/productService'
import Image from 'next/image'

export default async function SoldArchivePage() {
  // ✅ جيب المنتجات المباعة من Supabase
  const soldProducts = await ProductService.getProducts({ status: 'sold' })

  // ✅ Group by month using created_at (soldAt مش موجود)
  const grouped = soldProducts.reduce((acc, product) => {
    const month = new Date(product.created_at!).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    if (!acc[month]) acc[month] = []
    acc[month].push(product)
    return acc
  }, {} as Record<string, typeof soldProducts>)

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">

      {/* ─── Header ─────────────────────────────── */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white">🏷️ Sold Archive</h1>
        <p className="text-zinc-400 mt-2">
          These gems have found their new home.
        </p>
      </div>

      {/* ─── Grouped by Month ───────────────────── */}
      {Object.entries(grouped).map(([month, items]) => (
        <section key={month} className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-400 border-b border-zinc-800 pb-2 mb-6">
            📅 {month}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((product) => {
              const mainImage = product.images?.[0]?.image_url ?? '/placeholder.jpg'

              return (
                <div
                  key={product.id}
                  className="relative rounded-xl overflow-hidden shadow-sm opacity-70 bg-zinc-900"
                >
                  {/* SOLD Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <span className="text-white font-bold text-lg tracking-widest">
                      SOLD
                    </span>
                  </div>

                  {/* Product Image ✅ next/image */}
                  <div className="relative w-full h-48">
                    <Image
                      src={mainImage}
                      alt={product.title}
                      fill
                      className="object-cover grayscale"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-3 bg-zinc-800">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {product.title}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {product.price_egp.toLocaleString()} EGP
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Sold{' '}
                      {new Date(product.created_at!).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {/* ─── Empty State ────────────────────────── */}
      {soldProducts.length === 0 && (
        <div className="text-center text-zinc-400 mt-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg">No sold items yet.</p>
        </div>
      )}

    </main>
  )
}