// src/app/admin/products/ManageProductsClient.tsx

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, ProductCondition, ProductStatus, ProductImage } from '@/types/product'
import { deleteProduct, updateProductStatus, triggerVintedSync } from '@/app/admin/actions'

interface Props {
  products: Product[]
}

// ─── Image Manager Component ──────────────────────────────────────────────────
function ImageManager({
  productId,
  initialImages,
}: {
  productId: number
  initialImages: ProductImage[]
}) {
  const [images, setImages]     = useState<ProductImage[]>(
    [...initialImages].sort((a, b) => a.display_order - b.display_order)
  )
  const [newUrl, setNewUrl]     = useState('')
  const [adding, setAdding]     = useState(false)
  const [saving, setSaving]     = useState(false)
  const [dragIdx, setDragIdx]   = useState<number | null>(null)

  // ── Add new image ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newUrl.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ image_url: newUrl.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add image')
      const added = await res.json()
      setImages((prev) => [...prev, added])
      setNewUrl('')
    } catch (e) {
      console.error(e)
    } finally {
      setAdding(false)
    }
  }

  // ── Delete image ───────────────────────────────────────────────────────────
  const handleDelete = async (imageId: number) => {
    if (!confirm('Delete this image?')) return
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ image_id: imageId }),
      })
      if (!res.ok) throw new Error('Failed to delete image')
      setImages((prev) => {
        const filtered = prev.filter((img) => img.id !== imageId)
        // If deleted was primary, promote first
        if (!filtered.some((img) => img.is_primary) && filtered.length > 0) {
          filtered[0] = { ...filtered[0], is_primary: true }
        }
        return filtered
      })
    } catch (e) {
      console.error(e)
    }
  }

  // ── Set primary ────────────────────────────────────────────────────────────
  const handleSetPrimary = (imageId: number) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
    )
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragStart = (idx: number) => setDragIdx(idx)

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    setImages((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(dragIdx, 1)
      updated.splice(idx, 0, moved)
      return updated.map((img, i) => ({ ...img, display_order: i }))
    })
    setDragIdx(idx)
  }

  const handleDragEnd = () => setDragIdx(null)

  // ── Save order + primary to DB ─────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          images: images.map((img, i) => ({
            id:            img.id,
            display_order: i,
            is_primary:    img.is_primary,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Image Grid */}
      {images.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-4">No images yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative group rounded-xl overflow-hidden border-2 transition cursor-grab active:cursor-grabbing ${
                img.is_primary
                  ? 'border-green-500'
                  : 'border-zinc-700 hover:border-zinc-500'
              } ${dragIdx === idx ? 'opacity-50' : ''}`}
            >
              {/* Image */}
              <img
                src={img.image_url}
                alt=""
                className="w-full h-24 object-cover"
              />

              {/* Primary Badge */}
              {img.is_primary && (
                <span className="absolute top-1 left-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Main
                </span>
              )}

              {/* Drag hint */}
              <span className="absolute top-1 right-1 text-white/60 text-xs">⠿</span>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(img.id!)}
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-lg font-bold transition"
                  >
                    ⭐ Set Main
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id!)}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg font-bold transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drag hint */}
      {images.length > 1 && (
        <p className="text-zinc-600 text-xs text-center">
          ⠿ Drag images to reorder — hover to set main or delete
        </p>
      )}

      {/* Add New Image */}
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="https://example.com/image.jpg"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-zinc-600"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newUrl.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
        >
          {adding ? '...' : '+ Add'}
        </button>
      </div>

      {/* Save Order Button */}
      {images.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition"
        >
          {saving ? '⏳ Saving...' : '💾 Save Order & Main Image'}
        </button>
      )}

    </div>
  )
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
  const [form, setForm]       = useState<Product>({ ...product })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [tab, setTab]         = useState<'details' | 'images'>('details')

  const conditions: ProductCondition[] = [
    'New with tags',
    'New without tags',
    'Very good',
    'Good',
    'Satisfactory',
  ]

  const statuses: { value: ProductStatus; label: string }[] = [
    { value: 'available',    label: 'Available' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'sold',         label: 'Sold' },
    { value: 'reserved',     label: 'Reserved' },
  ]

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
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title:            form.title,
          brand:            form.brand,
          category:         form.category,
          condition:        form.condition,
          price_egp:        form.price_egp,
          description:      form.description,
          status:           form.status,
          featured:         form.featured,
          discount_enabled: form.discount_enabled,
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">✏️ Edit Product</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('details')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              tab === 'details'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            📝 Details
          </button>
          <button
            onClick={() => setTab('images')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              tab === 'images'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            🖼️ Images ({product.images?.length ?? 0})
          </button>
        </div>

        {/* ── Details Tab ── */}
        {tab === 'details' && (
          <div className="space-y-4">

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Title</label>
              <input name="title" value={form.title} onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Brand</label>
                <input name="brand" value={form.brand ?? ''} onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Category</label>
                <input name="category" value={form.category ?? ''} onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Price (EGP)</label>
              <input name="price_egp" type="number" value={form.price_egp} onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Condition</label>
                <select name="condition" value={form.condition ?? ''} onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="">— Select —</option>
                  {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Status</label>
                <select name="status" value={form.status ?? 'available'} onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Description</label>
              <textarea name="description" value={form.description ?? ''} onChange={handleChange}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" name="featured" id="featured"
                checked={form.featured ?? false} onChange={handleChange}
                className="w-4 h-4 accent-blue-500" />
              <label htmlFor="featured" className="text-zinc-400 text-sm">Featured Product</label>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" name="discount_enabled" id="discount_enabled"
                checked={form.discount_enabled ?? true} onChange={handleChange}
                className="w-4 h-4 accent-green-500" />
              <label htmlFor="discount_enabled" className="text-zinc-400 text-sm">Allow Discount Codes</label>
            </div>

            {product.vinted_id && (
              <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3">
                <p className="text-zinc-500 text-xs mb-1">Vinted ID</p>
                <p className="text-violet-400 text-sm font-mono">{product.vinted_id}</p>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-2">
                ❌ {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-xl text-sm transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition">
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>

          </div>
        )}

        {/* ── Images Tab ── */}
        {tab === 'images' && (
          <ImageManager
            productId={product.id!}
            initialImages={product.images ?? []}
          />
        )}

      </div>
    </div>
  )
}

// ─── Status sort order ────────────────────────────────────────────────────────
const STATUS_ORDER: Record<string, number> = {
  available:    0,
  reserved:     1,
  out_of_stock: 2,
  sold:         3,
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageProductsClient({ products: initialProducts }: Props) {
  const router = useRouter()
  const [products, setProducts]         = useState<Product[]>(initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [syncing, setSyncing]       = useState(false)
  const [syncResult, setSyncResult] = useState<{ checked: number; sold: number; errors: number } | null>(null)
  const [syncError, setSyncError]   = useState<string | null>(null)

  const sortedProducts = [...products].sort((a, b) => {
    const statusDiff =
      (STATUS_ORDER[a.status ?? 'available'] ?? 99) -
      (STATUS_ORDER[b.status ?? 'available'] ?? 99)
    if (statusDiff !== 0) return statusDiff
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  })

  const handleStatusChange = async (id: number, status: 'available' | 'sold' | 'out_of_stock') => {
    try {
      await updateProductStatus(id, status)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      router.refresh()
    } catch (error) { console.error('Failed to update status:', error) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } catch (error) { console.error('Failed to delete product:', error) }
  }

  const handleSave = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
    router.refresh()
  }

  const handleToggle = async (id: number, field: string, current: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [field]: !current }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: !current } : p))
      )
    } catch (error) { console.error(`Failed to toggle ${field}:`, error) }
  }

  const handleVintedSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setSyncError(null)
    try {
      const data = await triggerVintedSync()
      setSyncResult({ checked: data.checked, sold: data.sold, errors: data.errors })
      router.refresh()
    } catch (err: any) {
      setSyncError(err.message || 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  // ── Toggle Button Component ────────────────────────────────────────────────
  const ToggleBtn = ({
    value,
    onToggle,
    title,
    color,
  }: {
    value:    boolean
    onToggle: () => void
    title:    string
    color:    string
  }) => (
    <button
      onClick={onToggle}
      title={title}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        value ? color : 'bg-zinc-600'
      }`}
    >
      <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
        value ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  )

  return (
    <div className="p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Products Management</h1>

        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={handleVintedSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition">
            {syncing ? <><span className="animate-spin inline-block">⏳</span> Syncing...</> : '🔄 Sync Vinted Now'}
          </button>

          {syncResult && (
            <div className="text-sm bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-zinc-300">
              ✅ Checked: <strong className="text-white">{syncResult.checked}</strong>
              {' · '}🔴 Sold: <strong className="text-red-400">{syncResult.sold}</strong>
              {' · '}⚠️ Errors: <strong className="text-yellow-400">{syncResult.errors}</strong>
            </div>
          )}

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
            <thead>
              <tr className="bg-zinc-800 border-b border-zinc-700">
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Product</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Status</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Price</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Added</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Reserve</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Featured</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">🔥 Deal</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">🏷️ Discount</th>
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product, i) => (
                <tr key={product.id}
                  className={`border-b border-zinc-800 transition-colors hover:bg-zinc-800/60 ${
                    i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/60'
                  }`}>

                  {/* Title + Vinted ID */}
                  <td className="p-4">
                    <p className="text-white text-sm font-medium">{product.title}</p>
                    {product.vinted_id && (
                      <p className="text-violet-500 text-xs font-mono mt-0.5">ID: {product.vinted_id}</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      product.status === 'available'    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : product.status === 'reserved'  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : product.status === 'out_of_stock' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {product.status === 'sold' ? 'Sold'
                        : product.status === 'out_of_stock' ? 'Out of Stock'
                        : product.status}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 text-zinc-300 text-sm">{product.price_egp} EGP</td>

                  {/* Added Date */}
                  <td className="p-4 text-zinc-500 text-xs">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Reserve */}
                  <td className="p-4">
                    <ToggleBtn
                      value={product.is_reservable ?? false}
                      onToggle={() => handleToggle(product.id!, 'is_reservable', product.is_reservable ?? false)}
                      title={product.is_reservable ? 'Disable reservation' : 'Enable reservation'}
                      color="bg-purple-600"
                    />
                  </td>

                  {/* Featured */}
                  <td className="p-4">
                    <ToggleBtn
                      value={product.featured ?? false}
                      onToggle={() => handleToggle(product.id!, 'featured', product.featured ?? false)}
                      title={product.featured ? 'Unfeature' : 'Feature'}
                      color="bg-amber-500"
                    />
                  </td>

                  {/* Deal */}
                  <td className="p-4">
                    <ToggleBtn
                      value={product.is_deal ?? false}
                      onToggle={() => handleToggle(product.id!, 'is_deal', product.is_deal ?? false)}
                      title={product.is_deal ? 'Remove from deals' : 'Add to deals'}
                      color="bg-orange-500"
                    />
                  </td>

                  {/* Discount */}
                  <td className="p-4">
                    <ToggleBtn
                      value={product.discount_enabled ?? true}
                      onToggle={() => handleToggle(product.id!, 'discount_enabled', product.discount_enabled ?? true)}
                      title={product.discount_enabled ? 'Disable discounts' : 'Enable discounts'}
                      color="bg-green-600"
                    />
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setEditingProduct(product)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                        ✏️ Edit
                      </button>

                      {product.source_url && (
                        <a href={product.source_url} target="_blank" rel="noopener noreferrer"
                          className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                          🔗 Vinted
                        </a>
                      )}

                      {product.status === 'available' ? (
                        <>
                          <button onClick={() => handleStatusChange(product.id!, 'out_of_stock')}
                            className="bg-orange-500 hover:bg-orange-400 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                            📦 Out of Stock
                          </button>
                          <button onClick={() => handleStatusChange(product.id!, 'sold')}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                            💰 Mark as Sold
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleStatusChange(product.id!, 'available')}
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                          ✅ Mark as Available
                        </button>
                      )}

                      <button onClick={() => handleDelete(product.id!)}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                        🗑️ Delete
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