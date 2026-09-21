// src/components/ReserveButton.tsx

'use client'

import { useState } from 'react'
import ReservationModal from './ReservationModal'

interface ReserveButtonProps {
  productId: number
  productTitle: string
  isReservable: boolean
  status: string
  discountedPrice?: number
  discountCode?: string
}

export default function ReserveButton({
  productId,
  productTitle,
  isReservable,
  status,
  discountedPrice,
  discountCode,
}: ReserveButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reserved, setReserved] = useState(false)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  if (!isReservable) return null

  if (status !== 'available' && !reserved) {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-500 rounded-xl py-3 text-sm font-semibold cursor-not-allowed"
      >
        {status === 'reserved' ? 'Already Reserved' : 'Sold'}
      </button>
    )
  }

  if (reserved) {
    return (
      <div className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl py-3 px-4 text-sm font-semibold text-center">
        <div>Reserved successfully. We will contact you soon through WhatsApp.</div>
        {finalPrice !== null && (
          <div className="mt-1 text-xs font-bold">
            Final Price: {finalPrice.toLocaleString()} EGP
            {appliedCode ? ` (${appliedCode})` : ''}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition"
      >
        Reserve Now
      </button>

      {showModal && (
        <ReservationModal
          productId={productId}
          productTitle={productTitle}
          discountedPrice={discountedPrice}
          discountCode={discountCode}
          onClose={() => setShowModal(false)}
          onSuccess={(result) => {
            setShowModal(false)
            setReserved(true)
            setFinalPrice(result?.final_price_egp ?? null)
            setAppliedCode(result?.applied_discount_code ?? null)
          }}
        />
      )}
    </>
  )
}