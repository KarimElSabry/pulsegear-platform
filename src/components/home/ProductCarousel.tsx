// src/components/home/ProductCarousel.tsx
// Horizontal product rail (Embla). Products are fetched on the server
// and passed in, so the HTML already contains them.
'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { Product } from '@/types/product'
import ProductCard from '@/components/product/ProductCard'

export default function ProductCarousel({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
    skipSnaps: true,
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [progress, setProgress] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
    setProgress(Math.max(0, Math.min(1, emblaApi.scrollProgress())))
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    // Initial sync after paint (avoids a synchronous setState inside the effect body)
    const frame = requestAnimationFrame(onSelect)
    emblaApi.on('select', onSelect).on('scroll', onSelect).on('reInit', onSelect)
    return () => {
      cancelAnimationFrame(frame)
      emblaApi.off('select', onSelect).off('scroll', onSelect).off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (products.length === 0) {
    return (
      <p className="card px-6 py-14 text-center text-sm text-muted">
        New arrivals are on their way. Check back soon.
      </p>
    )
  }

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label="Products">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex touch-pan-y">
          {products.map((p, i) => (
            <div
              key={p.id ?? i}
              className="min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_48%] lg:flex-[0_0_32%] xl:flex-[0_0_24.5%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${products.length}`}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="h-px flex-1 bg-line">
          <div className="h-px bg-brand-soft transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="flex gap-2">
          <NavButton dir="prev" disabled={!canPrev} onClick={() => emblaApi?.scrollPrev()} />
          <NavButton dir="next" disabled={!canNext} onClick={() => emblaApi?.scrollNext()} />
        </div>
      </div>
    </div>
  )
}

function NavButton({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous products' : 'Next products'}
      className="grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-white/5 text-white transition-all hover:border-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${dir === 'prev' ? 'rotate-180' : ''}`} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  )
}
