'use client'

import { useState } from 'react'
import ReservationModal from './ReservationModal'

interface ReserveButtonProps {
  productId: number
  productTitle: string
  status: string
  discountedPrice?: number   // ← جديد
  discountCode?: string      // ← جديد
}

export default function ReserveButton({
  productId,
  productTitle,
  status,
  discountedPrice,
  discountCode,
}: ReserveButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reserved, setReserved] = useState(false)

  if (status !== 'available' && !reserved) {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-500 rounded-xl py-3 text-sm font-semibold cursor-not-allowed"
      >
        {status === 'reserved' ? '🔒 Already Reserved' : '✅ Sold'}
      </button>
    )
  }

  if (reserved) {
    return (
      <div className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl py-3 text-sm font-semibold text-center">
        ✅ Reserved Successfully! We will contact you soon through WhatsApp.
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition"
      >
        🔖 Reserve Now
      </button>

      {showModal && (
        <ReservationModal
          productId={productId}
          productTitle={productTitle}
          discountedPrice={discountedPrice}  // ← جديد
          discountCode={discountCode}        // ← جديد
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setReserved(true)
          }}
        />
      )}
    </>
  )
}