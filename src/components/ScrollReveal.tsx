// src/components/ScrollReveal.tsx
// Fade-up on scroll. Progressive by design:
//  - Server HTML and no-JS visitors see the content normally (nothing is hidden).
//  - After hydration, blocks that are BELOW the fold are marked data-reveal="pending"
//    (hidden by CSS) and switch to "shown" when they scroll into view.
//  - Visitors who prefer reduced motion never get the pending state; the CSS in
//    globals.css also forces everything visible as a second safety net.
'use client'

import { useEffect, useRef } from 'react'

export default function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return // already in view

    el.dataset.reveal = 'pending'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = 'shown'
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -60px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  )
}
