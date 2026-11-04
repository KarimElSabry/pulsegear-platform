// src/app/api/products/[id]/variants/route.ts
// Admin only (proxy.ts gates /api/* except the public list). Options (color and/or size, each with its own stock and optional price) of one product.
//   GET  -> the colors
//   PUT  -> replace the whole list: rows with an id are updated, rows without are added, missing ones are deleted

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cleanVariant, type VariantInput } from '@/lib/stock'

type Ctx = { params: Promise<{ id: string }> }

import { VARIANT_COLUMNS } from '@/lib/variants'

const COLUMNS = VARIANT_COLUMNS

export async function GET(req: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(req)
  if (denied) return denied
  const productId = Number((await params).id)
  if (!Number.isInteger(productId) || productId <= 0) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const wide = await db.from('product_variants').select(COLUMNS).eq('product_id', productId).order('display_order')
  if (!wide.error) return NextResponse.json(wide.data ?? [])
  // before migration 20261106 the size and price columns do not exist yet
  const old = await db.from('product_variants').select('id, name, color_hex, stock_quantity, is_active, display_order').eq('product_id', productId).order('display_order')
  if (old.error) return NextResponse.json({ error: old.error.message }, { status: 500 })
  return NextResponse.json(old.data ?? [])
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(req)
  if (denied) return denied
  const productId = Number((await params).id)
  if (!Number.isInteger(productId) || productId <= 0) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })

  let body: { variants?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!Array.isArray(body.variants) || body.variants.length > 30) {
    return NextResponse.json({ error: 'Send a list of at most 30 options' }, { status: 400 })
  }

  const rows = []
  for (const [i, input] of (body.variants as VariantInput[]).entries()) {
    const cleaned = cleanVariant(input ?? {}, i)
    if ('error' in cleaned) return NextResponse.json({ error: cleaned.error }, { status: 400 })
    rows.push(cleaned.value)
  }
  const combos = rows.map((r) => `${r.name.toLowerCase()}|${(r.size_name ?? '').toLowerCase()}`)
  if (new Set(combos).size !== combos.length) return NextResponse.json({ error: 'Two options have the same color and size' }, { status: 400 })

  const db = createAdminSupabaseClient()
  const { data: existing, error: loadError } = await db.from('product_variants').select('id').eq('product_id', productId)
  if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 })

  const existingIds = new Set((existing ?? []).map((r: { id: number }) => r.id))
  const keep = new Set(rows.filter((r) => r.id && existingIds.has(r.id)).map((r) => r.id as number))
  const toDelete = [...existingIds].filter((id) => !keep.has(id))

  if (toDelete.length) {
    const { error } = await db.from('product_variants').delete().eq('product_id', productId).in('id', toDelete)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  for (const r of rows) {
    const { id, ...fields } = r
    const result = id && existingIds.has(id)
      ? await db.from('product_variants').update(fields).eq('id', id).eq('product_id', productId)
      : await db.from('product_variants').insert({ ...fields, product_id: productId })
    if (result.error) {
      const missing = /size_name|price_egp/.test(result.error.message)
      return NextResponse.json({ error: missing ? 'Run the Supabase migration 20261106_01_sizes_and_prices.sql first, then save again.' : result.error.message }, { status: 500 })
    }
  }

  const { data: fresh } = await db.from('product_variants').select(COLUMNS).eq('product_id', productId).order('display_order')
  revalidatePath('/products')
  revalidatePath('/admin/products')
  const { data: product } = await db.from('products').select('slug').eq('id', productId).maybeSingle()
  if (product?.slug) revalidatePath(`/products/${product.slug}`)
  return NextResponse.json(fresh ?? [])
}
