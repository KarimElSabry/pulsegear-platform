// src/app/api/reservations/[id]/status/route.ts
// Admin only. Confirms/cancels a reservation and keeps the product row in sync
// (cancelling releases the product back to "available").
// Replaces the old src/app/api/products/reservations/[id]/status/route.ts,
// which the admin UI never reached (wrong URL) and which never freed products.

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { ReservationService } from '@/services/reservationService'

const STATUSES = ['pending', 'confirmed', 'cancelled'] as const
type Status = (typeof STATUSES)[number]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(req)
  if (denied) return denied

  const { id } = await params
  const reservationId = Number(id)
  if (!Number.isInteger(reservationId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: { status?: unknown; admin_note?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status = body.status as Status | undefined
  if (status !== undefined && !STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (body.admin_note !== undefined && typeof body.admin_note !== 'string') {
    return NextResponse.json({ error: 'admin_note must be a string' }, { status: 400 })
  }

  try {
    if (typeof body.admin_note === 'string') {
      const supabase = createAdminSupabaseClient()
      const { error } = await supabase
        .from('reservations')
        .update({ admin_note: body.admin_note.slice(0, 2000) })
        .eq('id', reservationId)
      if (error) throw error
    }

    if (status === 'confirmed' || status === 'cancelled') {
      await ReservationService.updateStatus(reservationId, status)
    } else if (status === 'pending') {
      const supabase = createAdminSupabaseClient()
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'pending' })
        .eq('id', reservationId)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[reservations/status] error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
  }
}
