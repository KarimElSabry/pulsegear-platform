// src/types/deals.ts

// ─── Deal Status ─────────────────────────────────────────────────────────────

export type DealStatus =
  | 'deposit_pending'
  | 'deposit_paid'
  | 'sourcing'
  | 'purchased'
  | 'shipping'
  | 'arrived_egypt'
  | 'out_for_delivery'
  | 'delivered'
  | 'remaining_pending'
  | 'completed'
  | 'cancelled'

// ─── Sale Channel ────────────────────────────────────────────────────────────

export type SaleChannel =
  | 'whatsapp'
  | 'instagram'
  | 'website'
  | 'personal'
  | 'other'

// ─── Source Platform ─────────────────────────────────────────────────────────

export type SourcePlatform =
  | 'Kleinanzeigen'
  | 'Vinted'
  | 'Amazon'
  | 'eBay'
  | 'Other'

// ─── Product Request Relation ─────────────────────────────────────────────────

export interface DealProductRequest {
  id: number
  requested_product: string | null
  budget: number | null
  customer_name: string | null
  phone?: string | null
  customer_phone?: string | null
  instagram?: string | null
  customer_instagram?: string | null
}

// ─── Deal ─────────────────────────────────────────────────────────────────────

export interface Deal {
  id: string
  product_request_id: number | null

  // Customer
  customer_name: string | null
  phone: string | null
  customer_instagram: string | null

  // Status
  status: DealStatus

  // Source
  source_link: string | null
  source_platform: string | null
  source_price_eur: number | null
  shipping_eur: number | null

  // Financials
  exchange_rate: number | null
  selling_price_egp: number | null
  deposit_amount_egp: number | null
  remaining_amount_egp: number | null
  commission_egp: number | null
  sale_channel: SaleChannel

  // Status timestamps
  deposit_paid_at: string | null
  shipped_at: string | null
  arrived_egypt_at: string | null
  delivered_at: string | null
  remaining_paid_at: string | null

  // Notes and cancellation
  notes: string | null
  cancellation_reason: string | null

  // Metadata
  created_at: string
  updated_at: string

  // Relation returned by getDeals() as an object
  product_request: DealProductRequest | null
}

// ─── Deal Status Options ──────────────────────────────────────────────────────

export const DEAL_STATUSES: {
  value: DealStatus
  label: string
  color: string
}[] = [
  {
    value: 'deposit_pending',
    label: '⏳ Deposit Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'deposit_paid',
    label: '💰 Deposit Paid',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'sourcing',
    label: '🔍 Sourcing',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'purchased',
    label: '🛒 Purchased',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'shipping',
    label: '🚢 Shipping',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    value: 'arrived_egypt',
    label: '🇪🇬 Arrived Egypt',
    color: 'bg-teal-100 text-teal-800',
  },
  {
    value: 'out_for_delivery',
    label: '🚗 Out for Delivery',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: 'delivered',
    label: '📦 Delivered',
    color: 'bg-cyan-100 text-cyan-800',
  },
  {
    value: 'remaining_pending',
    label: '💳 Remaining Pending',
    color: 'bg-pink-100 text-pink-800',
  },
  {
    value: 'completed',
    label: '✅ Completed',
    color: 'bg-emerald-100 text-emerald-800',
  },
  {
    value: 'cancelled',
    label: '❌ Cancelled',
    color: 'bg-red-100 text-red-800',
  },
]

// ─── Sale Channel Options ─────────────────────────────────────────────────────

export const SALE_CHANNELS: {
  value: SaleChannel
  label: string
  icon: string
}[] = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: '📸',
  },
  {
    value: 'website',
    label: 'Website',
    icon: '🌐',
  },
  {
    value: 'personal',
    label: 'Personal',
    icon: '🤝',
  },
  {
    value: 'other',
    label: 'Other',
    icon: '📦',
  },
]

// ─── Source Platform Options ──────────────────────────────────────────────────

export const SOURCE_PLATFORMS: SourcePlatform[] = [
  'Kleinanzeigen',
  'Vinted',
  'Amazon',
  'eBay',
  'Other',
]