// src/components/account/ProfileForm.tsx

'use client'

import { useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

type ProfileFormValues = {
  first_name: string
  last_name: string
  phone: string
  newsletter_subscribed: boolean
  current_sport: string
  next_event: string
  next_event_date: string
  current_pr: string
  target_pr: string
  current_watch: string
  current_heart_rate_strap: string
  planned_watch: string
  planned_heart_rate_strap: string
  training_style: string
  team_name: string
  experience_level: string
  primary_goal: string
  training_days_per_week: string
}

export default function ProfileForm({
  userEmail,
  initialProfile,
}: {
  userEmail: string
  initialProfile: ProfileFormValues
}) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [form, setForm] = useState<ProfileFormValues>(initialProfile)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'training_style' && value !== 'With team' ? { team_name: '' } : {}),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const payload = {
      ...form,
      team_name: form.training_style === 'With team' ? form.team_name : '',
      training_days_per_week: form.training_days_per_week
        ? Number(form.training_days_per_week)
        : null,
      next_event_date: form.next_event_date || null,
    }

    const { error } = await supabase.from('profiles').upsert(payload)

    if (error) {
      setError(error.message || 'Failed to save profile')
      setSaving(false)
      return
    }

    setMessage('Profile updated successfully.')
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-white text-xl font-bold mb-5">Personal Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Email</label>
            <input
              value={userEmail}
              disabled
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Last name"
            />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="newsletter_subscribed"
            checked={form.newsletter_subscribed}
            onChange={handleChange}
            className="accent-red-500"
          />
          Subscribe me to newsletter updates and special offers
        </label>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-white text-xl font-bold mb-5">Athlete Snapshot</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Current Sport</label>
            <input
              name="current_sport"
              value={form.current_sport}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Running, Cycling, Triathlon..."
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Training Style</label>
            <select
              name="training_style"
              value={form.training_style}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select training style</option>
              <option value="Solo">Solo</option>
              <option value="With team">With team</option>
              <option value="With coach">With coach</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {form.training_style === 'With team' && (
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Team Name</label>
              <input
                name="team_name"
                value={form.team_name}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                placeholder="Your team or club name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Experience Level</label>
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Competitive">Competitive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Primary Goal</label>
            <select
              name="primary_goal"
              value={form.primary_goal}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select primary goal</option>
              <option value="General fitness">General fitness</option>
              <option value="Weight loss">Weight loss</option>
              <option value="5K">5K</option>
              <option value="10K">10K</option>
              <option value="Half marathon">Half marathon</option>
              <option value="Marathon">Marathon</option>
              <option value="Triathlon">Triathlon</option>
              <option value="Cycling">Cycling</option>
              <option value="Improve performance">Improve performance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Training Days Per Week</label>
            <input
              name="training_days_per_week"
              type="number"
              min="0"
              max="14"
              value={form.training_days_per_week}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="e.g. 4"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Next Event</label>
            <input
              name="next_event"
              value={form.next_event}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Your next race or event"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Next Event Date</label>
            <input
              name="next_event_date"
              type="date"
              value={form.next_event_date}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Current PR</label>
            <input
              name="current_pr"
              value={form.current_pr}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="e.g. 10K - 48:30"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Target PR</label>
            <input
              name="target_pr"
              value={form.target_pr}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="e.g. Sub 45 10K"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-white text-xl font-bold mb-5">Gear Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Current Watch</label>
            <input
              name="current_watch"
              value={form.current_watch}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Your current watch"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Current Heart Rate Strap</label>
            <input
              name="current_heart_rate_strap"
              value={form.current_heart_rate_strap}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Your current HR strap"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Planned Watch</label>
            <input
              name="planned_watch"
              value={form.planned_watch}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="What watch are you considering?"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Planned Heart Rate Strap</label>
            <input
              name="planned_heart_rate_strap"
              value={form.planned_heart_rate_strap}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              placeholder="What HR strap are you considering?"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-400">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  )
}