// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/products?ids=1&ids=2&ids=3
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // ✅ Wishlist fetch — by IDs
  const ids = searchParams.getAll('ids').map(Number).filter(Boolean)

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .in('id', ids)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  // ✅ General fetch — all products with filters
  const brand    = searchParams.get('brand')
  const category = searchParams.get('category')
  const status   = searchParams.get('status')
  const featured = searchParams.get('featured')
  const is_deal  = searchParams.get('is_deal')
  const search   = searchParams.get('search')
  const page     = Number(searchParams.get('page')  ?? 1)
  const limit    = Number(searchParams.get('limit') ?? 12)
  const from     = (page - 1) * limit
  const to       = from + limit - 1

  let query = supabase
    .from('products')
    .select('*, images:product_images(*)', { count: 'exact' })

  if (brand)    query = query.eq('brand',    brand)
  if (category) query = query.eq('category', category)
  if (status)   query = query.eq('status',   status)
  if (featured) query = query.eq('featured', featured === 'true')
  if (is_deal)  query = query.eq('is_deal',  is_deal  === 'true')
  if (search)   query = query.ilike('title', `%${search}%`)

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    total:   count ?? 0,
    page,
    limit,
    hasMore: to < (count ?? 0) - 1,
  })
}