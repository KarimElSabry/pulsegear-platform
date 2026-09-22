// src/components/account/ProfileForm.tsx

'use client'

import { useState } from 'react'

type ProfileFormProps = {
  userEmail: string
  initialProfile: {
    first_name: string
    last_name: string
    phone: string
    newsletter_subscribed: boolean
    current_sport: string
    next_event: string
    current_pr: string
    target_pr: string
    current_watch: string
    current_heart_rate_strap: string
    planned_watch: string
    planned_heart_rate_strap: string
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

  const [currentSport, setCurrentSport] = useState(initialProfile.current_sport)
  const [nextEvent, setNextEvent] = useState(initialProfile.next_event)
  const [currentPr, setCurrentPr] = useState(initialProfile.current_pr)
  const [targetPr, setTargetPr] = useState(initialProfile.target_pr)

  const [currentWatch, setCurrentWatch] = useState(initialProfile.current_watch)
  const [currentHeartRateStrap, setCurrentHeartRateStrap] = useState(
    initialProfile.current_heart_rate_strap
  )
  const [plannedWatch, setPlannedWatch] = useState(initialProfile.planned_watch)
  const [plannedHeartRateStrap, setPlannedHeartRateStrap] = useState(
    initialProfile.planned_heart_rate_strap
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
          current_sport: currentSport,
          next_event: nextEvent,
          current_pr: currentPr,
          target_pr: targetPr,
          current_watch: currentWatch,
          current_heart_rate_strap: currentHeartRateStrap,
          planned_watch: plannedWatch,
          planned_heart_rate_strap: plannedHeartRateStrap,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update profile')
        setLoading(false)
        return
      }

      if (data.partial_success) {
        setError('Profile saved, but newsletter sync failed.')
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

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">Personal Info</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Basic details for your account and order communication.
            </p>
          </div>

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
                className={inputClass}
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
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
              className={inputClass}
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
                  Receive weekly product updates, offers, and new arrivals by email.
                </p>
              </div>
            </label>
          </div>
        </section>

        <section className="space-y-5 border-t border-zinc-800 pt-8">
          <div>
            <h2 className="text-xl font-bold text-white">Sports Profile</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Optional details that help us recommend more relevant products and content.
            </p>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Current Sport</label>
            <input
              type="text"
              value={currentSport}
              onChange={(e) => setCurrentSport(e.target.value)}
              className={inputClass}
              placeholder="Running, triathlon, cycling, gym, Hyrox..."
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Next Event</label>
            <input
              type="text"
              value={nextEvent}
              onChange={(e) => setNextEvent(e.target.value)}
              className={inputClass}
              placeholder="Cairo Half Marathon, local race, triathlon event..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Current Personal Record</label>
              <input
                type="text"
                value={currentPr}
                onChange={(e) => setCurrentPr(e.target.value)}
                className={inputClass}
                placeholder="Example: 10K in 52:30"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Target Record</label>
              <input
                type="text"
                value={targetPr}
                onChange={(e) => setTargetPr(e.target.value)}
                className={inputClass}
                placeholder="Example: Sub-50 10K"
              />
            </div>
          </div>
        </section>

        <section className="space-y-5 border-t border-zinc-800 pt-8">
          <div>
            <h2 className="text-xl font-bold text-white">Gear Profile</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Tell us what you already use and what you plan to get next.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Current Watch</label>
              <input
                type="text"
                value={currentWatch}
                onChange={(e) => setCurrentWatch(e.target.value)}
                className={inputClass}
                placeholder="Example: Garmin Forerunner 255"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Current Heart Rate Strap</label>
              <input
                type="text"
                value={currentHeartRateStrap}
                onChange={(e) => setCurrentHeartRateStrap(e.target.value)}
                className={inputClass}
                placeholder="Example: Polar H10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Planned Watch</label>
              <input
                type="text"
                value={plannedWatch}
                onChange={(e) => setPlannedWatch(e.target.value)}
                className={inputClass}
                placeholder="Example: Garmin Epix Pro"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Planned Heart Rate Strap</label>
              <input
                type="text"
                value={plannedHeartRateStrap}
                onChange={(e) => setPlannedHeartRateStrap(e.target.value)}
                className={inputClass}
                placeholder="Example: Garmin HRM-Pro Plus"
              />
            </div>
          </div>
        </section>

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
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}