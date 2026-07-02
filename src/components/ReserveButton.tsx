'use client'

import { useState } from 'react'
import ReservationModal from './ReservationModal'

interface ReserveButtonProps {
  productId: number
  productTitle: string
  isReservable: boolean        // ✅ بدل productCondition
  status: string
  discountedPrice?: number
  discountCode?: string
}

export default function ReserveButton({
  productId,
  productTitle,
  isReservable,                // ✅ بدل productCondition
  status,
  discountedPrice,
  discountCode,
}: ReserveButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reserved, setReserved] = useState(false)

  // ✅ لو مش reservable — مش بيظهر الـ button خالص
  if (!isReservable) return null

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
          discountedPrice={discountedPrice}
          discountCode={discountCode}
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