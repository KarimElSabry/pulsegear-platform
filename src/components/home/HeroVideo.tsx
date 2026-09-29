// src/components/home/HeroVideo.tsx
// Full-bleed hero with background video clips (see src/content/hero-videos.ts).
// The poster image (/public/hero/poster.webp) is the LCP element and stays visible until a clip
// is ready, when the clip list is empty, and for reduced-motion or data-saver visitors.

import Image from 'next/image'
import Link from 'next/link'
import { ArrowIcon } from './SectionHeading'
import HeroVideoPlayer from './HeroVideoPlayer'
import { HERO_CLIPS } from '@/content/hero-videos'

const TRUST = [
  { label: '100% authentic', sub: 'Sourced from trusted sellers' },
  { label: 'We source it for you', sub: 'Send a model or your budget, we find\u00a0it' },
  { label: 'Delivered in Egypt', sub: 'To your door, 1–2 weeks' },
]

export default function HeroVideo() {
  return (
    <section
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-surface-0"
      aria-labelledby="hero-title"
    >
      {/* Poster is the LCP element: always rendered, preloaded. */}
      <Image
        src="/hero/poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Background clips: random order, crossfaded. Edit src/content/hero-videos.ts to add videos. */}
      <HeroVideoPlayer clips={HERO_CLIPS} />

      {/* Scrims: keep text readable on any frame of the video */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/70 to-surface-0/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-0/80 via-surface-0/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface-0 to-transparent" />

      <div className="container-x relative z-10 pb-20 pt-40 md:pb-28">
        <div className="max-w-3xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-strong backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-soft animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-soft" />
            </span>
            Egypt&apos;s running gear platform
          </span>

          <h1
            id="hero-title"
            className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Train smarter.
            <br />
            <span className="text-brand-soft">Perform better.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-strong md:text-lg">
            Premium running watches, heart rate monitors and accessories, sourced globally,
            priced fairly and hand-delivered to your door anywhere in Egypt.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Browse products
              <ArrowIcon />
            </Link>
            <Link href="/request-product" className="btn-ghost">
              Request a product
            </Link>
          </div>
        </div>

        {/* Trust row */}
        <dl className="mt-14 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line backdrop-blur sm:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.label} className="bg-surface-0/70 px-5 py-4">
              <dt className="text-sm font-bold uppercase tracking-wide text-white">{t.label}</dt>
              <dd className="mt-1 text-xs text-muted sm:whitespace-nowrap">{t.sub}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-6 right-6 hidden items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted md:flex">
        Scroll
        <span className="h-10 w-px bg-gradient-to-b from-muted to-transparent" />
      </div>
    </section>
  )
}
