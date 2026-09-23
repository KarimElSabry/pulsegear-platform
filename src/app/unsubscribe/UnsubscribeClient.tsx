// src/app/unsubscribe/UnsubscribeClient.tsx

'use client'

import { useEffect, useState } from 'react'

export default function UnsubscribeClient({ email }: { email: string }) {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function unsubscribe() {
      if (!email) {
        setError('Missing email address.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to unsubscribe')
        }

        setSuccess('You have been unsubscribed successfully.')
      } catch (err: any) {
        setError(err?.message || 'Failed to unsubscribe')
      } finally {
        setLoading(false)
      }
    }

    unsubscribe()
  }, [email])

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
      <div className="max-w-xl mx-auto">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-500">
            Newsletter
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase">
            Unsubscribe
          </h1>

          {loading && (
            <p className="mt-6 text-zinc-400">Processing your request...</p>
          )}

          {!loading && success && (
            <div className="mt-6 rounded-2xl border border-green-900 bg-green-950/40 px-4 py-4 text-green-400">
              {success}
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 px-4 py-4 text-red-400">
              {error}
            </div>
          )}

          {!loading && (
            <a
              href="/"
              className="mt-8 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              Back to Home
            </a>
          )}
        </div>
      </div>
    </main>
  )
}