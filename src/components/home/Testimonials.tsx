// src/components/home/Testimonials.tsx
// Autoplaying carousel of real customer messages. Content lives in src/content/testimonials.ts.
// Arabic quotes render right-to-left with an English translation underneath.
'use client'

import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useReducedMotion } from 'framer-motion'
import { TESTIMONIALS } from '@/content/testimonials'

export default function Testimonials() {
  const reduce = useReducedMotion()

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    reduce ? [] : [Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap())
    const frame = requestAnimationFrame(onSelect)
    emblaApi.on('select', onSelect)
    return () => {
      cancelAnimationFrame(frame)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  if (TESTIMONIALS.length === 0) return null

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label="Customer reviews">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {TESTIMONIALS.map((t, i) => {
            const long = t.quote.length > 170
            return (
              <figure
                key={i}
                className="min-w-0 flex-[0_0_100%] px-2 md:flex-[0_0_70%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${TESTIMONIALS.length}`}
              >
                <div
                  className={`card flex h-full flex-col gap-5 p-7 transition-opacity duration-500 md:p-10 ${
                    i === index ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-brand-soft" fill="currentColor" aria-hidden="true">
                      <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6v-6H5.5a1.67 1.67 0 0 1 1.67-1.67V6Zm10 0A5.17 5.17 0 0 0 12 11.17V18h6v-6h-2.5a1.67 1.67 0 0 1 1.67-1.67V6Z" />
                    </svg>
                    {t.rating && (
                      <span className="text-brand-soft" aria-label={`${t.rating} out of 5 stars`} dir="ltr">
                        {'★'.repeat(t.rating)}
                        <span className="text-surface-3">{'★'.repeat(5 - t.rating)}</span>
                      </span>
                    )}
                  </div>

                  <blockquote
                    lang={t.lang}
                    dir={t.lang === 'ar' ? 'rtl' : 'ltr'}
                    className={`font-medium leading-relaxed text-white ${
                      long ? 'text-base md:text-lg' : 'text-lg md:text-2xl'
                    }`}
                  >
                    {t.quote}
                  </blockquote>

                  {t.translation && (
                    <p lang="en" dir="ltr" className="border-t border-line pt-4 text-sm leading-relaxed text-muted">
                      {t.translation}
                    </p>
                  )}

                  <figcaption className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" dir="ltr">
                    <span className="font-bold text-white">{t.name.trim() || 'Verified customer'}</span>
                    <span className="text-muted">·</span>
                    <span className="text-muted">{t.product}</span>
                    <span className="text-muted">·</span>
                    <span className="text-muted">via {t.source}</span>
                  </figcaption>
                </div>
              </figure>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to review ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-brand-soft' : 'w-2 bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
