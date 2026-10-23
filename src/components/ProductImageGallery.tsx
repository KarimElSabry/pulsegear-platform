'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ProductImage } from '@/types/product'
import { useVariant } from '@/components/product/VariantContext'
import { imagesForVariant } from '@/lib/variant-images'
import { isOptimizable } from '@/lib/image-hosts'

type Props = {
  images: ProductImage[]
  title: string
}

export default function ProductImageGallery({ images: allImages, title }: Props) {
  // With colors, show the photos of the chosen color (plus photos shared by every color).
  const variant = useVariant()
  const images = imagesForVariant(allImages, variant?.variants.length ? variant.selected?.id ?? null : null, (variant?.variants.length ?? 0) > 0)

  const mainImage =
    images.find((img) => img.is_primary)?.image_url ??
    images[0]?.image_url ??
    '/placeholder.jpg'

  const [chosen, setChosen] = useState<string | null>(null)
  // A photo picked earlier only counts while it still belongs to the visible color.
  const selected = chosen && images.some((img) => img.image_url === chosen) ? chosen : mainImage
  const setSelected = setChosen

  return (
    <div className="flex flex-col gap-4">

      {/* Main Image */}
      <div className="bg-white rounded-2xl overflow-hidden aspect-square relative">
        <Image
          src={selected}
          alt={title}
          fill
          className="object-cover transition-all duration-300"
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized={!isOptimizable(selected)}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelected(img.image_url)}
              className={`bg-white rounded-xl overflow-hidden aspect-square relative border-2 transition-all duration-200
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
                sizes="120px"
                unoptimized={!isOptimizable(img.image_url)}
              />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}