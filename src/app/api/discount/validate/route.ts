// src/app/api/discount/validate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { code, productId } = await req.json()

    const normalizedCode = String(code ?? '').trim().toUpperCase()
    const normalizedProductId = Number(productId)

    if (!normalizedCode) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    if (!normalizedProductId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, discount_enabled, status')
      .eq('id', normalizedProductId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status !== 'available') {
      return NextResponse.json(
        { error: 'Discounts are only allowed for available products' },
        { status: 400 }
      )
    }

    if (!product.discount_enabled) {
      return NextResponse.json(
        { error: 'Discount codes are disabled for this product' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .select('id, code, discount_percent, is_active')
      .eq('code', normalizedCode)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 })
    }

    if (!data.is_active) {
      return NextResponse.json(
        { error: 'This code is no longer active' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      code: data.code,
      discount_percent: data.discount_percent,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}