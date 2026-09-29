// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <span className="eyebrow">Something went wrong</span>
      <h1 className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
        We hit a snag
      </h1>
      <p className="max-w-md text-muted">
        The page failed to load. You can try again, or come back in a minute.
        {error.digest && <span className="mt-2 block font-mono text-xs text-muted">Ref: {error.digest}</span>}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-ghost">Back home</Link>
      </div>
    </section>
  )
}
