// src/app/admin/products/OptionRows.tsx
// The list of options (colors and/or sizes) of a product, with price and stock for each.
// Used in Add Product and in the edit window of Manage Products, so both look and work the same.

'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { VariantLite } from '@/lib/stock'

export type DraftColor = { id?: number; name: string; size: string; price: string; color_hex: string; stock: string; is_active: boolean }

export const emptyDraft = (): DraftColor => ({ name: '', size: '', price: '', color_hex: '', stock: '', is_active: true })

export const toDraft = (v: VariantLite): DraftColor => ({
  id: v.id, name: v.name, size: v.size_name ?? '', price: v.price_egp == null ? '' : String(v.price_egp),
  color_hex: v.color_hex ?? '', stock: v.stock_quantity === null ? '' : String(v.stock_quantity), is_active: v.is_active,
})

/** What the server expects for each option. */
export const draftsPayload = (drafts: DraftColor[]) => drafts.map((d) => ({
  id: d.id, name: d.name, size_name: d.size.trim() || null, price_egp: d.price.trim() === '' ? null : d.price.trim(),
  color_hex: d.color_hex.trim() || null, stock_quantity: d.stock.trim() === '' ? null : d.stock.trim(), is_active: d.is_active,
}))

const input = 'bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-zinc-600'

export default function OptionRows({ drafts, setDrafts, pricePlaceholder = 'product price' }: { drafts: DraftColor[]; setDrafts: Dispatch<SetStateAction<DraftColor[]>>; pricePlaceholder?: string }) {
  const update = (i: number, patch: Partial<DraftColor>) => setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-zinc-400">Options: colors and/or sizes</p>
      <p className="text-xs text-zinc-500">One row = one thing a customer can buy (for example Black / M-XL). Only a color, only a size, or both. An empty price uses the product price; type a price to give that option its own. The product price is the one shown on the product list, so set it to your lowest.</p>
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
              <input value={d.price} onChange={(e) => update(i, { price: e.target.value })} inputMode="decimal" placeholder={pricePlaceholder} className={`${input} mt-1 w-full`} />
            </label>
            <label className="block text-xs text-zinc-500">Stock
              <input value={d.stock} onChange={(e) => update(i, { stock: e.target.value })} inputMode="numeric" placeholder="stock" className={`${input} mt-1 w-full`} />
            </label>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setDrafts((prev) => [...prev, emptyDraft()])} className="text-sm font-bold text-blue-400 hover:text-blue-300">
        + Add option
      </button>
    </div>
  )
}
