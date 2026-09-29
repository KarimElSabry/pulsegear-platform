// src/components/blog/StatCards.tsx
export default function StatCards({
  items,
  columns = 3,
}: {
  items: { value: string; label: string; sub?: string; tone?: 'brand' | 'accent' | 'green' | 'blue' | 'neutral' }[]
  columns?: 2 | 3 | 4
}) {
  const tone: Record<string, string> = {
    brand: 'text-brand-soft',
    accent: 'text-accent-soft',
    green: 'text-emerald-400',
    blue: 'text-sky-400',
    neutral: 'text-white',
  }
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }[columns]
  return (
    <div className={`grid grid-cols-1 gap-3 ${cols}`}>
      {items.map((it) => (
        <div key={it.label} className="card flex flex-col items-center gap-1 p-5 text-center">
          <span className={`text-3xl font-black tabular-nums md:text-4xl ${tone[it.tone ?? 'neutral']}`} dir="ltr">
            {it.value}
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-white" dir="auto">{it.label}</span>
          {it.sub && <span className="text-xs text-muted" dir="auto">{it.sub}</span>}
        </div>
      ))}
    </div>
  )
}
