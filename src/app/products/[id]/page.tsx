// src/app/products/[id]/page.tsx

import { ProductService } from '@/services/productService'
import { notFound } from 'next/navigation'
import ProductImageGallery from '@/components/ProductImageGallery'
import PriceSection from '@/components/PriceSection'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params

  const product = await ProductService.getProductBySlug(id)

  if (!product) return notFound()

  const images = product.images ?? []

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        <ProductImageGallery images={images} title={product.title} />

        <div className="flex flex-col justify-center gap-6">

          <div className="flex gap-3">
            {product.brand && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {product.brand}
              </span>
            )}
            {product.category && (
              <span className="bg-zinc-800 text-zinc-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {product.category}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-black text-white uppercase leading-tight">
            {product.title}
          </h1>

          {product.condition && (
            <p className="text-sm text-zinc-400 font-medium">
              Condition:{' '}
              <span className="text-purple-400 font-bold capitalize">
                {product.condition}
              </span>
            </p>
          )}

          {product.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-white font-bold text-lg uppercase tracking-wide">
                📝 Seller Description
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-purple-600 pl-4 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <PriceSection
            originalPrice={product.price_egp ?? 0}
            productId={product.id!}
            productTitle={product.title}
            isReservable={product.is_reservable ?? false}  // ✅ من الـ DB مباشرة
            status={product.status ?? 'available'}
          />

        </div>
      </div>
    </main>
  )
}