// src/app/admin/discounts/DiscountsClient.tsx

'use client'

import { useState } from 'react'

interface DiscountCode {
  id: number
  code: string
  discount_percent: number
  is_active: boolean
  created_at: string
}

interface Props {
  initialCodes: DiscountCode[]
}

export default function DiscountsClient({ initialCodes }: Props) {
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes)
  const [newCode, setNewCode] = useState('')
  const [newPercent, setNewPercent] = useState('')
  const [adding, setAdding] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── Add New Code ──────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          discount_percent: parseInt(newPercent),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setCodes((prev) => [data, ...prev])
      setNewCode('')
      setNewPercent('')
      setSuccess(`✅ Code "${data.code}" added successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Something went wrong, please try again')
    } finally {
      setAdding(false)
    }
  }

  // ── Toggle Active ─────────────────────────────────────
  const handleToggle = async (id: number, current: boolean) => {
    // ✅ Optimistic update — بيتحدث الـ UI فوراً
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    )
    setTogglingId(id)

    try {
      const res = await fetch('/api/discount-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('❌ Toggle failed:', data.error)
        // ✅ Rollback لو فشل
        setCodes((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: current } : c))
        )
        return
      }

      // ✅ Sync بالـ data الفعلية من الـ server
      setCodes((prev) => prev.map((c) => (c.id === id ? data : c)))
    } catch (err) {
      console.error('❌ Toggle error:', err)
      // Rollback
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: current } : c))
      )
    } finally {
      setTogglingId(null)
    }
  }

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete code "${code}"? This cannot be undone.`)) return

    setDeletingId(id)

    try {
      const res = await fetch('/api/discount-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('❌ Delete failed:', data.error)
        return
      }

      setCodes((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('❌ Delete error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-white">🏷️ Discount Codes</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Add, enable, or disable discount codes for your customers
      </p>

      {/* ── Add New Code Form ── */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-lg mb-4">➕ Add New Code</h2>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          {/* Code Input */}
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
            required
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition uppercase"
          />

          {/* Percent Input */}
          <input
            value={newPercent}
            onChange={(e) => setNewPercent(e.target.value)}
            type="number"
            min="1"
            max="100"
            placeholder="Discount %"
            required
            className="w-full sm:w-36 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={adding}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition whitespace-nowrap"
          >
            {adding ? 'Adding...' : '➕ Add Code'}
          </button>
        </form>

        {/* Feedback */}
        {error && (
          <p className="mt-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-2">
            ⚠️ {error}
          </p>
        )}
        {success && (
          <p className="mt-3 text-sm text-green-400 bg-green-900/20 border border-green-800 rounded-xl px-4 py-2">
            {success}
          </p>
        )}
      </div>

      {/* ── Codes Table ── */}
      {codes.length === 0 ? (
        <div className="text-center text-zinc-500 py-16 border border-zinc-800 rounded-2xl">
          <p className="text-4xl mb-3">🏷️</p>
          <p>No discount codes yet. Add your first one above!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-700">
          <table className="w-full border-collapse">

            {/* ── Headers ── */}
            <thead>
              <tr className="bg-zinc-800 border-b border-zinc-700">
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Code</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Discount</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Status</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Created</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Actions</th>
              </tr>
            </thead>

            {/* ── Rows ── */}
            <tbody>
              {codes.map((code, i) => (
                <tr
                  key={code.id}
                  className={`border-b border-zinc-800 transition-colors hover:bg-zinc-800/60 ${
                    i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/60'
                  }`}
                >
                  {/* Code */}
                  <td className="p-4">
                    <span className="font-black text-white tracking-widest text-sm bg-zinc-800 px-3 py-1 rounded-lg">
                      {code.code}
                    </span>
                  </td>

                  {/* Discount % */}
                  <td className="p-4">
                    <span className="text-purple-400 font-bold text-sm">
                      {code.discount_percent}% OFF
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${
                        code.is_active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-zinc-700/50 text-zinc-500 border border-zinc-600/30'
                      }`}
                    >
                      {code.is_active ? '✅ Active' : '⛔ Disabled'}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="p-4 text-zinc-500 text-xs">
                    {new Date(code.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex gap-2">

                      {/* ── Toggle Button ── */}
                      <button
                        onClick={() => handleToggle(code.id, code.is_active)}
                        disabled={togglingId === code.id}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          code.is_active
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        }`}
                      >
                        {togglingId === code.id
                          ? '⏳ ...'
                          : code.is_active
                          ? '⛔ Disable'
                          : '✅ Enable'}
                      </button>

                      {/* ── Delete Button ── */}
                      <button
                        onClick={() => handleDelete(code.id, code.code)}
                        disabled={deletingId === code.id}
                        className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-xs font-bold transition"
                      >
                        {deletingId === code.id ? '⏳ ...' : '🗑️ Delete'}
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}