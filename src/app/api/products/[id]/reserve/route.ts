// src/app/api/products/[id]/reserve/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ReservationService } from '@/services/reservationService'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'

function normalizeDiscountCode(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()
  return normalized.length > 0 ? normalized : null
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const productId = Number(rawId)

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    }

    const body = await req.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const note = typeof body?.note === 'string' ? body.note.trim() : ''
    const discountCode = normalizeDiscountCode(body?.discount_code)

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminSupabaseClient()
    const authSupabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await authSupabase.auth.getUser()

    const { data: product, error: productError } = await adminSupabase
      .from('products')
      .select('id, title, price_egp, status, reserved_until, is_reservable, discount_enabled')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // The admin decides per product with the "reservation" toggle. Enforce it on the
    // server, the hidden button in the UI is not a security boundary.
    if (product.is_reservable !== true) {
      return NextResponse.json(
        { error: 'This product cannot be reserved' },
        { status: 403 }
      )
    }

    // Same for the "Allow Discount Codes" toggle.
    if (discountCode && product.discount_enabled === false) {
      return NextResponse.json(
        { error: 'Discount codes cannot be used on this product' },
        { status: 400 }
      )
    }

    const result = await ReservationService.createReservation({
      productId,
      customerName: name,
      customerPhone: phone,
      note: note || null,
      discountCode,
      userId: user?.id ?? null,
      basePriceEgp: Number(product.price_egp) || 0,
    })

    revalidatePath('/products')
    revalidatePath(`/products/${rawId}`)
    revalidatePath('/admin/reservations')
    revalidatePath('/admin/analytics')
    revalidatePath('/account/reservations')

    return NextResponse.json(
      {
        success: true,
        reservation: result.reservation,
        final_price_egp: result.finalPriceEgp,
        applied_discount_code: result.discountCode,
      },
      { status: 200 }
    )
  } catch (error: any) {
    const message = error?.message || 'Unexpected server error'

    if (message === 'PRODUCT_NOT_AVAILABLE') {
      return NextResponse.json(
        { error: 'This product is no longer available' },
        { status: 409 }
      )
    }

    if (message === 'INVALID_DISCOUNT_CODE') {
      return NextResponse.json(
        { error: 'Discount code is invalid or no longer active' },
        { status: 400 }
      )
    }

    if (message === 'PRODUCT_NOT_RESERVABLE') {
      return NextResponse.json(
        { error: 'This product cannot be reserved' },
        { status: 403 }
      )
    }

    console.error('POST /api/products/[id]/reserve failed:', error)

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}