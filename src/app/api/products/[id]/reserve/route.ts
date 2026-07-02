import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/services/reservationService'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { ProductCondition } from '@/types/product'

// ✅ Conditions that are allowed to be reserved
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

    // ✅ Validate inputs
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // ✅ Fetch product to check condition
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, condition, status')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // ✅ Block if condition is not allowed
    if (!RESERVABLE_CONDITIONS.includes(product.condition)) {
      return NextResponse.json(
        { error: 'This product condition is not eligible for reservation' },
        { status: 403 }
      )
    }

    // ✅ Block if product is not available
    if (product.status !== 'available') {
      return NextResponse.json(
        { error: 'This product is no longer available' },
        { status: 409 }
      )
    }

    const reservation = await ReservationService.createReservation({
      product_id,
      name,
      phone,
      note,
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