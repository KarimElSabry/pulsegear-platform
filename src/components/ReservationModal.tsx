'use client'

import { useState } from 'react'
import { ProductCondition } from '@/types/product'

// ✅ Allowed conditions
const RESERVABLE_CONDITIONS: ProductCondition[] = [
  'New without tags',
  'Very good',
  'Good',
  'Satisfactory',
]

interface ReservationModalProps {
  productId: number
  productTitle: string
  productCondition?: ProductCondition  // ← optional
  discountedPrice?: number
  discountCode?: string
  onClose: () => void
  onSuccess: () => void
}

export default function ReservationModal({
  productId,
  productTitle,
  productCondition,
  discountedPrice,
  discountCode,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ Check if condition is allowed
  const isReservable = productCondition
    ? RESERVABLE_CONDITIONS.includes(productCondition)
    : false  // ← لو مفيش condition، مش هيتريزيرف

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
          discounted_price: discountedPrice ?? null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      onSuccess()
    } catch (err) {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Reserve Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Product Title */}
        <p className="text-sm text-gray-500 mb-2">
          You are reserving:{' '}
          <span className="font-semibold text-gray-700">{productTitle}</span>
        </p>

        {/* ✅ Condition Not Allowed Banner */}
        {!isReservable && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            <span className="text-red-500 text-sm">🚫</span>
            <div>
              <p className="text-xs text-red-600 font-semibold">
                Reservation Not Available
              </p>
              <p className="text-xs text-red-500">
                Products with condition{' '}
                <span className="font-black">
                  {productCondition ?? 'unknown'}
                </span>{' '}
                cannot be reserved.
              </p>
            </div>
          </div>
        )}

        {/* ✅ Discount Badge */}
        {discountedPrice && discountCode && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
            <span className="text-green-500 text-sm">🏷️</span>
            <div>
              <p className="text-xs text-green-600 font-semibold">
                Discount code{' '}
                <span className="uppercase font-black">{discountCode}</span>{' '}
                applied!
              </p>
              <p className="text-xs text-green-700 font-black">
                Final Price: {discountedPrice.toLocaleString()} EGP
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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
              disabled={!isReservable}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Phone */}
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
              disabled={!isReservable}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              disabled={!isReservable}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Buttons */}
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
              disabled={loading || !isReservable}
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