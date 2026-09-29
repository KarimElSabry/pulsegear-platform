// src/components/home/CategoryTiles.tsx
// Bento grid of shoppable categories with imagery. Swap the images for
// real product photography when available (keep them ≤ 1600px WebP).

import Image from 'next/image'
import Link from 'next/link'
import { ArrowIcon } from './SectionHeading'

const TILES = [
  {
    title: 'GPS Watches',
    sub: 'Garmin, Polar, Coros, Suunto',
    href: '/products?category=Fitness%20Watches',
    img: '/hero/hero-1.webp',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    title: 'Heart Rate Straps',
    sub: 'Chest straps & armbands',
    href: '/products?category=Heart%20Rate%20Straps',
    img: '/hero/hero-4.webp',
    span: '',
  },
  {
    title: 'Replacement Straps',
    sub: 'Bands for every watch',
    href: '/products?category=Replacement%20Straps',
    img: '/hero/hero-3.webp',
    span: '',
  },
  {
    title: 'Running Accessories',
    sub: 'Belts, lights, bottles',
    href: '/products?category=Running%20Accessories',
    img: '/hero/hero-5.webp',
    span: 'md:col-span-2',
  },
]

export default function CategoryTiles() {
  return (
    <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[240px]">
      {TILES.map((t, i) => (
        <Link
          key={t.title}
          href={t.href}
          className={`group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface-2 ${t.span}`}
        >
          <Image
            src={t.img}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={i === 0}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
            <div>
              <h3 className="text-xl font-black uppercase leading-none text-white md:text-2xl">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-strong">{t.sub}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-white/5 text-white backdrop-blur transition-all group-hover:bg-brand group-hover:border-brand">
              <ArrowIcon />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
