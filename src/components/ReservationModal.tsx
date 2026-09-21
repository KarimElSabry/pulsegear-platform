// src/components/ReservationModal.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface ReservationModalProps {
  productId: number
  productTitle: string
  discountedPrice?: number
  discountCode?: string
  onClose: () => void
  onSuccess: (result?: { final_price_egp?: number; applied_discount_code?: string | null }) => void
}

export default function ReservationModal({
  productId,
  productTitle,
  discountedPrice,
  discountCode,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [prefillLoading, setPrefillLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function prefillFromAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted) return

        if (!user) {
          setPrefillLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!mounted) return

        const fullName = [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(' ')
          .trim()

        if (fullName) {
          setName(fullName)
        }

        if (profile?.phone) {
          setPhone(profile.phone)
        }
      } catch (err) {
        console.error('Failed to prefill reservation form:', err)
      } finally {
        if (mounted) {
          setPrefillLoading(false)
        }
      }
    }

    prefillFromAuth()

    return () => {
      mounted = false
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/products/${productId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          note,
          discount_code: discountCode ?? null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      onSuccess({
        final_price_egp: data.final_price_egp,
        applied_discount_code: data.applied_discount_code,
      })
    } catch {
      setError('Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Reserve Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          You are reserving:{' '}
          <span className="font-semibold text-gray-700">{productTitle}</span>
        </p>

        {discountedPrice && discountCode && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
            <span className="text-green-500 text-sm">🏷️</span>
            <div>
              <p className="text-xs text-green-600 font-semibold">
                Discount code <span className="uppercase font-black">{discountCode}</span> will be
                validated on the server
              </p>
              <p className="text-xs text-green-700 font-black">
                Estimated Price: {discountedPrice.toLocaleString()} EGP
              </p>
            </div>
          </div>
        )}

        {prefillLoading && (
          <div className="mb-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            Loading your saved details...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Reserving...' : 'Confirm Reserve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}