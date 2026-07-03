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

// ✅ POST — with sold lock
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { product_id, user_identifier } = await req.json()

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  // 🔒 Check if product is sold — block likes if so
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('status')
    .eq('id', product_id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (product.status === 'sold') {
    // ✅ Still return the current likes count so UI stays accurate
    const { count } = await supabase
      .from('product_likes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product_id)

    return NextResponse.json(
      { error: 'Cannot like a sold product', likes: count ?? 0 },
      { status: 403 }
    )
  }

  // ✅ Check if already liked
  const { data: existing } = await supabase
    .from('product_likes')
    .select('id')
    .eq('product_id', product_id)
    .eq('user_identifier', user_identifier)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already liked' }, { status: 409 })
  }

  // ✅ Insert like
  const { error } = await supabase
    .from('product_likes')
    .insert({ product_id, user_identifier })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ✅ Return new count
  const { count } = await supabase
    .from('product_likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', product_id)

  return NextResponse.json({ success: true, likes: count ?? 0 })
}