// src/app/account/profile/ProfileForm.tsx

'use client'

import { useState } from 'react'

type ProfileFormProps = {
  userEmail: string
  initialProfile: {
    first_name: string
    last_name: string
    phone: string
    newsletter_subscribed: boolean
  }
}

export default function ProfileForm({
  userEmail,
  initialProfile,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialProfile.first_name)
  const [lastName, setLastName] = useState(initialProfile.last_name)
  const [phone, setPhone] = useState(initialProfile.phone)
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(
    initialProfile.newsletter_subscribed
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          newsletter_subscribed: newsletterSubscribed,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update profile')
        setLoading(false)
        return
      }

      setSuccess('Profile updated successfully.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Email</label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-400"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Your login email is managed by Supabase Auth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-300 mb-2">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
            placeholder="Phone number"
          />
        </div>

        <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl px-4 py-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newsletterSubscribed}
              onChange={(e) => setNewsletterSubscribed(e.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="text-white font-medium">Subscribe to newsletter</p>
              <p className="text-sm text-zinc-400 mt-1">
                Receive weekly product updates and new arrivals by email.
              </p>
            </div>
          </label>
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
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}