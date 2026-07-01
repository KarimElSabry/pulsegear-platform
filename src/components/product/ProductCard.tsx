'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/product'
import { useWishlist } from '@/hooks/useWishlist'
import { useLikes } from '@/hooks/useLikes'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { isLoved, toggleLove } = useWishlist()
  const { likes, loading, addLike, liked } = useLikes(product.id!) // ✅ أضفنا liked

  // ✅ جيب أول صورة من الـ images array
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ??
    product.images?.[0]?.image_url ??
    null

  return (
    <Link href={`/products/${product.slug ?? product.id}`}>
      <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-500 transition-all duration-300 cursor-pointer">

        {/* Image */}
        <div className="relative aspect-square bg-zinc-800 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
              No Image
            </div>
          )}

          {/* ✅ SOLD Overlay Badge */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white text-sm font-black px-4 py-2 rounded-full tracking-widest uppercase">
                SOLD OUT
              </span>
            </div>
          )}

          {/* 🟡 RESERVED Overlay Badge */}
          {product.status === 'reserved' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-yellow-500 text-black text-sm font-black px-4 py-2 rounded-full tracking-widest uppercase shadow-lg">
                🔒 RESERVED
              </span>
            </div>
          )}

          {/* ❤️ Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleLove(product)
            }}
            className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200"
            aria-label="Toggle Wishlist"
          >
            <span className="text-xl">
              {isLoved(product.id!) ? '❤️' : '🤍'}
            </span>
          </button>

          {/* 👍 Likes Button — ✅ Updated */}
          <button
            onClick={(e) => {
              e.preventDefault()
              addLike()
            }}
            disabled={liked} // ✅ منع Double Like
            className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1.5 flex items-center gap-1 transition-all duration-200
              ${liked
                ? 'bg-blue-500/80 cursor-not-allowed'   // ✅ بعد الضغط
                : 'bg-black/60 hover:bg-black/80'        // قبل الضغط
              }`}
            aria-label="Like Product"
          >
            <span className="text-xl">{liked ? '👍' : '👍'}</span>
            <span className="text-xs text-white font-bold">
              {loading ? '...' : likes}
            </span>
          </button>

        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-1">

          {/* Brand + Condition */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-500 font-semibold uppercase tracking-wide">
              {product.brand ?? '—'}
            </span>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              {product.condition ?? '—'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white font-bold text-sm leading-snug mt-1 line-clamp-2">
            {product.title}
          </h2>

          {/* Price */}
          <p className="text-white font-black text-lg mt-2">
            {(product.price_egp ?? 0).toLocaleString()}{' '}
            <span className="text-zinc-400 text-sm font-normal">EGP</span>
          </p>

        </div>
      </div>
    </Link>
  )
}