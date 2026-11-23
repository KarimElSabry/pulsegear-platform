// src/app/api/products/[id]/variants/route.ts
// Admin only (proxy.ts gates /api/* except the public list). Options (color and/or size, each with its own stock and optional price) of one product.
//   GET  -> the colors
//   PUT  -> replace the whole list: rows with an id are updated, rows without are added, missing ones are deleted

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cleanVariantList, replaceVariants } from '@/lib/variant-service'

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
  const cleaned = cleanVariantList(body.variants)
  if ('error' in cleaned) return NextResponse.json({ error: cleaned.error }, { status: 400 })

  const db = createAdminSupabaseClient()
  const saved = await replaceVariants(db, productId, cleaned.rows)
  if (!saved.ok) return NextResponse.json({ error: saved.message }, { status: saved.status })

  revalidatePath('/products')
  revalidatePath('/admin/products')
  const { data: product } = await db.from('products').select('slug').eq('id', productId).maybeSingle()
  if (product?.slug) revalidatePath(`/products/${product.slug}`)
  return NextResponse.json(saved.variants)
}
