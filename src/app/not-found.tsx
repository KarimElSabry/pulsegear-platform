// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <span className="eyebrow">404</span>
      <h1 className="text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
        This page took a wrong turn
      </h1>
      <p className="max-w-md text-muted">
        The page you are looking for does not exist or has moved. Try the products page or head home.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/products" className="btn-primary">Browse products</Link>
        <Link href="/" className="btn-ghost">Back home</Link>
      </div>
    </section>
  )
}
