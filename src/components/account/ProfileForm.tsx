// src/components/account/ProfileForm.tsx

'use client'

import { useMemo, useState } from 'react'

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

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-xl">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
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

  const completionCount = useMemo(() => {
    const values = [
      firstName,
      lastName,
      phone,
      currentSport,
      nextEvent,
      currentPr,
      targetPr,
      currentWatch,
      currentHeartRateStrap,
      plannedWatch,
      plannedHeartRateStrap,
    ]
    return values.filter((v) => v.trim().length > 0).length + (newsletterSubscribed ? 1 : 0)
  }, [
    firstName,
    lastName,
    phone,
    currentSport,
    nextEvent,
    currentPr,
    targetPr,
    currentWatch,
    currentHeartRateStrap,
    plannedWatch,
    plannedHeartRateStrap,
    newsletterSubscribed,
  ])

  const inputClass =
    'w-full rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-red-500 focus:bg-zinc-900'

  const labelClass = 'mb-2 block text-sm font-medium text-zinc-300'

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
        return
      }

      if (data.partial_success) {
        setError('Settings saved, but newsletter sync failed.')
        return
      }

      setSuccess('Settings updated successfully.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-zinc-900 to-zinc-900 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
              Athlete Settings
            </p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Build your performance profile
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Tell us about your sport, your current gear, and what you want to achieve next.
              We use this to personalize recommendations, content, and future offers.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Profile completion</p>
            <p className="mt-1 text-2xl font-black text-white">{completionCount}/12</p>
          </div>
        </div>
      </div>

      <SectionCard
        icon="👤"
        title="Personal Info"
        subtitle="Basic account details and communication preferences."
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-400"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Your login email is managed through authentication settings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="First name"
              />
            </div>

            <div>
              <label className={labelClass}>Last Name</label>
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
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="Phone number"
            />
          </div>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={newsletterSubscribed}
                onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-white">Subscribe to newsletter</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Receive weekly product drops, offers, and relevant updates based on your gear
                  interests.
                </p>
              </div>
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon="🏃"
        title="Sports Profile"
        subtitle="Your discipline, goals, and the event you are preparing for."
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Current Sport</label>
            <input
              type="text"
              value={currentSport}
              onChange={(e) => setCurrentSport(e.target.value)}
              className={inputClass}
              placeholder="Running, triathlon, cycling, gym, Hyrox..."
            />
          </div>

          <div>
            <label className={labelClass}>Next Event</label>
            <input
              type="text"
              value={nextEvent}
              onChange={(e) => setNextEvent(e.target.value)}
              className={inputClass}
              placeholder="Cairo Half Marathon, local race, triathlon..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Current Personal Record</label>
              <input
                type="text"
                value={currentPr}
                onChange={(e) => setCurrentPr(e.target.value)}
                className={inputClass}
                placeholder="Example: 10K in 52:30"
              />
            </div>

            <div>
              <label className={labelClass}>Target Record</label>
              <input
                type="text"
                value={targetPr}
                onChange={(e) => setTargetPr(e.target.value)}
                className={inputClass}
                placeholder="Example: Sub-50 10K"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon="⌚"
        title="Gear Profile"
        subtitle="What you use now and what you plan to upgrade next."
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Current Watch</label>
              <input
                type="text"
                value={currentWatch}
                onChange={(e) => setCurrentWatch(e.target.value)}
                className={inputClass}
                placeholder="Garmin Forerunner 255"
              />
            </div>

            <div>
              <label className={labelClass}>Current Heart Rate Strap</label>
              <input
                type="text"
                value={currentHeartRateStrap}
                onChange={(e) => setCurrentHeartRateStrap(e.target.value)}
                className={inputClass}
                placeholder="Polar H10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Planned Watch</label>
              <input
                type="text"
                value={plannedWatch}
                onChange={(e) => setPlannedWatch(e.target.value)}
                className={inputClass}
                placeholder="Garmin Epix Pro"
              />
            </div>

            <div>
              <label className={labelClass}>Planned Heart Rate Strap</label>
              <input
                type="text"
                value={plannedHeartRateStrap}
                onChange={(e) => setPlannedHeartRateStrap(e.target.value)}
                className={inputClass}
                placeholder="Garmin HRM-Pro Plus"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {error && (
        <div className="rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="sticky bottom-4 z-10">
        <div className="rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-md">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-red-600 py-3 text-base font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Saving settings...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
  )
}