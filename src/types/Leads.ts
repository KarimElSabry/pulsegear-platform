// src/types/leads.ts

export type LeadStatus = 'new' | 'pending' | 'contacted' | 'converted' | 'lost'

export type LeadSource = 'reservation' | 'product_request'

export interface Lead {
  id: number
  source: LeadSource
  name: string
  phone: string
  email?: string
  instagram?: string
  status: LeadStatus
  admin_note?: string
  created_at: string
  // Reservation specific
  product_title?: string
  product_id?: number
  discount_code?: string
  discounted_price?: number
  note?: string
  // Product Request specific
  requested_product?: string
  budget?: number
  condition?: string
}