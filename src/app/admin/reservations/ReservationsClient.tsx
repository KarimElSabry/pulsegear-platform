// src/app/admin/reservations/ReservationsClient.tsx

'use client'

import { useState } from 'react'
import { Reservation } from '@/types/reservation'

export default function ReservationsClient({
  reservations: initial,
}: {
  reservations: Reservation[]
}) {
  const [reservations, setReservations] = useState(initial)

  const updateStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    await fetch(`/api//products/reservations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((r) => {
        const product = Array.isArray(r.product) ? r.product[0] : r.product

        return (
          <div
            key={r.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3"
          >
            {/* Header — Name + Status */}
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{r.name}</h2>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  r.status === 'confirmed'
                    ? 'bg-green-600 text-white'
                    : r.status === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-yellow-500 text-black'
                }`}
              >
                {r.status}
              </span>
            </div>

            {/* Phone */}
            <p className="text-zinc-400 text-sm">📱 {r.phone}</p>

            {/* Note */}
            {r.note && <p className="text-zinc-500 text-sm">📝 {r.note}</p>}

            {/* Product */}
            <p className="text-zinc-500 text-sm">
              🛍️ Product:{' '}
              <span className="text-white font-semibold">
                {product?.title ?? 'N/A'}
              </span>
            </p>

            {/* ✅ Discount Code & Price — لو موجودين */}
            {r.discount_code && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
                <span className="text-green-400 text-sm">🏷️</span>
                <div className="flex flex-col">
                  <p className="text-green-400 text-xs font-bold uppercase">
                    Discount Code:{' '}
                    <span className="text-green-300">{r.discount_code}</span>
                  </p>
                  {r.discounted_price && (
                    <p className="text-green-300 text-xs font-black">
                      💰 Final Price: {r.discounted_price.toLocaleString()} EGP
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ✅ Confirm / Cancel Buttons */}
            {r.status === 'pending' && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => updateStatus(r.id, 'confirmed')}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl text-sm transition"
                >
                  ✅ Confirm
                </button>
                <button
                  onClick={() => updateStatus(r.id, 'cancelled')}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-sm transition"
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}