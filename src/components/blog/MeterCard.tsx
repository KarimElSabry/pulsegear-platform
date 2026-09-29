// src/components/blog/MeterCard.tsx
// Card with a title, badge, description, meta chips and a proportional bar.
// Used for heart-rate zones, intensity scales, budget bands, etc.

type Tone = 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'brand' | 'neutral'

const TONES: Record<Tone, { ring: string; badge: string; bar: string }> = {
  green:   { ring: 'border-emerald-500/30 bg-emerald-500/5', badge: 'bg-emerald-400/10 text-emerald-400', bar: 'bg-emerald-500' },
  blue:    { ring: 'border-sky-500/30 bg-sky-500/5',         badge: 'bg-sky-400/10 text-sky-400',         bar: 'bg-sky-500' },
  yellow:  { ring: 'border-yellow-500/30 bg-yellow-500/5',   badge: 'bg-yellow-400/10 text-yellow-400',   bar: 'bg-yellow-500' },
  orange:  { ring: 'border-accent/30 bg-accent/5',           badge: 'bg-accent/10 text-accent-soft',      bar: 'bg-accent' },
  red:     { ring: 'border-red-500/30 bg-red-500/5',         badge: 'bg-red-400/10 text-red-400',         bar: 'bg-red-500' },
  brand:   { ring: 'border-brand/30 bg-brand/5',             badge: 'bg-brand/10 text-brand-soft',        bar: 'bg-brand' },
  neutral: { ring: 'border-line bg-surface-2',               badge: 'bg-surface-3 text-muted-strong',     bar: 'bg-muted' },
}

export default function MeterCard({
  title,
  badge,
  description,
  meta,
  percent,
  tone = 'neutral',
}: {
  title: string
  badge?: string
  description: string
  meta?: { label: string; value: string }[]
  percent?: number
  tone?: Tone
}) {
  const t = TONES[tone]
  return (
    <div className={`space-y-4 rounded-2xl border p-6 ${t.ring}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-black uppercase text-white" dir="ltr">{title}</h3>
        {badge && <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${t.badge}`} dir="ltr">{badge}</span>}
      </div>
      <p className="text-sm leading-relaxed text-muted-strong" dir="auto">{description}</p>
      {meta && meta.length > 0 && (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
          {meta.map((m) => (
            <div key={m.label} className="flex gap-1.5" dir="auto">
              <dt className="text-muted">{m.label}</dt>
              <dd className="text-white">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {typeof percent === 'number' && (
        <div className="h-1.5 w-full rounded-full bg-surface-3" dir="ltr">
          <div className={`h-1.5 rounded-full ${t.bar}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
        </div>
      )}
    </div>
  )
}
