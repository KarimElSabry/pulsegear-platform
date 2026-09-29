// src/components/home/SectionHeading.tsx
import Link from 'next/link'

export default function SectionHeading({
  eyebrow,
  title,
  sub,
  action,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  sub?: string
  action?: { label: string; href: string }
  align?: 'left' | 'center'
}) {
  const center = align === 'center'
  return (
    <div
      className={`mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${
        center ? 'items-center text-center md:flex-col md:items-center' : ''
      }`}
    >
      <div className={`flex flex-col gap-2 ${center ? 'items-center' : ''}`}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="text-3xl font-black uppercase leading-[1.05] tracking-tight text-white md:text-4xl">
          {title}
        </h2>
        {sub && <p className="max-w-xl text-sm leading-relaxed text-muted md:text-base">{sub}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-strong transition-colors hover:text-white"
        >
          {action.label}
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}

export function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
