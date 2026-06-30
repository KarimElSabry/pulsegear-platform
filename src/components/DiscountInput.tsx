'use client'

import { useState } from 'react'

interface Props {
  originalPrice: number
  onDiscountApplied: (discountedPrice: number, percent: number, code: string) => void
  onDiscountRemoved: () => void
}

export default function DiscountInput({
  originalPrice,
  onDiscountApplied,
  onDiscountRemoved,
}: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid code')
        return
      }

      const discounted = Math.round(
        originalPrice * (1 - data.discount_percent / 100)
      )

      setAppliedCode(data.code)
      onDiscountApplied(discounted, data.discount_percent, data.code)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setCode('')
    setError(null)
    setAppliedCode(null)
    onDiscountRemoved()
  }

  // ── Already applied ──
  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-lg">✅</span>
          <div>
            <p className="text-green-400 text-sm font-bold">
              Code <span className="uppercase">{appliedCode}</span> applied!
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-zinc-400 hover:text-white text-xs underline transition"
        >
          Remove
        </button>
      </div>
    )
  }

  // ── Input state ──
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Discount code (e.g. RUN10)"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition uppercase"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl text-sm transition"
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <span>❌</span> {error}
        </p>
      )}
    </div>
  )
}