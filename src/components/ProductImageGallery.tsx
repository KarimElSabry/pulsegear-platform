'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ProductImage } from '@/types/product'

type Props = {
  images: ProductImage[]
  title: string
}

export default function ProductImageGallery({ images, title }: Props) {
  const mainImage =
    images.find((img) => img.is_primary)?.image_url ??
    images[0]?.image_url ??
    '/placeholder.jpg'

  const [selected, setSelected] = useState(mainImage)

  return (
    <div className="flex flex-col gap-4">

      {/* Main Image */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden aspect-square relative">
        <Image
          src={selected}
          alt={title}
          fill
          className="object-cover transition-all duration-300"
          unoptimized
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelected(img.image_url)}
              className={`bg-zinc-900 rounded-xl overflow-hidden aspect-square relative border-2 transition-all duration-200
                ${selected === img.image_url
                  ? 'border-purple-500 scale-105'
                  : 'border-zinc-700 hover:border-purple-400 opacity-60 hover:opacity-100'
                }`}
            >
              <Image
                src={img.image_url}
                alt={`${title} - image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}