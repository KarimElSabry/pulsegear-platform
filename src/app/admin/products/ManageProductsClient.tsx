// src/app/admin/products/ManageProductsClient.tsx

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, ProductCondition, ProductStatus, ProductImage } from '@/types/product'
import type { VariantLite } from '@/lib/stock'
import { filterProducts, statusCounts, type StatusFilter } from '@/lib/product-admin-filter'
import { deleteProduct, updateProductStatus, triggerVintedSync } from '@/app/admin/actions'

interface Props {
  products: Product[]
}

// ─── Image Manager Component ──────────────────────────────────────────────────
function ImageManager({
  productId,
  images,
  setImages,
  variants = [],
  onSaved,
}: {
  productId: number
  /** The photos live in the edit window, so a switch of tab or a reopen never shows old data again. */
  images: ProductImage[]
  setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>
  variants?: VariantLite[]
  onSaved?: (images: ProductImage[]) => void
}) {
  const [message, setMessage]   = useState<{ ok: boolean; text: string } | null>(null)
  const [newUrl, setNewUrl]     = useState('')
  const [adding, setAdding]     = useState(false)
  const [saving, setSaving]     = useState(false)
  const [dragIdx, setDragIdx]   = useState<number | null>(null)

  // One entry per COLOR (not per size): a color that comes in several sizes shares its photos, so you tag them once.
  const colorGroups: { id: number; name: string }[] = []
  const groupOf = new Map<number, number>()
  for (const v of variants) {
    const name = v.name.trim()
    if (!name) continue
    const found = colorGroups.find((g) => g.name.toLowerCase() === name.toLowerCase())
    if (found) groupOf.set(v.id, found.id)
    else { colorGroups.push({ id: v.id, name }); groupOf.set(v.id, v.id) }
  }
  const repOf = (variantId: number | null | undefined) => (variantId == null ? '' : groupOf.get(variantId) ?? '')

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
    setMessage(null)
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          images: images.map((img, i) => ({
            id:            img.id,
            display_order: i,
            is_primary:    img.is_primary,
            // only sent once the product has colors, so the old behaviour is unchanged without them
            ...(variants.length > 0 ? { variant_id: img.variant_id ?? null } : {}),
          })),
        }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Failed to save')
      const saved = images.map((img, i) => ({ ...img, display_order: i }))
      setImages(saved)
      onSaved?.(saved)
      setMessage({ ok: true, text: 'Saved' })
    } catch (e) {
      console.error(e)
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not save' })
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

              {/* Color of this photo */}
              {colorGroups.length > 0 && (
                <select
                  value={repOf(img.variant_id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setImages((prev) =>
                      prev.map((p) => (p.id === img.id ? { ...p, variant_id: e.target.value ? Number(e.target.value) : null } : p))
                    )
                  }
                  className="absolute bottom-0 left-0 right-0 z-10 bg-black/80 text-white text-xs px-1 py-1 border-0 focus:outline-none"
                >
                  <option value="">All options</option>
                  {colorGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bottom-6 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
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
          ⠿ Drag images to reorder — hover to set main or delete{colorGroups.length > 0 ? '. Pick a color under each photo, then save. Sizes of the same color share the photos.' : ''}
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
      {message && <p role="status" className={`text-sm text-center ${message.ok ? 'text-green-400' : 'text-red-400'}`}>{message.ok ? '✓ ' : '❌ '}{message.text}</p>}

    </div>
  )
}

// ─── Stock & Colors Manager ───────────────────────────────────────────────────
type DraftColor = { id?: number; name: string; size: string; price: string; color_hex: string; stock: string; is_active: boolean }
const toDraft = (v: VariantLite): DraftColor => ({ id: v.id, name: v.name, size: v.size_name ?? '', price: v.price_egp == null ? '' : String(v.price_egp), color_hex: v.color_hex ?? '', stock: v.stock_quantity === null ? '' : String(v.stock_quantity), is_active: v.is_active })

function OptionsManager({
  product,
  variants,
  onVariantsChange,
  onStockChange,
}: {
  product: Product
  variants: VariantLite[]
  onVariantsChange: (v: VariantLite[]) => void
  onStockChange: (stock: number | null) => void
}) {
  const [onDemand, setOnDemand] = useState(product.on_demand === true)
  const [stock, setStock] = useState(product.stock_quantity === null || product.stock_quantity === undefined ? '' : String(product.stock_quantity))
  const [drafts, setDrafts] = useState<DraftColor[]>(variants.map(toDraft))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const update = (i: number, patch: Partial<DraftColor>) =>
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const stockRes = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: stock.trim() === '' ? null : stock.trim(), ...(onDemand !== (product.on_demand === true) ? { on_demand: onDemand } : {}) }),
      })
      if (!stockRes.ok) throw new Error((await stockRes.json().catch(() => null))?.error || 'Could not save the stock')

      const res = await fetch(`/api/products/${product.id}/variants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants: drafts.map((d) => ({ id: d.id, name: d.name, size_name: d.size.trim() || null, price_egp: d.price.trim() === '' ? null : d.price.trim(), color_hex: d.color_hex.trim() || null, stock_quantity: d.stock.trim() === '' ? null : d.stock.trim(), is_active: d.is_active })),
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Could not save the colors')

      onStockChange(stock.trim() === '' ? null : Number(stock))
      onVariantsChange(data as VariantLite[])
      setDrafts((data as VariantLite[]).map(toDraft))
      setMessage({ ok: true, text: 'Saved' })
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Something went wrong' })
    } finally {
      setSaving(false)
    }
  }

  const input = 'bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-zinc-600'

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-zinc-400 mb-1">Stock quantity</label>
        <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" placeholder="empty = one-off item" className={`${input} w-full`} />
        <label className="mt-2 flex items-start gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={onDemand} onChange={(e) => setOnDemand(e.target.checked)} className="mt-1" />
          <span><b className="text-white">Always available (bought on demand).</b> You buy it after the customer orders. An order never holds it, marks it sold or hides it. Only works when the stock quantity above is empty.</span>
        </label>
        {onDemand && stock.trim() !== '' && (
          <p className="mt-1 text-xs text-amber-300">A stock number is set, so this product is sold as normal stock and &quot;Always available&quot; has no effect. Empty the stock quantity (and the color numbers) to use it.</p>
        )}
        <p className="text-xs text-zinc-500 mt-1">
          Leave empty for a one-off item (sold once, the status says if it is still available). Type a number for normal stock; 0 means out of stock.
          With colors, each color can have its own number; an empty color number uses this one.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-zinc-400">Options: colors and/or sizes</p>
        <p className="text-xs text-zinc-500">One row = one thing a customer can buy (for example Black / M-XL). Only a color, only a size, or both. An empty price uses the product price above; the product price is the one shown on the product list, so set it to your lowest.</p>
        {drafts.length === 0 && <p className="text-zinc-500 text-sm">No options. The product is sold as one option.</p>}
        {drafts.map((d, i) => (
          <div key={d.id ?? `new-${i}`} className="space-y-2 bg-zinc-800/50 border border-zinc-700 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Color"
                value={/^#[0-9a-fA-F]{6}$/.test(d.color_hex) ? d.color_hex : '#888888'}
                onChange={(e) => update(i, { color_hex: e.target.value })}
                className="h-9 w-9 shrink-0 cursor-pointer rounded bg-transparent"
              />
              <input value={d.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Color name, e.g. Black" className={`${input} flex-1 min-w-0 py-2`} />
              <label className="flex shrink-0 items-center gap-1 text-xs text-zinc-400" title="Hide this option from the shop">
                <input type="checkbox" checked={d.is_active} onChange={(e) => update(i, { is_active: e.target.checked })} /> shown
              </label>
              <button type="button" onClick={() => setDrafts((prev) => prev.filter((_, idx) => idx !== i))} className="shrink-0 text-red-400 hover:text-red-300 text-xl leading-none px-1" aria-label="Remove option">×</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="block text-xs text-zinc-500">Size
                <input value={d.size} onChange={(e) => update(i, { size: e.target.value })} placeholder="e.g. M-XL" className={`${input} mt-1 w-full`} />
              </label>
              <label className="block text-xs text-zinc-500">Price EGP
                <input value={d.price} onChange={(e) => update(i, { price: e.target.value })} inputMode="decimal" placeholder="product price" className={`${input} mt-1 w-full`} />
              </label>
              <label className="block text-xs text-zinc-500">Stock
                <input value={d.stock} onChange={(e) => update(i, { stock: e.target.value })} inputMode="numeric" placeholder="stock" className={`${input} mt-1 w-full`} />
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setDrafts((prev) => [...prev, { name: '', size: '', price: '', color_hex: '', stock: '', is_active: true }])}
          className="text-sm font-bold text-blue-400 hover:text-blue-300"
        >
          + Add option
        </button>
      </div>

      {message && (
        <p className={`text-sm rounded-xl px-4 py-2 border ${message.ok ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-red-400 bg-red-900/20 border-red-800'}`}>
          {message.text}
        </p>
      )}
      <button onClick={handleSave} disabled={saving} className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition">
        {saving ? 'Saving...' : '💾 Save stock & options'}
      </button>
      <p className="text-xs text-zinc-500">After saving, open the Images tab to pick which photos belong to which color. A color with several sizes shares its photos: tag them once.</p>
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
  const [tab, setTab]         = useState<'details' | 'images' | 'options'>('details')
  const [variants, setVariants] = useState<VariantLite[]>([])
  const [variantsLoaded, setVariantsLoaded] = useState(false)
  const [photos, setPhotos] = useState<ProductImage[]>(() => [...(product.images ?? [])].sort((a, b) => a.display_order - b.display_order))

  // Colors are loaded once. Before the step 14 migration this fails quietly and the product just has no colors.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/products/${product.id}/variants`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => { if (!cancelled) setVariants(Array.isArray(list) ? list : []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setVariantsLoaded(true) })
    return () => { cancelled = true }
  }, [product.id])

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
            onClick={() => setTab('options')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              tab === 'options'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            🎨 Stock, colors &amp; sizes
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
                <p className="text-zinc-500 text-xs mb-1">Product ID</p>
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
        {tab === 'options' && (
          variantsLoaded ? (
            <OptionsManager
              product={form}
              variants={variants}
              onVariantsChange={setVariants}
              onStockChange={(stock) => setForm((prev) => ({ ...prev, stock_quantity: stock }))}
            />
          ) : (
            <p className="text-zinc-500 text-sm">Loading…</p>
          )
        )}

        {tab === 'images' && (
          <ImageManager
            productId={product.id!}
            images={photos}
            setImages={setPhotos}
            variants={variants}
            onSaved={(saved) => onSave({ id: product.id, images: saved } as Product)}
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [query, setQuery] = useState('')

  const counts = statusCounts(products)
  const sortedProducts = filterProducts([...products], statusFilter, query).sort((a, b) => {
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

      {/* ── Filter: Active / Sold / Out of stock / All + search ── */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {([['active', 'Active'], ['sold', 'Sold'], ['out_of_stock', 'Out of stock'], ['all', 'All']] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition border ${statusFilter === key ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}>
            {label} <span className="opacity-70">({counts[key]})</span>
          </button>
        ))}
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or ID…"
          className="ml-auto bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-zinc-600 w-56" />
      </div>

      {/* ── Table ── */}
      {products.length === 0 ? (
        <p className="text-zinc-500">No products added</p>
      ) : sortedProducts.length === 0 ? (
        <p className="text-zinc-500">No products match this filter.</p>
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
                <th className="p-4 text-left text-zinc-300 font-semibold text-sm">👤 Client</th>
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
                    <span className="mt-1 block text-xs text-zinc-400">
                      {product.stock_quantity !== null && product.stock_quantity !== undefined
                        ? `Stock: ${product.stock_quantity}`
                        : product.on_demand ? '♾ Always available' : 'One-off item'}
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

                  {/* Listed on behalf of a client */}
                  <td className="p-4">
                    <ToggleBtn
                      value={product.client_listing ?? false}
                      onToggle={() => handleToggle(product.id!, 'client_listing', product.client_listing ?? false)}
                      title={product.client_listing ? 'Listed for a client: press to make it a Pulse Gear product' : 'Mark as listed on behalf of a client'}
                      color="bg-sky-600"
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