// src/components/blog/ProductCta.tsx
import Link from 'next/link'

export default function ProductCta({ title, body, href = '/products', label = 'Browse products' }: { title: string; body: string; href?: string; label?: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/20 via-surface-2 to-surface-2 p-8 text-center">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
      <h3 className="relative text-xl font-black uppercase tracking-tight text-white md:text-2xl" dir="auto">{title}</h3>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-strong" dir="auto">{body}</p>
      <Link href={href} className="btn-primary relative mt-6">{label}</Link>
    </section>
  )
}
