// src/components/ProductRequestForm.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function ProductRequestForm() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    governorate: '',
    city: '',
    street: '',
    product: '',
    budget: '',
    notes: '',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [authLoading, setAuthLoading] = useState(true)
  const [emailLocked, setEmailLocked] = useState(false)

  useEffect(() => {
    let mounted = true

    async function prefillFromAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (!user) {
        setAuthLoading(false)
        return
      }

      const email = user.email ?? ''

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!mounted) return

      const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()

      setFormData((prev) => ({
        ...prev,
        name: prev.name || fullName || '',
        email: email || prev.email,
        phone: prev.phone || profile?.phone || '',
      }))

      if (email) {
        setEmailLocked(true)
      }

      setAuthLoading(false)
    }

    prefillFromAuth()

    return () => {
      mounted = false
    }
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok && data.status === 'success') {
        setStatus('success')
        setFormData((prev) => ({
          ...prev,
          governorate: '',
          city: '',
          street: '',
          product: '',
          budget: '',
          notes: '',
        }))
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-400 p-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-black text-white uppercase">Product Request Form</h2>

      {authLoading ? (
        <div className="text-sm text-zinc-500">Loading your saved details...</div>
      ) : null}

      <input
        required
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        className={inputClass}
      />

      <input
        required
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        disabled={emailLocked}
        className={`${inputClass} ${emailLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
      />

      <input
        required
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className={inputClass}
      />

      <input
        required
        name="governorate"
        placeholder="Governorate"
        value={formData.governorate}
        onChange={handleChange}
        className={inputClass}
      />

      <input
        required
        name="city"
        placeholder="City"
        value={formData.city}
        onChange={handleChange}
        className={inputClass}
      />

      <input
        required
        name="street"
        placeholder="Street Address"
        value={formData.street}
        onChange={handleChange}
        className={inputClass}
      />

      <input
        required
        name="product"
        placeholder="Product Name"
        value={formData.product}
        onChange={handleChange}
        className={inputClass}
      />

      <input
        required
        name="budget"
        placeholder="Budget (EGP)"
        value={formData.budget}
        onChange={handleChange}
        className={inputClass}
      />

      <textarea
        name="notes"
        placeholder="Additional Notes (Optional)"
        value={formData.notes}
        onChange={handleChange}
        className={inputClass}
        rows={4}
      />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Request'}
      </button>

      {status === 'success' && (
        <p className="text-green-400 font-medium text-center">
          Request submitted successfully.
        </p>
      )}

      {status === 'error' && (
        <p className="text-red-400 font-medium text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}