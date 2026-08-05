// src/app/admin/leads/LeadCard.tsx

'use client'

import { useState } from 'react'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-500 text-white',
  pending: 'bg-yellow-500 text-black',
  contacted: 'bg-purple-500 text-white',
  converted: 'bg-green-600 text-white',
  lost: 'bg-red-600 text-white',
  confirmed: 'bg-green-600 text-white',
  cancelled: 'bg-red-600 text-white',
}

const LEAD_STATUSES = ['contacted', 'converted', 'lost']

interface LeadCardProps {
  lead: any
  onUpdate: (updates: Record<string, any>) => void  // ✅ Fix for 'updates' any type error
}

export default function LeadCard({ lead, onUpdate }: LeadCardProps) {
  const [loading, setLoading] = useState(false)
  const [noteMode, setNoteMode] = useState(false)
  const [note, setNote] = useState(lead.admin_note ?? '')

  const isReservation = lead._source === 'reservation'
  const product = Array.isArray(lead.product) ? lead.product[0] : lead.product
  const apiBase = isReservation
    ? `/api/reservations/${lead.id}/status`
    : `/api/product-requests/${lead.id}/status`

  const updateStatus = async (status: string) => {
    setLoading(true)
    await fetch(apiBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    onUpdate({ status })
    setLoading(false)
  }

  const saveNote = async () => {
    await fetch(apiBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_note: note }),
    })
    onUpdate({ admin_note: note })
    setNoteMode(false)
  }

  const whatsappUrl = `https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
    isReservation
      ? `Hi ${lead.name}! 👋 This is regarding your reservation for *${product?.title ?? 'the product'}*. We wanted to follow up with you.`
      : `Hi ${lead.name}! 👋 This is regarding your request for *${lead.requested_product ?? 'a product'}*. We wanted to follow up with you.`
  )}`

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
            {isReservation ? '🔖' : '📋'}
          </div>
          <div>
            <h3 className="text-white font-bold">{lead.name}</h3>
            <p className="text-zinc-500 text-xs">
              {isReservation ? 'Reservation' : 'Product Request'} ·{' '}
              {new Date(lead.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
            STATUS_STYLES[lead.status] ?? 'bg-zinc-700 text-white'
          }`}
        >
          {lead.status}
        </span>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
        >
          <span>💬</span> WhatsApp
        </a>

        <span className="flex items-center gap-1 text-zinc-400 text-xs bg-zinc-800 px-3 py-2 rounded-xl">
          📱 {lead.phone}
        </span>

        {lead.instagram && (
          <span className="flex items-center gap-1 text-zinc-400 text-xs bg-zinc-800 px-3 py-2 rounded-xl">
            📸 {lead.instagram}
          </span>
        )}
      </div>

      {/* Product / Request Info */}
      <div className="bg-zinc-800/50 rounded-xl px-4 py-3 space-y-1">
        {isReservation ? (
          <>
            <p className="text-zinc-400 text-xs">
              🛍️ Product:{' '}
              <span className="text-white font-semibold">
                {product?.title ?? 'N/A'}
              </span>
            </p>
            {lead.discount_code && (
              <p className="text-green-400 text-xs">
                🏷️ Code: <span className="font-bold">{lead.discount_code}</span>
                {lead.discounted_price && (
                  <span className="text-green-300">
                    {' '}· {lead.discounted_price.toLocaleString()} EGP
                  </span>
                )}
              </p>
            )}
            {lead.note && (
              <p className="text-zinc-500 text-xs">📝 {lead.note}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-zinc-400 text-xs">
              🔍 Looking for:{' '}
              <span className="text-white font-semibold">
                {lead.requested_product ?? 'N/A'}
              </span>
            </p>
            {lead.budget && (
              <p className="text-zinc-400 text-xs">
                💰 Budget:{' '}
                <span className="text-white">{lead.budget.toLocaleString()} EGP</span>
              </p>
            )}
            {lead.condition && (
              <p className="text-zinc-400 text-xs">
                ✨ Condition: <span className="text-white">{lead.condition}</span>
              </p>
            )}
            {lead.notes && (
              <p className="text-zinc-500 text-xs">📝 {lead.notes}</p>
            )}
          </>
        )}
      </div>

      {/* Status Actions */}
      <div className="flex flex-wrap gap-2">
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            disabled={loading || lead.status === s}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition disabled:opacity-40 ${
              lead.status === s
                ? STATUS_STYLES[s]
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {s === 'contacted' && '📞 '}
            {s === 'converted' && '✅ '}
            {s === 'lost' && '❌ '}
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Admin Note */}
      <div>
        {noteMode ? (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this lead..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={saveNote}
                className="text-xs bg-white text-black font-bold px-3 py-1.5 rounded-xl hover:bg-zinc-200 transition"
              >
                💾 Save
              </button>
              <button
                onClick={() => setNoteMode(false)}
                className="text-xs text-zinc-500 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setNoteMode(true)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition"
          >
            {lead.admin_note ? `📌 ${lead.admin_note}` : '+ Add note'}
          </button>
        )}
      </div>
    </div>
  )
}