// src/components/home/HeroSlides.tsx
// Light hero slideshow for phones. The poster (rendered by HeroVideo) is picture #1 underneath;
// these pictures fade in over it one by one. They mount only after the page has loaded, so they
// never compete with the poster (LCP). Next.js serves them resized and as WebP.
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const HOLD_MS = 5000

export default function HeroSlides({ slides }: { slides: string[] }) {
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(0) // 0 = poster, 1..n = slides[active - 1]

  useEffect(() => {
    if (slides.length === 0) return
    let timer = 0
    const start = () => {
      setReady(true)
      timer = window.setInterval(() => {
        if (document.visibilityState === 'visible') setActive((a) => (a + 1) % (slides.length + 1))
      }, HOLD_MS)
    }
    const wait = window.setTimeout(start, 1500)
    return () => {
      window.clearTimeout(wait)
      window.clearInterval(timer)
    }
  }, [slides])

  if (!ready) return null
  return (
    <>
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          quality={70}
          loading="lazy"
          aria-hidden="true"
          className={`object-cover object-center transition-opacity duration-[1200ms] ${
            active === i + 1 ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </>
  )
}
