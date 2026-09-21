// src/app/signup/page.tsx

'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function SignupPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/account`
        : undefined

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      setError(error.message || 'Signup failed')
      setLoading(false)
      return
    }

    setSuccess('Account created successfully. You can now log in.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">Join Pulse Gear</p>
          <h1 className="text-3xl font-black text-white mt-2">Create Account</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Save your wishlist and track your reservations and requests.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
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

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Repeat password"
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold">
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}