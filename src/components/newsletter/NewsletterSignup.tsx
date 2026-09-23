// src/components/newsletter/NewsletterSignup.tsx

'use client'

import { useState } from 'react'

export default function NewsletterSignup({
  source,
  compact = false,
}: {
  source: 'homepage' | 'footer' | 'deals'
  compact?: boolean
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Subscription failed')
      }

      setSuccess('You are now subscribed to Pulse Gear updates.')
      setEmail('')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4">
          <h3 className="text-lg font-black uppercase text-white">Stay in the loop</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Get notified about hot deals, rare finds, and restocks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-3 rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-400">
            {success}
          </p>
        )}
      </div>
    )
  }

  return (
    <section className="w-full border-t border-zinc-800 bg-zinc-950 px-6 py-20">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900 px-8 py-10 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="text-sm font-bold uppercase tracking-widest text-red-500">
            Newsletter
          </span>
          <h2 className="mt-3 text-3xl font-black uppercase text-white md:text-4xl">
            Get the next drop before everyone else
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
            Subscribe for hot deals, rare finds, restocks, and curated performance gear picks.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 md:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 rounded-full border border-zinc-700 bg-zinc-800 px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {error && (
          <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-400">
            {success}
          </p>
        )}
      </div>
    </section>
  )
}