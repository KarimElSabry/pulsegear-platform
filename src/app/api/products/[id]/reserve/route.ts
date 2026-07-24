import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/services/reservationService'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { ProductCondition } from '@/types/product'

const RESERVABLE_CONDITIONS: ProductCondition[] = [
  'Very good',
  'Good',
  'New without tags',
  'Satisfactory',
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const product_id = parseInt(rawId)
    const { name, phone, note, discount_code, discounted_price } = await req.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // ── Fetch product ──
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, condition, status')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!RESERVABLE_CONDITIONS.includes(product.condition)) {
      return NextResponse.json(
        { error: 'This product condition is not eligible for reservation' },
        { status: 403 }
      )
    }

    if (product.status !== 'available') {
      return NextResponse.json(
        { error: 'This product is no longer available' },
        { status: 409 }
      )
    }

    // ── ✅ Validate & lock discount code if provided ──
    let resolvedDiscountCode: string | null = null
    let resolvedDiscountedPrice: number | null = null

    if (discount_code) {
      const { data: codeData, error: codeError } = await supabase
        .from('discount_codes')
        .select('id, code, discount_percent, is_active, usage_count')
        .ilike('code', discount_code.trim())
        .single()

      if (codeError || !codeData || !codeData.is_active) {
        return NextResponse.json(
          { error: 'Discount code is invalid or no longer active' },
          { status: 400 }
        )
      }

      // ✅ Increment usage_count هنا — بعد الحجز الفعلي
      await supabase
        .from('discount_codes')
        .update({ usage_count: (codeData.usage_count ?? 0) + 1 })
        .eq('id', codeData.id)

      resolvedDiscountCode = codeData.code
      resolvedDiscountedPrice = discounted_price ?? null
    }

    // ── ✅ Create reservation with discount info ──
    const reservation = await ReservationService.createReservation({
      product_id,
      name,
      phone,
      note,
      discount_code: resolvedDiscountCode,
      discounted_price: resolvedDiscountedPrice,
    })

    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath(`/products/${rawId}`)
    revalidatePath('/admin')

    return NextResponse.json({ success: true, reservation })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}