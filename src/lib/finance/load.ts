// src/lib/finance/load.ts
// Server-only: reads Supabase and maps rows into the pure domain model. Never trusts client-supplied totals.
// Works before the revenue-intelligence migration is applied: missing tables are reported, not fatal.

import type { SupabaseClient } from '@supabase/supabase-js'
import { previousRange } from './range'
import type {
  Attribution, Dataset, DeliveryStatus, OperatingExpense, OrderCost, PaymentMethod, Refund, Sale, SaleItem,
  SaleStatus, SpendRecord, Touchpoint, TrackEvent, CostCategory, ExpenseCategory,
} from './types'

type Row = Record<string, unknown>

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? Number(v) : (v as number)
  return Number.isFinite(n) ? n : 0
}
const numOrNull = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v))
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)
const day = (v: unknown): string => (typeof v === 'string' ? v.slice(0, 10) : '')

const SALE_STATUSES: SaleStatus[] = ['pending', 'completed', 'cancelled', 'failed_delivery']
const DELIVERY: DeliveryStatus[] = ['pending', 'shipped', 'delivered', 'failed', 'returned']
const PAYMENT: PaymentMethod[] = ['cod', 'prepaid', 'deposit', 'other']

export function mapSales(saleRows: Row[], itemRows: Row[]): Sale[] {
  const itemsBySale = new Map<string, Row[]>()
  for (const it of itemRows) {
    const key = String(it.sale_id)
    itemsBySale.set(key, [...(itemsBySale.get(key) ?? []), it])
  }

  return saleRows.map((r) => {
    const id = String(r.id)
    const status = SALE_STATUSES.includes(r.status as SaleStatus) ? (r.status as SaleStatus) : 'completed'
    const discount = num(r.discount_egp)
    const recordedNet = num(r.selling_price_egp)
    const rows = itemsBySale.get(id) ?? []
    const legacy = rows.length === 0

    let items: SaleItem[]
    if (legacy) {
      const cost = numOrNull(r.cost_egp)
      items = [{
        id: `${id}:legacy`,
        productId: numOrNull(r.product_id),
        productName: str(r.product_name) ?? 'Unknown product',
        quantity: 1,
        // stored price is already net of discount, so gross = net + recorded discount
        unitPrice: recordedNet + discount,
        // 0 almost always means "cost was never entered" (e.g. exchange rate left blank), so treat as missing
        unitCostSnapshot: cost !== null && cost > 0 ? cost : null,
      }]
    } else {
      items = rows.map((it) => ({
        id: String(it.id),
        productId: numOrNull(it.product_id),
        productName: str(it.product_name) ?? 'Unknown product',
        quantity: Math.max(1, Math.round(num(it.quantity) || 1)),
        unitPrice: num(it.unit_price_egp),
        unitCostSnapshot: numOrNull(it.unit_cost_egp_snapshot),
      }))
    }

    return {
      id,
      orderRef: str(r.order_ref),
      date: day(r.sale_date) || day(r.created_at),
      status,
      deliveryStatus: DELIVERY.includes(r.delivery_status as DeliveryStatus) ? (r.delivery_status as DeliveryStatus) : null,
      paymentMethod: PAYMENT.includes(r.payment_method as PaymentMethod) ? (r.payment_method as PaymentMethod) : null,
      channel: str(r.sale_channel) ?? 'unknown',
      items,
      discount,
      shippingRevenue: num(r.shipping_revenue_egp),
      cashCollected: numOrNull(r.cash_collected_egp),
      recordedNet,
      discountCode: str(r.discount_code),
      legacy,
    }
  })
}

/** The old sales.commission_egp column is read as a 'commission' order cost (never also stored in order_costs). */
export function mapLegacyCommission(saleRows: Row[]): OrderCost[] {
  return saleRows
    .filter((r) => num(r.commission_egp) > 0)
    .map((r) => ({
      id: `commission:${String(r.id)}`,
      saleId: String(r.id),
      category: 'commission' as CostCategory,
      amount: num(r.commission_egp),
      date: day(r.sale_date) || day(r.created_at),
      note: 'sales.commission_egp',
      source: 'legacy_commission' as const,
    }))
}

export function mapOrderCosts(rows: Row[]): OrderCost[] {
  return rows.map((r) => ({
    id: String(r.id), saleId: String(r.sale_id), category: r.category as CostCategory, amount: num(r.amount_egp),
    date: day(r.incurred_at), note: str(r.note), source: 'order_costs' as const,
  }))
}

export function mapRefunds(rows: Row[]): Refund[] {
  return rows.map((r) => ({
    id: String(r.id), saleId: String(r.sale_id), saleItemId: r.sale_item_id ? String(r.sale_item_id) : null,
    amount: num(r.amount_egp), returnedQuantity: Math.round(num(r.returned_quantity)), restocked: r.restocked === true,
    date: day(r.refunded_at), reason: str(r.reason),
  }))
}

