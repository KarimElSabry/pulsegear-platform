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
        // ✅ Handle Supabase returning product as Array or Object
        const product = Array.isArray(r.product) ? r.product[0] : r.product

        return (
          <div
            key={r.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3"
          >
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

            <p className="text-zinc-400 text-sm">📱 {r.phone}</p>
            {r.note && <p className="text-zinc-500 text-sm">📝 {r.note}</p>}
            <p className="text-zinc-500 text-sm">
              🛍️ Product:{' '}
              <span className="text-white font-semibold">
                {product?.title ?? 'N/A'}
              </span>
            </p>

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