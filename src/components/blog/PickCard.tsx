// src/components/blog/PickCard.tsx
// Product recommendation card for "best of" guides and reviews.
import Link from 'next/link'

export default function PickCard({
  rank,
  name,
  badge,
  priceBand,
  bestFor,
  summary,
  pros,
  cons,
  href,
}: {
  rank?: number
  name: string
  badge?: string
  priceBand?: string
  bestFor?: string
  summary: string
  pros?: string[]
  cons?: string[]
  href?: string
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-surface-1/60 px-6 py-4">
        <div className="flex items-center gap-3">
          {typeof rank === 'number' && (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-black text-white">{rank}</span>
          )}
          <div>
            <h3 className="text-lg font-black text-white" dir="ltr">{name}</h3>
            {bestFor && <p className="text-xs text-muted" dir="auto">Best for: {bestFor}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badge && <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-soft" dir="auto">{badge}</span>}
          {priceBand && <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-bold text-muted-strong" dir="ltr">{priceBand}</span>}
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm leading-relaxed text-muted-strong" dir="auto">{summary}</p>
        {(pros?.length || cons?.length) ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pros && pros.length > 0 && (
              <ul className="space-y-1 text-sm text-muted-strong">
                {pros.map((p) => <li key={p} className="flex gap-2" dir="auto"><span className="text-emerald-400">+</span>{p}</li>)}
              </ul>
            )}
            {cons && cons.length > 0 && (
              <ul className="space-y-1 text-sm text-muted-strong">
                {cons.map((c) => <li key={c} className="flex gap-2" dir="auto"><span className="text-red-400">−</span>{c}</li>)}
              </ul>
            )}
          </div>
        ) : null}
        {href && (
          <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-soft hover:text-white">
            See it in the shop
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        )}
      </div>
    </div>
  )
}
