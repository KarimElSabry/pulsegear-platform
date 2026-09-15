// src/app/api/products/[id]/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type RouteContext = {
  params: Promise<{ id: string }>
}

// ── GET single product ─────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const productId = Number(id)

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('id', productId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── PATCH single product ───────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const productId = Number(id)

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await req.json()
    const updates: Record<string, any> = {}

    if (body.title !== undefined) updates.title = body.title
    if (body.brand !== undefined) updates.brand = body.brand || null
    if (body.category !== undefined) updates.category = body.category || null
    if (body.condition !== undefined) updates.condition = body.condition || null
    if (body.price_egp !== undefined) updates.price_egp = Number(body.price_egp)
    if (body.description !== undefined) updates.description = body.description || null
    if (body.status !== undefined) updates.status = body.status
    if (body.featured !== undefined) updates.featured = Boolean(body.featured)
    if (body.is_reservable !== undefined) {
      updates.is_reservable = Boolean(body.is_reservable)
    }
    if (body.is_deal !== undefined) updates.is_deal = Boolean(body.is_deal)
    if (body.discount_enabled !== undefined) {
      updates.discount_enabled = Boolean(body.discount_enabled)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select('*, images:product_images(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    revalidatePath('/products')
    revalidatePath(`/products/${data.slug}`)
    revalidatePath('/admin/products')

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[PATCH /api/products/:id]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── DELETE single product ──────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const productId = Number(id)

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/products')
    revalidatePath('/admin/products')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[DELETE /api/products/:id]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}