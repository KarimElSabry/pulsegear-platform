// src/components/home/StatsStrip.tsx
// Server component: numbers are computed on the server (see page.tsx),
// so they are in the HTML for SEO and never show "..." to the visitor.

import AnimatedNumber from './AnimatedNumber'

export type Stats = { available: number; sold: number; brands: number }

export default function StatsStrip({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Available now', value: stats.available, suffix: '' },
    { label: 'Delivered to runners', value: stats.sold, suffix: '+' },
    { label: 'Brands', value: stats.brands, suffix: '' },
  ]
  return (
    <section className="border-y border-line bg-surface-1">
      <div className="container-x grid grid-cols-1 divide-y divide-line py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 py-8 text-center">
            <span className="text-4xl font-black text-white md:text-5xl">
              <AnimatedNumber value={item.value} suffix={item.suffix} />
            </span>
            <span className="text-xs uppercase tracking-[0.25em] text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
