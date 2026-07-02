import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/products/likes?product_id=10
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const product_id = searchParams.get('product_id')

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  const { count, error } = await supabase
    .from('product_likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', Number(product_id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ likes: count ?? 0 })
}

// POST /api/products/likes
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { product_id, user_identifier } = body

  if (!product_id || !user_identifier) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('product_likes')
    .select('id')
    .eq('product_id', product_id)
    .eq('user_identifier', user_identifier)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already liked' }, { status: 403 })
  }

  // Insert like
  const { error } = await supabase
    .from('product_likes')
    .insert({ product_id, user_identifier })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return updated count
  const { count } = await supabase
    .from('product_likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', product_id)

  return NextResponse.json({ likes: count ?? 0 })
}