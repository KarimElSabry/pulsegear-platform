'use client'

import Image from 'next/image'
import { Product } from '@/types/product'

interface SoldProductCardProps {
  product: Product
}

const timeAgo = (date: string | null): string => {
  if (!date) return 'recently'
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (seconds < 86400) return 'اليوم'
  if (seconds < 172800) return 'إمبارح'
  const days = Math.floor(seconds / 86400)
  if (days < 30) return `منذ ${days} يوم`
  const months = Math.floor(days / 30)
  return `منذ ${months} شهر`
}

export default function SoldProductCard({ product }: SoldProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 
                    bg-white shadow-sm grayscale opacity-75 cursor-not-allowed">

      {/* SOLD Badge */}
      <div className="absolute top-3 left-3 z-20 
                      bg-red-600 text-white text-xs 
                      font-bold px-3 py-1 rounded-full shadow-md">
        SOLD
      </div>

      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={product.title}
            fill
            className="object-cover blur-[1.5px] scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">لا توجد صورة</span>
          </div>
        )}

        {/* Dark Overlay + SOLD stamp */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-white text-3xl font-black 
                           border-4 border-white px-5 py-2 
                           rotate-[-15deg] opacity-90 tracking-widest">
            SOLD
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-500 text-sm truncate">
          {product.title}
        </h3>

        {product.brand && (
          <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold text-gray-400 line-through">
            {product.price_egp.toLocaleString()} جنيه
          </span>
          <span className="text-xs text-gray-400">
            🕒 {timeAgo(product.sold_at ?? null)}
          </span>
        </div>
      </div>
    </div>
  )
}