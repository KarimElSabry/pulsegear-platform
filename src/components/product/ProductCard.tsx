// src/components/product/ProductCard.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { isOptimizable } from '@/lib/image-hosts'
import { Product } from '@/types/product'
import { useWishlist } from '@/hooks/useWishlist'
import { useLikes } from '@/hooks/useLikes'
import { useSale } from '@/components/promotions/PromotionsProvider'
import { isClientListing } from '@/lib/sellers'

type Props = {
  product: Product
}

// ✅ Condition color map — all lowercase keys for case-insensitive matching
const conditionStyles: Record<string, { text: string; bg: string }> = {
  'new with tags':    { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'new':              { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'new without tags': { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'like new':         { text: 'text-green-400',   bg: 'bg-green-400/10'   },
  'very good':        { text: 'text-blue-400',    bg: 'bg-blue-400/10'    },
  'good':             { text: 'text-yellow-400',  bg: 'bg-yellow-400/10'  },
  'satisfactory':     { text: 'text-orange-400',  bg: 'bg-orange-400/10'  },
}

export default function ProductCard({ product }: Props) {
  const { isLoved, toggleLove } = useWishlist()
  const { likes, loading, addLike, liked, isSold } = useLikes(product.id!, product.status)
  const sale = useSale(product.id, product.price_egp ?? 0)
  const [imageFailed, setImageFailed] = useState(false) // dead external photo (e.g. expired Vinted link)

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ??
    product.images?.[0]?.image_url ??
    null

  // ✅ Lowercase match — handles "Very good", "VERY GOOD", "very good" etc.
  const condition = product.condition ?? '—'
  const condStyle = conditionStyles[condition.toLowerCase()] ?? {
    text: 'text-zinc-400',
    bg: 'bg-zinc-800',
  }

  return (
    <Link href={`/products/${product.slug ?? product.id}`}>
      <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-500 transition-all duration-300 cursor-pointer">

        {/* Image */}
        <div className="relative aspect-square bg-white overflow-hidden">
          {primaryImage && !imageFailed ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              unoptimized={!isOptimizable(primaryImage)}
              onError={() => setImageFailed(true)}
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

          {/* 🏷️ Campaign: name on the left, percent off on the right (only while the product is not sold or reserved) */}
          {sale && product.status === 'available' && (
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2">
              <span className="max-w-[65%] truncate rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">{sale.name}</span>
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">-{sale.percent}%</span>
            </div>
          )}

          {/* ❤️ Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleLove(product)
            }}
            className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200"
            aria-label="Toggle Wishlist"
          >
            <span className="text-xl">
              {isLoved(product.id!) ? '❤️' : '🤍'}
            </span>
          </button>

          {/* 👍 Likes Button */}
          {!isSold && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addLike()
              }}
              disabled={liked}
              className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1.5 flex items-center gap-1 transition-all duration-200
                ${liked
                  ? 'bg-blue-500/80 cursor-not-allowed'
                  : 'bg-black/60 hover:bg-black/80'
                }`}
              aria-label="Like Product"
            >
              <span className="text-xl">👍</span>
              <span className="text-xs text-white font-bold">
                {loading ? '...' : likes}
              </span>
            </button>
          )}

        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-1">

          {/* Brand + Condition */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-500 font-semibold uppercase tracking-wide">
              {product.brand ?? '—'}
              {isClientListing(product) && <span className="ml-2 rounded-full bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-sky-300">Client listing</span>}
            </span>

            {/* ✅ Colored condition badge */}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${condStyle.text} ${condStyle.bg}`}>
              {condition}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white font-bold text-sm leading-snug mt-1 line-clamp-2">
            {product.title}
          </h2>

          {/* ✅ Price — fixed locale to avoid SSR/client hydration mismatch */}
          {sale && product.status === 'available' ? (
            <p className="text-white font-black text-lg mt-2 flex flex-wrap items-baseline gap-x-2">
              <span>{sale.price.toLocaleString('en-US')} <span className="text-zinc-400 text-sm font-normal">EGP</span></span>
              <span className="text-zinc-500 text-sm font-normal line-through">{sale.regular.toLocaleString('en-US')}</span>
            </p>
          ) : (
            <p className="text-white font-black text-lg mt-2">
              {(product.price_egp ?? 0).toLocaleString('en-US')}{' '}
              <span className="text-zinc-400 text-sm font-normal">EGP</span>
            </p>
          )}

        </div>
      </div>
    </Link>
  )
}