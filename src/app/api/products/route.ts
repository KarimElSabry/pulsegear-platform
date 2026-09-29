// src/app/api/products/likes/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

function getIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient()
    const params = req.nextUrl.searchParams

    // Batch form: ?product_ids=1,2,3  ->  { likes: { "1": 4, "2": 0, "3": 9 } }
    const idsParam = params.get('product_ids')
    if (idsParam !== null) {
      const ids = [
        ...new Set(
          idsParam
            .split(',')
            .map((v) => Number(v))
            .filter((n) => Number.isInteger(n) && n > 0)
        ),
      ].slice(0, 300)

      if (ids.length === 0) {
        return NextResponse.json({ error: 'product_ids must contain valid ids' }, { status: 400 })
      }

      const { data, error } = await supabase.from('product_likes').select('product_id').in('product_id', ids)
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 })
      }

      const likes: Record<number, number> = Object.fromEntries(ids.map((id) => [id, 0]))
      for (const row of data ?? []) likes[Number(row.product_id)] = (likes[Number(row.product_id)] ?? 0) + 1

      return NextResponse.json(
        { likes },
        { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } }
      )
    }

    // Single form (kept for compatibility): ?product_id=1  ->  { likes: 4 }
    const productId = params.get('product_id')
    if (!productId) {
      return NextResponse.json({ error: 'product_id or product_ids is required' }, { status: 400 })
    }

    const { count, error } = await supabase
      .from('product_likes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 })
    }

    return NextResponse.json({ likes: count ?? 0 }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient()
    const body = await req.json()

    const productId = Number(body?.product_id)
    const userIdentifier =
      typeof body?.user_identifier === 'string' ? body.user_identifier.trim() : ''

    if (!Number.isInteger(productId) || productId <= 0 || !userIdentifier) {
      return NextResponse.json(
        { error: 'product_id and user_identifier are required' },
        { status: 400 }
      )
    }

    const ip = getIp(req)

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, status')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status === 'sold') {
      const { count } = await supabase
        .from('product_likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)

      return NextResponse.json(
        { error: 'Cannot like a sold product', likes: count ?? 0 },
        { status: 403 }
      )
    }

    const { data: existing, error: checkError } = await supabase
      .from('product_likes')
      .select('id')
      .eq('product_id', productId)
      .or(`user_identifier.eq.${userIdentifier},ip_address.eq.${ip}`)
      .maybeSingle()

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existing) {
      const { count } = await supabase
        .from('product_likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)

      return NextResponse.json(
        { error: 'Already liked', likes: count ?? 0 },
        { status: 409 }
      )
    }

    const { error: insertError } = await supabase
      .from('product_likes')
      .insert({
        product_id: productId,
        user_identifier: userIdentifier,
        ip_address: ip,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        const { count } = await supabase
          .from('product_likes')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', productId)

        return NextResponse.json(
          { error: 'Already liked', likes: count ?? 0 },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const { count } = await supabase
      .from('product_likes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    return NextResponse.json({ success: true, likes: count ?? 0 }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add like' }, { status: 500 })
  }
}