// src/components/blog/Section.tsx
// One article section: anchor id (for the TOC), heading with optional
// Arabic subtitle, and body. Also exports simple prose helpers.

export default function Section({
  id,
  title,
  titleAr,
  kicker,
  children,
}: {
  id: string
  title: string
  titleAr?: string
  kicker?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-6">
      <div className="space-y-2">
        {kicker && <span className="eyebrow">{kicker}</span>}
        <h2 className="text-2xl font-black uppercase leading-tight tracking-tight text-white md:text-3xl" dir="auto">
          {title}
        </h2>
        {titleAr && (
          <p className="text-lg font-bold text-brand-soft" dir="rtl">
            {titleAr}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

export function P({ children, muted = true }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`leading-relaxed ${muted ? 'text-muted-strong' : 'text-white'}`} dir="auto">
      {children}
    </p>
  )
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <span className="font-bold text-white">{children}</span>
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-muted-strong" dir="auto">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-soft" aria-hidden="true" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}
