// src/types/reservation.ts

import { ProductStatus } from './product'

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export interface ReservationProduct {
  id: number
  title: string
  status: ProductStatus
}

export interface Reservation {
  id: number
  name: string
  phone: string
  note: string | null
  status: ReservationStatus
  created_at: string
  product: ReservationProduct | ReservationProduct[] | null
  // ✅ New fields
  discount_code: string | null
  discounted_price: number | null
}