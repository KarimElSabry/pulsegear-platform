import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// ✅ GET
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

// ✅ POST
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { product_id, user_identifier } = await req.json()

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  // ✅ تحقق إن الـ like مش موجود
  const { data: existing } = await supabase
    .from('product_likes')
    .select('id')
    .eq('product_id', product_id)
    .eq('user_identifier', user_identifier)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already liked' }, { status: 409 })
  }

  // ✅ ضيف الـ like
  const { error } = await supabase
    .from('product_likes')
    .insert({ product_id, user_identifier })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ✅ رجّع الـ count الجديد
  const { count } = await supabase
    .from('product_likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', product_id)

  return NextResponse.json({ success: true, likes: count ?? 0 })
}