// src/components/blog/Callout.tsx
import type { ReactNode } from 'react'

type Tone = 'tip' | 'warning' | 'fact' | 'egypt' | 'danger'

const TONES: Record<Tone, { ring: string; badge: string; label: string; icon: ReactNode }> = {
  tip: {
    ring: 'border-brand/40 bg-brand/5',
    badge: 'text-brand-soft',
    label: 'Tip',
    icon: <path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3ZM9.5 18h5M10.5 21h3" />,
  },
  warning: {
    ring: 'border-accent/40 bg-accent/5',
    badge: 'text-accent-soft',
    label: 'Watch out',
    icon: <path d="M12 4 2.5 20h19L12 4Zm0 6v4m0 3h.01" />,
  },
  fact: {
    ring: 'border-line-strong bg-surface-2',
    badge: 'text-muted-strong',
    label: 'Fact',
    icon: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5h.01M11 11h1v5h1" />,
  },
  egypt: {
    ring: 'border-emerald-500/40 bg-emerald-500/5',
    badge: 'text-emerald-400',
    label: 'In Egypt',
    icon: <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3v18" />,
  },
  danger: {
    ring: 'border-red-500/50 bg-red-500/5',
    badge: 'text-red-400',
    label: 'Common mistake',
    icon: <path d="M6 6l12 12M18 6 6 18" />,
  },
}

export default function Callout({
  tone = 'tip',
  title,
  children,
}: {
  tone?: Tone
  title?: string
  children: ReactNode
}) {
  const t = TONES[tone]
  return (
    <aside className={`flex items-start gap-4 rounded-2xl border p-5 ${t.ring}`} dir="auto">
      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-0/60 ${t.badge}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          {t.icon}
        </svg>
      </span>
      <div className="min-w-0 space-y-1">
        <p className={`text-xs font-black uppercase tracking-wide ${t.badge}`} dir="auto">
          {title ?? t.label}
        </p>
        <div className="text-sm leading-relaxed text-muted-strong" dir="auto">{children}</div>
      </div>
    </aside>
  )
}
