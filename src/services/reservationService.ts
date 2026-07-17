// src/services/reservationService.ts

import { createClient } from '@supabase/supabase-js'
import { Reservation } from '@/types/reservation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const ReservationService = {
  async getAllReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id, name, phone, note, status, created_at,
        discount_code, discounted_price,
        product:products(id, title, status)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as Reservation[]
  },

  // ✅ بيقبل discount_code و discounted_price دلوقتي
  async createReservation(data: {
    product_id: number
    name: string
    phone: string
    note?: string
    discount_code?: string | null
    discounted_price?: number | null
  }) {
    const { data: result, error } = await supabase
      .from('reservations')
      .insert({ ...data, status: 'pending' })
      .select()
      .single()

    if (error) throw error
    return result
  },

  async updateStatus(id: number, status: 'confirmed' | 'cancelled') {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}