// src/lib/variants.ts
// Reads the colors (variants) of products. Tolerant of the step 14 migration not being run yet:
// without the table every product simply has no colors.

import type { SupabaseClient } from '@supabase/supabase-js'
import { activeVariants, type VariantLite } from '@/lib/stock'

export async function loadVariants(db: SupabaseClient, productIds: number[]): Promise<Map<number, VariantLite[]>> {
  const out = new Map<number, VariantLite[]>()
  if (productIds.length === 0) return out
  try {
    const { data, error } = await db
      .from('product_variants')
      .select('id, product_id, name, color_hex, stock_quantity, is_active, display_order')
      .in('product_id', productIds)
      .order('display_order', { ascending: true })
    if (error || !data) return out
    for (const row of data as (VariantLite & { product_id: number })[]) {
      const { product_id, ...variant } = row
      out.set(product_id, [...(out.get(product_id) ?? []), variant])
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
