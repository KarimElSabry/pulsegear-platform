// src/components/home/ValueProps.tsx
import type { ReactNode } from 'react'

const ITEMS: { title: string; desc: string; icon: ReactNode }[] = [
  {
    title: 'Globally sourced',
    desc: 'We buy from vetted sellers in Europe and the US, inspect every item, and list the real condition.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    title: 'Delivered to your door',
    desc: 'Cairo, Alexandria, Delta or Upper Egypt: reliable shipping, delivered to your door in 1–2 weeks.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'Advice from runners',
    desc: 'Not sure which watch or strap fits your training? Message us and get a straight answer, no upselling.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M4 5h16v11H8l-4 4z" /><path d="M8 9h8M8 12h5" />
      </svg>
    ),
  },
]

export default function ValueProps() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ITEMS.map((item) => (
        <div key={item.title} className="card group flex flex-col gap-5 p-7 transition-colors hover:border-brand/60">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-surface-3 text-brand-soft transition-colors group-hover:bg-brand group-hover:text-white">
            {item.icon}
          </span>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">{item.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{item.desc}</p>
        </div>
      ))}
    </div>
  )
}
