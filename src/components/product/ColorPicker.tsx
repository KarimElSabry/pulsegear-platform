// src/components/product/ColorPicker.tsx
// The color and size choices of a product (each shown only when the product has them).

'use client'

import { availability, stockLabel } from '@/lib/stock'
import { useVariant } from '@/components/product/VariantContext'

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase()

export default function ColorPicker({ product }: { product: { status?: string | null; stock_quantity?: number | null; on_demand?: boolean | null } }) {
  const ctx = useVariant()
  if (!ctx || ctx.variants.length === 0) return null
  const sel = ctx.selected
  const all = ctx.variants
  const buyable = (match: (v: (typeof all)[number]) => boolean) => all.some((v) => match(v) && availability(product, v).canBuy)

  return (
    <div className="flex flex-col gap-4">
      {ctx.colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted">
            Color: <span className="font-bold text-white">{sel?.name}</span>
            {ctx.sizes.length === 0 && <span className="ml-2 text-xs text-muted">{stockLabel(ctx.availability)}</span>}
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
            {ctx.colors.map((name) => {
              const hex = ctx.variants.find((v) => norm(v.name) === norm(name) && v.color_hex)?.color_hex
              // with sizes, a color is greyed out when none of its sizes is available
              const ok = buyable((v) => norm(v.name) === norm(name))
              const active = norm(sel?.name) === norm(name)
              return (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => ctx.selectColor(name)}
                  title={`${name}${ok ? '' : ' (sold out)'}`}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    active ? 'border-red-500 bg-zinc-800 text-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  } ${ok ? '' : 'opacity-50'}`}
                >
                  <span className="h-4 w-4 rounded-full border border-white/30" style={{ backgroundColor: hex ?? '#71717a' }} aria-hidden="true" />
                  <span className={ok ? '' : 'line-through'}>{name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {ctx.sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted">
            Size: <span className="font-bold text-white">{sel?.size_name}</span>
            <span className="ml-2 text-xs text-muted">{stockLabel(ctx.availability)}</span>
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {ctx.sizes.map((size) => {
              // greyed out when the chosen color does not come in this size in stock
              const ok = buyable((v) => norm(v.size_name) === norm(size) && (ctx.colors.length === 0 || norm(v.name) === norm(sel?.name)))
              const active = norm(sel?.size_name) === norm(size)
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => ctx.selectSize(size)}
                  title={`${size}${ok ? '' : ' (not available in this color)'}`}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    active ? 'border-red-500 bg-zinc-800 text-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  } ${ok ? '' : 'opacity-50 line-through'}`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
