// src/lib/finance/types.ts
// Domain model for the revenue-intelligence layer. All money is EGP. Dates are 'YYYY-MM-DD' strings.
// These types are database-agnostic: load.ts maps Supabase rows into them, everything else is pure.

export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'failed_delivery'
export type DeliveryStatus = 'pending' | 'shipped' | 'delivered' | 'failed' | 'returned'
export type PaymentMethod = 'cod' | 'prepaid' | 'deposit' | 'other'

export type CostCategory =
  | 'outbound_shipping'
  | 'return_shipping'
  | 'packaging'
  | 'payment_fee'
  | 'failed_delivery'
  | 'other_variable'
  | 'commission' // legacy sales.commission_egp, read-only mapping

export const COST_CATEGORIES: CostCategory[] = [
  'outbound_shipping',
  'return_shipping',
  'packaging',
  'payment_fee',
  'failed_delivery',
  'other_variable',
  'commission',
]

export type ExpenseCategory =
  | 'rent' | 'salaries' | 'software' | 'tools' | 'accounting' | 'transport' | 'other'
  | 'tax' | 'interest'

/** Categories below the operating-profit line. */
export const BELOW_OPERATING_LINE: ExpenseCategory[] = ['tax', 'interest']

export interface SaleItem {
  id: string
  productId: number | null
  productName: string
  quantity: number
  unitPrice: number
  /** Cost per unit frozen when the sale was recorded. null = never recorded. */
  unitCostSnapshot: number | null
}

export interface Sale {
  id: string
  orderRef: string | null
  date: string
  status: SaleStatus
  deliveryStatus: DeliveryStatus | null
  paymentMethod: PaymentMethod | null
  channel: string
  items: SaleItem[]
  discount: number
  shippingRevenue: number
  /** Cash actually received for this order. null = not recorded. */
  cashCollected: number | null
  /** Amount charged for products after discount, as stored on the sale row (used for reconciliation). */
  recordedNet: number
  discountCode: string | null
  /** true when the row predates the revenue-intelligence tables (items synthesised from the sale row). */
  legacy: boolean
}

export interface Refund {
  id: string
  saleId: string
  saleItemId: string | null
  amount: number
  returnedQuantity: number
  restocked: boolean
  date: string
  reason: string | null
}

export interface OrderCost {
  id: string
  saleId: string
  category: CostCategory
  amount: number
  date: string
  note: string | null
  source: 'order_costs' | 'legacy_commission'
}

export interface OperatingExpense {
  id: string
  category: ExpenseCategory
  amount: number
  date: string
  note: string | null
}

export interface SpendRecord {
  id: string
  platform: string
  campaign: string
  date: string
  amountEgp: number
}

export type AttributionStatus = 'attributed' | 'unknown'

export interface Attribution {
  saleId: string
  firstTouchSource: string | null
  lastNonDirectSource: string | null
  closingChannel: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  model: 'first_touch' | 'last_non_direct' | 'manual' | 'unknown'
  status: AttributionStatus
}

export type TrackEvent =
  | 'page_view' | 'product_view' | 'product_request_submitted' | 'reservation_created'
  | 'contact_click' | 'whatsapp_click' | 'checkout_started' | 'order_created'
  | 'payment_confirmed' | 'order_delivered' | 'sale_completed' | 'refund_issued' | 'lead_qualified'

export const TRACK_EVENTS: TrackEvent[] = [
  'page_view', 'product_view', 'product_request_submitted', 'reservation_created',
  'contact_click', 'whatsapp_click', 'checkout_started', 'order_created',
  'payment_confirmed', 'order_delivered', 'sale_completed', 'refund_issued', 'lead_qualified',
]

export interface Touchpoint {
  id: string
  event: TrackEvent
  visitorId: string | null
  date: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

/** Everything the engine needs. Built by load.ts (or by tests). */
export interface Dataset {
  sales: Sale[]
  refunds: Refund[]
  orderCosts: OrderCost[]
  expenses: OperatingExpense[]
  spend: SpendRecord[]
  attributions: Attribution[]
  touchpoints: Touchpoint[]
  /** Reporting tables that were not available (e.g. migration not applied). */
  missingTables: string[]
}

export interface Filters {
  from: string
  to: string
  channel?: string
  source?: string
  campaign?: string
  product?: string
  orderStatus?: SaleStatus
  deliveryStatus?: DeliveryStatus
  /** Only used by the costs report. */
  costCategory?: string
}
