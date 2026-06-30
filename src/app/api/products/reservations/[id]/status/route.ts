// src/app/api/reservations/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/services/reservationService'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await req.json()

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updated = await ReservationService.updateStatus(
      Number(id),
      status as 'confirmed' | 'cancelled'
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}