// src/app/reset-password/page.tsx

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (!session) {
        setError('Reset session is invalid or expired. Please request a new reset link.')
      }

      setCheckingSession(false)
    }

    checkRecoverySession()

    return () => {
      mounted = false
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message || 'Failed to reset password')
      setLoading(false)
      return
    }

    setSuccess('Password updated successfully. Redirecting to your account...')
    setLoading(false)

    setTimeout(() => {
      window.location.href = '/account'
    }, 1200)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Secure your account
          </p>
          <h1 className="text-3xl font-black text-white mt-2">Reset Password</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Choose a new password for your account.
          </p>
        </div>

        {checkingSession ? (
          <div className="text-sm text-zinc-400 text-center">Checking reset session...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">New Password</label>
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
              <label className="block text-sm text-zinc-300 mb-2">Confirm New Password</label>
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
              disabled={loading || !!error}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

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