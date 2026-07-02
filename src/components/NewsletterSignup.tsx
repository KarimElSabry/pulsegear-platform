// src/components/NewsletterSignup.tsx

'use client'
import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setEmail('')
        setName('')
      } else {
        setErrorMsg(data.error || 'Something went wrong')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error, please try again')
      setStatus('error')
    }
  }

  return (
    <div className="bg-black text-white p-8 rounded-2xl text-center max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-2">📧 Stay in the Loop!</h3>
      <p className="text-gray-400 text-sm mb-6">
        Get weekly updates on new arrivals & sold items.
      </p>

      {status === 'success' ? (
        <div className="bg-green-600 text-white p-4 rounded-xl font-semibold">
          ✅ You're subscribed! See you next Monday 🎉
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white
                       border border-gray-600 focus:outline-none
                       focus:border-white"
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-lg bg-gray-800 text-white
                       border border-gray-600 focus:outline-none
                       focus:border-white"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-white text-black font-bold py-3 rounded-lg
                       hover:bg-gray-200 transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe ⚡'}
          </button>
          {status === 'error' && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}
        </form>
      )}
    </div>
  )
}