export function mapExpenses(rows: Row[]): OperatingExpense[] {
  return rows.map((r) => ({
    id: String(r.id), category: r.category as ExpenseCategory, amount: num(r.amount_egp), date: day(r.expense_date), note: str(r.note),
  }))
}

export function mapSpend(rows: Row[]): SpendRecord[] {
  return rows.map((r) => ({
    id: String(r.id), platform: String(r.platform), campaign: String(r.campaign), date: day(r.spend_date), amountEgp: num(r.amount_egp),
  }))
}

export function mapAttributions(rows: Row[]): Attribution[] {
  const bySale = new Map<string, Attribution>()
  for (const r of rows) {
    // one attribution per sale: keep the first row if the data ever contains more than one
    if (bySale.has(String(r.sale_id))) continue
    bySale.set(String(r.sale_id), {
      saleId: String(r.sale_id), firstTouchSource: str(r.first_touch_source), lastNonDirectSource: str(r.last_non_direct_source),
      closingChannel: str(r.closing_channel), utmSource: str(r.utm_source), utmMedium: str(r.utm_medium),
      utmCampaign: str(r.utm_campaign), utmContent: str(r.utm_content),
      model: (['first_touch', 'last_non_direct', 'manual', 'unknown'].includes(String(r.model)) ? r.model : 'manual') as Attribution['model'],
      status: r.status === 'attributed' ? 'attributed' : 'unknown',
    })
  }
  return [...bySale.values()]
}

export function mapTouchpoints(rows: Row[]): Touchpoint[] {
  return rows.map((r) => ({
    id: String(r.id), event: r.event as TrackEvent, visitorId: str(r.visitor_id), date: day(r.occurred_at),
    utmSource: str(r.utm_source), utmMedium: str(r.utm_medium), utmCampaign: str(r.utm_campaign),
  }))
}

const PAGE = 1000

async function fetchAll(supabase: SupabaseClient, table: string, missing: string[]): Promise<Row[]> {
  const out: Row[] = []
  for (let from = 0; ; from += PAGE) {
    const res = await supabase.from(table).select('*').range(from, from + PAGE - 1)
    if (res.error) {
      if (res.error.code === 'PGRST205' || res.error.code === '42P01') { missing.push(table); return [] }
      throw new Error(`${table}: ${res.error.message}`)
    }
    out.push(...((res.data as Row[]) ?? []))
    if (!res.data || res.data.length < PAGE) break
  }
  return out
}

/**
 * Loads everything needed to analyse [from, to] and the equal previous period.
 * Row volumes are small (hundreds), so each table is read in full pages and filtered in memory;
 * touchpoints can be large so they are date- and event-filtered in the query.
 */
export async function loadDataset(supabase: SupabaseClient, range: { from: string; to: string }): Promise<Dataset> {
  const missing: string[] = []
  const prev = previousRange(range.from, range.to)
  const minDate = prev.from

  const [saleRows, itemRows, refundRows, costRows, expenseRows, spendRows, attrRows] = await Promise.all([
    fetchAll(supabase, 'sales', missing),
    fetchAll(supabase, 'sale_items', missing),
    fetchAll(supabase, 'refunds', missing),
    fetchAll(supabase, 'order_costs', missing),
    fetchAll(supabase, 'operating_expenses', missing),
    fetchAll(supabase, 'marketing_spend', missing),
    fetchAll(supabase, 'sales_attribution', missing),
  ])

  let touchRows: Row[] = []
  const tp = await supabase
    .from('marketing_touchpoints')
    .select('id, event, visitor_id, occurred_at, utm_source, utm_medium, utm_campaign')
    .in('event', ['product_request_submitted', 'reservation_created', 'contact_click', 'whatsapp_click', 'lead_qualified'])
    .gte('occurred_at', minDate)
    .limit(20000)
  if (tp.error) {
    if (tp.error.code === 'PGRST205' || tp.error.code === '42P01') missing.push('marketing_touchpoints')
    else throw new Error(`marketing_touchpoints: ${tp.error.message}`)
  } else touchRows = (tp.data as Row[]) ?? []

  const sales = mapSales(saleRows.filter((r) => day(r.sale_date) >= minDate || !r.sale_date), itemRows)
  const saleIds = new Set(sales.map((s) => s.id))

  return {
    sales,
    refunds: mapRefunds(refundRows).filter((r) => saleIds.has(r.saleId)),
    orderCosts: [
      ...mapOrderCosts(costRows).filter((c) => saleIds.has(c.saleId)),
      ...mapLegacyCommission(saleRows).filter((c) => saleIds.has(c.saleId)),
    ],
    expenses: mapExpenses(expenseRows),
    spend: mapSpend(spendRows),
    attributions: mapAttributions(attrRows).filter((a) => saleIds.has(a.saleId)),
    touchpoints: mapTouchpoints(touchRows),
    missingTables: [...new Set(missing)],
  }
}
