// src/lib/variant-service.ts
// Server only: validates and saves the options (colors and/or sizes) of a product.
// Used by the edit window (PUT /api/products/[id]/variants) and by Add Product (options typed while adding).

import type { SupabaseClient } from '@supabase/supabase-js'
import { cleanVariant, type VariantInput } from '@/lib/stock'
import { VARIANT_COLUMNS } from '@/lib/variants'

export type CleanVariantRow = Extract<ReturnType<typeof cleanVariant>, { value: unknown }>['value']

export const MAX_OPTIONS = 30

/** Validates the whole list the admin sent. Rows with no color and no size at all are ignored (an empty row you never filled in). */
export function cleanVariantList(input: unknown): { error: string } | { rows: CleanVariantRow[] } {
  if (!Array.isArray(input) || input.length > MAX_OPTIONS) return { error: `Send a list of at most ${MAX_OPTIONS} options` }
  const rows: CleanVariantRow[] = []
  for (const [i, raw] of (input as VariantInput[]).entries()) {
    const cleaned = cleanVariant(raw ?? {}, i)
    if ('error' in cleaned) return { error: cleaned.error }
    rows.push(cleaned.value)
  }
  const combos = rows.map((r) => `${r.name.toLowerCase()}|${(r.size_name ?? '').toLowerCase()}`)
  if (new Set(combos).size !== combos.length) return { error: 'Two options have the same color and size' }
  return { rows }
}

/** The "variants" field of the Add Product form: JSON text. Blank rows are dropped; nothing sent = no options. */
export function parseVariantsField(value: unknown): { error: string } | { rows: CleanVariantRow[] } {
  if (typeof value !== 'string' || !value.trim()) return { rows: [] }
  let list: unknown
  try { list = JSON.parse(value) } catch { return { error: 'The options could not be read. Reload the page and try again.' } }
  if (!Array.isArray(list)) return { error: 'The options could not be read. Reload the page and try again.' }
  const filled = list.filter((v) => {
    const o = (v ?? {}) as VariantInput
    return [o.name, o.size_name, o.price_egp, o.stock_quantity].some((x) => typeof x === 'string' ? x.trim() !== '' : x != null && x !== '')
  })
  return cleanVariantList(filled)
}

export type SaveResult = { ok: true; variants: unknown[] } | { ok: false; status: number; message: string }

/** Replaces the whole list: rows with an id are updated, rows without are added, missing ones are deleted. */
export async function replaceVariants(db: SupabaseClient, productId: number, rows: CleanVariantRow[]): Promise<SaveResult> {
  const { data: existing, error: loadError } = await db.from('product_variants').select('id').eq('product_id', productId)
  if (loadError) return { ok: false, status: 500, message: loadError.message }

  const existingIds = new Set((existing ?? []).map((r: { id: number }) => r.id))
  const keep = new Set(rows.filter((r) => r.id && existingIds.has(r.id)).map((r) => r.id as number))
  const toDelete = [...existingIds].filter((id) => !keep.has(id))

  if (toDelete.length) {
    const { error } = await db.from('product_variants').delete().eq('product_id', productId).in('id', toDelete)
    if (error) return { ok: false, status: 500, message: error.message }
  }
  for (const r of rows) {
    const { id, ...fields } = r
    const result = id && existingIds.has(id)
      ? await db.from('product_variants').update(fields).eq('id', id).eq('product_id', productId)
      : await db.from('product_variants').insert({ ...fields, product_id: productId })
    if (result.error) {
      const missing = /size_name|price_egp/.test(result.error.message)
      return { ok: false, status: 500, message: missing ? 'Run the Supabase migration 20261106_01_sizes_and_prices.sql first, then save again.' : result.error.message }
    }
  }
  const { data: fresh } = await db.from('product_variants').select(VARIANT_COLUMNS).eq('product_id', productId).order('display_order')
  return { ok: true, variants: fresh ?? [] }
}

/**
 * Options typed while adding a product. If they cannot be saved the new product is removed again, so you never
 * end up with a half-finished product (and pressing "Add" a second time cannot make a duplicate).
 */
export async function saveOptionsForNewProduct(db: SupabaseClient, productId: number, rows: CleanVariantRow[], removeProduct: (id: number) => Promise<void>): Promise<{ ok: true } | { ok: false; message: string }> {
  if (rows.length === 0) return { ok: true }
  const saved = await replaceVariants(db, productId, rows)
  if (saved.ok) return { ok: true }
  try { await removeProduct(productId) } catch { /* nothing more we can do; the message below tells the admin */ }
  return { ok: false, message: `The colors/sizes could not be saved, so the product was not added: ${saved.message}` }
}
