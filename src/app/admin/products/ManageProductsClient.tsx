'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, ProductCondition, ProductStatus } from '@/types/product'
import { deleteProduct, updateProductStatus, triggerVintedSync } from '@/app/admin/actions'

interface Props {
  products: Product[]
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product
  onClose: () => void
  onSave: (updated: Product) => void
}) {
  const [form, setForm] = useState<Product>({ ...product })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conditions: ProductCondition[] = [
    'New with tags',
    'New without tags',
    'Very good',
    'Good',
    'Satisfactory',
  ]

  const statuses: ProductStatus[] = ['available', 'sold', 'reserved']

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'price_egp'
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          brand: form.brand,
          category: form.category,
          condition: form.condition,
          price_egp: form.price_egp,
          description: form.description,
          status: form.status,
          featured: form.featured,
        }),
      })

      if (!res.ok) throw new Error('Failed to update product')

      const updated = await res.json()
      onSave(updated)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">✏️ Edit Product</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Brand</label>
              <input
                name="brand"
                value={form.brand ?? ''}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Category</label>
              <input
                name="category"
                value={form.category ?? ''}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Price (EGP)</label>
            <input
              name="price_egp"
              type="number"
              value={form.price_egp}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Condition + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Condition</label>
              <select
                name="condition"
                value={form.condition ?? ''}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">— Select —</option>
                {conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Status</label>
              <select
                name="status"
                value={form.status ?? 'available'}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Description</label>
            <textarea
              name="description"
              value={form.description ?? ''}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={form.featured ?? false}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="featured" className="text-zinc-400 text-sm">
              Featured Product
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-2">
              ❌ {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition"
            >
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageProductsClient({ products: initialProducts }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // ── Vinted Sync State ──────────────────────────────────────────────────────
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    checked: number
    sold: number
    errors: number
  } | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStatusChange = async (id: number, status: 'available' | 'sold') => {
    try {
      await updateProductStatus(id, status)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      )
      router.refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleSave = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    )
    router.refresh()
  }

  // ✅ NEW — Toggle is_reservable
  const handleToggleReservable = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_reservable: !current }),
      })
      if (!res.ok) throw new Error('Failed to update')

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_reservable: !current } : p))
      )
    } catch (error) {
      console.error('Failed to toggle reservable:', error)
    }
  }

  const handleVintedSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setSyncError(null)

    try {
      const data = await triggerVintedSync()
      setSyncResult({
        checked: data.checked,
        sold: data.sold,
        errors: data.errors,
      })
      router.refresh()
    } catch (err: any) {
      setSyncError(err.message || 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">

      {/* ── Header + Sync Button ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Products Management</h1>

        {/* 🔄 Vinted Sync */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleVintedSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 
                       disabled:opacity-50 disabled:cursor-not-allowed text-white 
                       rounded-xl text-sm font-bold transition"
          >
            {syncing ? (
              <>
                <span className="animate-spin inline-block">⏳</span>
                Syncing...
              </>
            ) : (
              '🔄 Sync Vinted Now'
            )}
          </button>

          {/* ✅ Success Result */}
          {syncResult && (
            <div className="text-sm bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-zinc-300">
              ✅ Checked: <strong className="text-white">{syncResult.checked}</strong>
              {' · '}
              🔴 Sold: <strong className="text-red-400">{syncResult.sold}</strong>
              {' · '}
              ⚠️ Errors: <strong className="text-yellow-400">{syncResult.errors}</strong>
            </div>
          )}

          {/* ❌ Error */}
          {syncError && (
            <div className="text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-2 text-red-400">
              ❌ {syncError}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {products.length === 0 ? (
        <p className="text-zinc-500">No products added</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-700">
          <table className="w-full border-collapse">

            {/* Headers */}
            <thead>
              <tr className="bg-zinc-800 border-b border-zinc-700">
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Product</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Status</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Price</th>
                {/* ✅ NEW */}
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Reserve</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Actions</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {products.map((product, i) => (
                <tr
                  key={product.id}
                  className={`border-b border-zinc-800 transition-colors hover:bg-zinc-800/60 ${
                    i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/60'
                  }`}
                >
                  {/* Title */}
                  <td className="p-4 text-white text-sm font-medium">{product.title}</td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        product.status === 'available'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : product.status === 'reserved'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 text-zinc-300 text-sm">{product.price_egp} EGP</td>

                  {/* ✅ NEW — Reserve Toggle */}
                  <td className="p-4">
                    <button
                      onClick={() =>
                        handleToggleReservable(product.id!, product.is_reservable ?? false)
                      }
                      title={product.is_reservable ? 'Click to disable reservation' : 'Click to enable reservation'}
                      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                        product.is_reservable ? 'bg-purple-600' : 'bg-zinc-600'
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
                          product.is_reservable ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {/* ✏️ Edit */}
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition"
                      >
                        ✏️ Edit
                      </button>

                      {/* Mark as Sold / Available */}
                      {product.status === 'available' ? (
                        <button
                          onClick={() => handleStatusChange(product.id!, 'sold')}
                          className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-lg text-xs font-bold transition"
                        >
                          Mark as Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(product.id!, 'available')}
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition"
                        >
                          Mark as Available
                        </button>
                      )}

                      {/* 🗑️ Delete */}
                      <button
                        onClick={() => handleDelete(product.id!)}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}