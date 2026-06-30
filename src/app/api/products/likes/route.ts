import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// ✅ GET — جيب عدد الـ Likes لمنتج معين
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

// ✅ POST — أضيف Like جديد
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { product_id } = await req.json()

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('product_likes')
    .insert({ product_id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}