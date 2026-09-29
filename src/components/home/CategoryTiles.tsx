// src/components/home/CategoryTiles.tsx
// Shop-by-category grid built from the LIVE catalogue: only categories that have available
// products are shown, each with a real photo of its newest item and a live count.
// The data comes from getCategoryTiles() (called in app/page.tsx).

import Link from 'next/link'
import { ArrowIcon } from './SectionHeading'
import TileImage from './TileImage'

export type CategoryTile = {
  key: string
  label: string
  sub: string
  filter: string // value understood by /products?category=
  count: number
  images: string[] // up to 8 photos from different products; one is picked per visitor session
}

// The database mixes "Fitness Watches" and "fitness_watches", so keys are normalised.
export const CATEGORY_META: Record<string, { label: string; sub: string; filter: string }> = {
  fitness_watches: { label: 'GPS Watches', sub: 'Garmin, Polar, Coros, Suunto', filter: 'Fitness Watches' },
  heart_rate_straps: { label: 'Heart Rate Straps', sub: 'Chest straps and armbands', filter: 'Heart Rate Straps' },
  replacement_straps: { label: 'Replacement Straps', sub: 'Bands for every watch', filter: 'Replacement Straps' },
  running_accessories: { label: 'Running Accessories', sub: 'Belts, lights, bottles', filter: 'Running Accessories' },
  cycling_accessories: { label: 'Cycling Accessories', sub: 'Sensors, mounts and more', filter: 'Cycling Accessories' },
}

export const normalizeCategory = (c: string | null | undefined) => (c ?? '').trim().toLowerCase().replace(/[\s_]+/g, '_')

type Row = {
  category: string | null
  images: { image_url: string; is_primary: boolean | null; display_order: number | null }[] | null
}

/** rows must be ordered newest first. Each tile gets photos from up to 8 different products. */
export function buildCategoryTiles(rows: Row[]): CategoryTile[] {
  const acc = new Map<string, CategoryTile>()
  for (const r of rows) {
    const key = normalizeCategory(r.category)
    const meta = CATEGORY_META[key]
    if (!meta) continue
    const imgs = r.images ?? []
    const primary = imgs.find((i) => i.is_primary) ?? [...imgs].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0]
    const cur = acc.get(key) ?? { key, ...meta, count: 0, images: [] as string[] }
    cur.count += 1
    if (primary?.image_url && cur.images.length < 8 && !cur.images.includes(primary.image_url)) cur.images.push(primary.image_url)
    acc.set(key, cur)
  }
  return [...acc.values()].sort((a, b) => b.count - a.count).slice(0, 4)
}

function span(n: number, i: number): string {
  if (n === 1) return 'md:col-span-4 md:row-span-2'
  if (n === 2) return 'md:col-span-2 md:row-span-2'
  if (i === 0) return 'md:col-span-2 md:row-span-2'
  if (n === 3) return 'md:col-span-2'
  return i === 3 ? 'md:col-span-2' : ''
}

export default function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  if (tiles.length === 0) return null
  return (
    <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[240px]">
      {tiles.map((t, i) => (
        <Link
          key={t.key}
          href={`/products?category=${encodeURIComponent(t.filter)}&availability=${encodeURIComponent('In Stock')}`}
          className={`group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface-2 ${span(tiles.length, i)}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-surface-2 to-surface-2" />
          <TileImage images={t.images} salt={t.key} />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
            <div>
              <h3 className="text-xl font-black uppercase leading-none text-white md:text-2xl">{t.label}</h3>
              <p className="mt-1 text-xs text-muted-strong">
                {t.sub} · {t.count} available
              </p>
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
