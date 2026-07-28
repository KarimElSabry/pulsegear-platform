// src/app/api/products/likes/route.ts

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// ✅ GET — unchanged
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const productId = req.nextUrl.searchParams.get('product_id')

  if (!productId) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  const { count, error } = await supabase
    .from('product_likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ likes: count ?? 0 })
}

// ✅ POST — with IP-based deduplication
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { product_id, user_identifier } = await req.json()

  if (!product_id || !user_identifier) {
    return NextResponse.json(
      { error: 'product_id and user_identifier are required' },
      { status: 400 }
    )
  }

  // ✅ Extract IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  // 🔒 Check if product is sold
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('status')
    .eq('id', product_id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (product.status === 'sold') {
    const { count } = await supabase
      .from('product_likes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product_id)

    return NextResponse.json(
      { error: 'Cannot like a sold product', likes: count ?? 0 },
      { status: 403 }
    )
  }

  // ✅ Check by BOTH user_identifier AND ip_address
  const { data: existing, error: checkError } = await supabase
    .from('product_likes')
    .select('id')
    .eq('product_id', product_id)
    .or(`user_identifier.eq.${user_identifier},ip_address.eq.${ip}`)
    .maybeSingle()

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 })
  }

  if (existing) {
    const { count } = await supabase
      .from('product_likes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product_id)

    return NextResponse.json(
      { error: 'Already liked', likes: count ?? 0 },
      { status: 409 }
    )
  }

  // ✅ Insert with ip_address
  const { error: insertError } = await supabase
    .from('product_likes')
    .insert({ product_id, user_identifier, ip_address: ip })

  if (insertError) {
    // ✅ Handle race condition — UNIQUE constraint violation
    if (insertError.code === '23505') {
      const { count } = await supabase
        .from('product_likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product_id)

      return NextResponse.json(
        { error: 'Already liked', likes: count ?? 0 },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // ✅ Return real count
  const { count } = await supabase
    .from('product_likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', product_id)

  return NextResponse.json({ success: true, likes: count ?? 0 })
}