import { ProductService } from '@/services/productService'
import { notFound } from 'next/navigation'
import ProductImageGallery from '@/components/ProductImageGallery'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params

  const products = await ProductService.getProducts()
  const product = products.find((p) => String(p.id) === id || p.slug === id)

  if (!product) return notFound()

  const images = product.images ?? []

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ✅ Interactive Image Gallery */}
        <ProductImageGallery images={images} title={product.title} />

        {/* Details */}
        <div className="flex flex-col justify-center gap-6">

          {/* Brand + Category */}
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

          {/* Title */}
          <h1 className="text-4xl font-black text-white uppercase leading-tight">
            {product.title}
          </h1>

          {/* Condition */}
          {product.condition && (
            <p className="text-sm text-zinc-400 font-medium">
              Condition:{' '}
              <span className="text-purple-400 font-bold capitalize">
                {product.condition}
              </span>
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-white font-bold text-lg uppercase tracking-wide">
                📝 Description
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-purple-600 pl-4 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-sm text-zinc-500 mb-1">Final Price in Egypt</p>
            <p className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              {product.price_egp?.toLocaleString()} EGP
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              ✅ Includes shipping, customs & delivery.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              🚚 Shipping takes from 1-2 weeks.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/+201205322444?text=I'm interested in: ${encodeURIComponent(product.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-400 text-white font-black text-lg py-4 px-8 rounded-full text-center transition-all duration-200 uppercase tracking-wide"
            >
              📲 Reserve via WhatsApp
            </a>
            <a
              href="https://instagram.com/pulsegear_egypt"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white font-black text-lg py-4 px-8 rounded-full text-center transition-all duration-200 uppercase tracking-wide"
            >
              📸 Reserve via Instagram
            </a>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            We handle everything: sourcing, shipping, customs & delivery. Shipping takes 1-2 weeks.
          </p>

        </div>
      </div>
    </main>
  )
}