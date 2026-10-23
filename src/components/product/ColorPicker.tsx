// src/components/product/ColorPicker.tsx

'use client'

import { availability, stockLabel } from '@/lib/stock'
import { useVariant } from '@/components/product/VariantContext'

export default function ColorPicker({ product }: { product: { status?: string | null; stock_quantity?: number | null } }) {
  const ctx = useVariant()
  if (!ctx || ctx.variants.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted">
        Color: <span className="font-bold text-white">{ctx.selected?.name}</span>
        <span className="ml-2 text-xs text-muted">{stockLabel(ctx.availability)}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
        {ctx.variants.map((v) => {
          const ok = availability(product, v).canBuy
          const active = ctx.selected?.id === v.id
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => ctx.select(v.id)}
              title={`${v.name}${ok ? '' : ' (sold out)'}`}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                active ? 'border-red-500 bg-zinc-800 text-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
              } ${ok ? '' : 'opacity-50'}`}
            >
              <span
                className="h-4 w-4 rounded-full border border-white/30"
                style={{ backgroundColor: v.color_hex ?? '#71717a' }}
                aria-hidden="true"
              />
              <span className={ok ? '' : 'line-through'}>{v.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
