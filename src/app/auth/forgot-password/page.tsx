// src/app/auth/forgot-password/page.tsx

'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    )

    if (error) {
      setError(error.message || 'Failed to send reset email')
      setLoading(false)
      return
    }

    setSuccess('Password reset email sent. Please check your inbox.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Password recovery
          </p>
          <h1 className="text-3xl font-black text-white mt-2">Forgot Password</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-400 bg-green-950/40 border border-green-900 rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-zinc-500">
          Back to{' '}
          <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-semibold">
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}