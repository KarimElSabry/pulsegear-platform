// src/lib/variants.ts
// Reads the colors (variants) of products. Tolerant of the step 14 migration not being run yet:
// without the table every product simply has no colors.

import type { SupabaseClient } from '@supabase/supabase-js'
import { activeVariants, type VariantLite } from '@/lib/stock'

export const VARIANT_COLUMNS = 'id, name, size_name, price_egp, color_hex, stock_quantity, is_active, display_order'

export async function loadVariants(db: SupabaseClient, productIds: number[]): Promise<Map<number, VariantLite[]>> {
  const out = new Map<number, VariantLite[]>()
  if (productIds.length === 0) return out
  try {
    // size_name and price_egp exist after migration 20261106; before it the colors still load without them
    const wide = await db.from('product_variants').select(`product_id, ${VARIANT_COLUMNS}`).in('product_id', productIds).order('display_order', { ascending: true })
    const { data, error } = wide.error
      ? await db.from('product_variants').select('id, product_id, name, color_hex, stock_quantity, is_active, display_order').in('product_id', productIds).order('display_order', { ascending: true })
      : wide
    if (error || !data) return out
    for (const row of data as unknown as (VariantLite & { product_id: number })[]) {
      const { product_id, ...variant } = row
      out.set(product_id, [...(out.get(product_id) ?? []), { ...variant, price_egp: variant.price_egp == null ? null : Number(variant.price_egp) }])
    }
  } catch {
    /* table missing or unreachable: no colors */
  }
  return out
}

/** Only what the shop needs to show (active colors, in order). */
export async function loadActiveVariants(db: SupabaseClient, productId: number): Promise<VariantLite[]> {
  const map = await loadVariants(db, [productId])
  return activeVariants(map.get(productId))
}
