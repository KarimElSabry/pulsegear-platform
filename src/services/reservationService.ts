// src/services/reservationService.ts

import { createAdminSupabaseClient } from '@/lib/supabase'
import { Reservation } from '@/types/reservation'

const RESERVATION_HOURS = 24

function getReservedUntilIso() {
  const date = new Date()
  date.setHours(date.getHours() + RESERVATION_HOURS)
  return date.toISOString()
}

function normalizeDiscountPercent(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 100) return 100
  return n
}

export const ReservationService = {
  async getAllReservations(): Promise<Reservation[]> {
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id, name, phone, note, status, created_at,
        discount_code, discounted_price, user_id,
        product:products(id, title, status)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as Reservation[]
  },

  async createReservation(input: {
    productId: number
    customerName: string
    customerPhone: string
    note?: string | null
    discountCode?: string | null
    userId?: string | null
    expectedProductStatus?: string
    basePriceEgp: number
  }) {
    const supabase = createAdminSupabaseClient()

    const normalizedCode = input.discountCode?.trim().toUpperCase() || null
    let appliedDiscountCode: string | null = null
    let discountPercent = 0

    if (normalizedCode) {
      const { data: codeData, error: codeError } = await supabase
        .from('discount_codes')
        .select('id, code, discount_percent, is_active, usage_count')
        .eq('code', normalizedCode)
        .single()

      if (codeError || !codeData || !codeData.is_active) {
        throw new Error('INVALID_DISCOUNT_CODE')
      }

      discountPercent = normalizeDiscountPercent(codeData.discount_percent)
      appliedDiscountCode = codeData.code
    }

    const basePriceEgp = Number(input.basePriceEgp) || 0
    const finalPriceEgp =
      discountPercent > 0
        ? Math.max(0, Math.round(basePriceEgp * (1 - discountPercent / 100)))
        : basePriceEgp

    const reservedUntil = getReservedUntilIso()

    const { data: updatedProducts, error: lockError } = await supabase
      .from('products')
      .update({
        status: 'reserved',
        reserved_until: reservedUntil,
      })
      .eq('id', input.productId)
      .eq('status', 'available')
      .select('id, title, status, reserved_until')

    if (lockError) {
      throw lockError
    }

    if (!updatedProducts || updatedProducts.length !== 1) {
      throw new Error('PRODUCT_NOT_AVAILABLE')
    }

    const lockedProduct = updatedProducts[0]

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        product_id: input.productId,
        name: input.customerName,
        phone: input.customerPhone,
        note: input.note ?? null,
        status: 'pending',
        discount_code: appliedDiscountCode,
        discounted_price: finalPriceEgp,
        user_id: input.userId ?? null,
      })
      .select()
      .single()

    if (reservationError) {
      await supabase
        .from('products')
        .update({
          status: 'available',
          reserved_until: null,
        })
        .eq('id', input.productId)

      throw reservationError
    }

    if (appliedDiscountCode) {
      const { data: codeData } = await supabase
        .from('discount_codes')
        .select('id, usage_count')
        .eq('code', appliedDiscountCode)
        .single()

      if (codeData?.id) {
        await supabase
          .from('discount_codes')
          .update({ usage_count: (codeData.usage_count ?? 0) + 1 })
          .eq('id', codeData.id)
      }
    }

    return {
      reservation,
      product: lockedProduct,
      finalPriceEgp,
      discountCode: appliedDiscountCode,
    }
  },

  async updateStatus(id: number, status: 'confirmed' | 'cancelled') {
    const supabase = createAdminSupabaseClient()

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select('id, product_id, status')
      .eq('id', id)
      .single()

    if (reservationError || !reservation) throw reservationError ?? new Error('Reservation not found')

    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (status === 'cancelled' && reservation.product_id) {
      await supabase
        .from('products')
        .update({
          status: 'available',
          reserved_until: null,
        })
        .eq('id', reservation.product_id)
        .eq('status', 'reserved')
    }

    return data
  },
}