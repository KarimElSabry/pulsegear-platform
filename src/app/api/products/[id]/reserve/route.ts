import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/services/reservationService'
import { revalidatePath } from 'next/cache'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const product_id = parseInt(rawId)
    const { name, phone, note } = await req.json()

    // ✅ Validate inputs
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
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