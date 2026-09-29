// src/components/home/BrandMarquee.tsx
// Infinite horizontal marquee of brand names (CSS only, pauses on hover,
// static under prefers-reduced-motion). Pass brand names from the DB.

import Link from 'next/link'

export default function BrandMarquee({ brands }: { brands: string[] }) {
  const list = brands.length >= 6 ? brands : [...brands, 'Garmin', 'Polar', 'Wahoo', 'Coros', 'Suunto', 'Magene'].slice(0, 8)
  const loop = [...list, ...list]

  return (
    <section aria-label="Brands we carry" className="overflow-hidden border-b border-line bg-surface-0 py-6">
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface-0 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface-0 to-transparent" />
        <ul className="flex w-max items-center gap-14 whitespace-nowrap px-7 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((brand, i) => (
            <li key={`${brand}-${i}`} aria-hidden={i >= list.length}>
              <Link
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="text-2xl font-black uppercase tracking-tight text-white/30 transition-colors hover:text-white md:text-3xl"
                tabIndex={i >= list.length ? -1 : 0}
              >
                {brand}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
