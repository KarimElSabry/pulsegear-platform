// src/lib/orders.ts
// Pure helpers for "my orders": the status timeline a customer sees, the whitelist of fields they may see,
// and account suggestions for the admin. No database access here, so it is unit tested without Supabase.

import { phoneKey } from '@/lib/customers'

export interface DealLite {
  id: string
  status: string
  customer_name?: string | null
  phone?: string | null
  user_id?: string | null
  product_request_id?: number | null
  created_at?: string | null
  deposit_paid_at?: string | null
  shipped_at?: string | null
  arrived_egypt_at?: string | null
  delivered_at?: string | null
  selling_price_egp?: number | string | null
  deposit_amount_egp?: number | string | null
  remaining_amount_egp?: number | string | null
  tracking_number?: string | null
  carrier?: string | null
  customer_message?: string | null
  order_code?: string | null
  expected_delivery_date?: string | null
}

export interface TimelineStep { key: string; label: string; state: 'done' | 'current' | 'upcoming'; at: string | null }

/** One update you posted: a status change and/or a comment, with the exact time. All of it is visible to the customer. */
export interface OrderEventLite { id?: string; status: string | null; title: string; comment: string | null; created_at: string }
export interface PublicEvent { title: string; comment: string | null; at: string }

/** How far along an order is. Statuses the customer sees as the same step share a rank. */
const RANK: Record<string, number> = {
  deposit_pending: 0, deposit_paid: 0, sourcing: 1, purchased: 2, shipping: 3, arrived_egypt: 4,
  egypt_handling: 5, out_for_delivery: 6, delivered: 7, remaining_pending: 7, completed: 7,
}
const DELIVERED_RANK = 7

/** The words the customer sees for each status (also the title of the update in the log). */
const STATUS_LABEL: Record<string, string> = {
  deposit_pending: 'Order received', deposit_paid: 'Order received', sourcing: 'We are sourcing your item',
  purchased: 'Item purchased', shipping: 'On its way from Europe', arrived_egypt: 'Arrived in Egypt',
  egypt_handling: 'Shipping handling in Egypt', out_for_delivery: 'Out for delivery', delivered: 'Delivered',
  remaining_pending: 'Delivered', completed: 'Completed. Thank you!', cancelled: 'Order cancelled',
}

/** Which timeline step a status belongs to (used to date each step from the update log). */
const STEP_OF_STATUS: Record<string, string> = {
  deposit_pending: 'received', deposit_paid: 'received', sourcing: 'sourcing', purchased: 'purchased', shipping: 'shipping',
  arrived_egypt: 'arrived', egypt_handling: 'handling', out_for_delivery: 'out', delivered: 'delivered', remaining_pending: 'delivered', completed: 'delivered',
}

const STEPS: { key: string; label: string; rank: number; at: (d: DealLite) => string | null | undefined }[] = [
  { key: 'received', label: 'Order received', rank: 0, at: d => d.created_at },
  { key: 'sourcing', label: 'We are sourcing your item', rank: 1, at: () => null },
  { key: 'purchased', label: 'Item purchased', rank: 2, at: () => null },
  { key: 'shipping', label: 'On its way from Europe', rank: 3, at: d => d.shipped_at },
  { key: 'arrived', label: 'Arrived in Egypt', rank: 4, at: d => d.arrived_egypt_at },
  { key: 'handling', label: 'Shipping handling in Egypt', rank: 5, at: () => null },
  { key: 'out', label: 'Out for delivery', rank: 6, at: () => null },
  { key: 'delivered', label: 'Delivered', rank: 7, at: d => d.delivered_at },
]

export function isCancelled(status: string): boolean { return status === 'cancelled' }

/**
 * Steps with done / current / upcoming. A cancelled order has no timeline. Each reached step shows the time of the
 * latest update you posted for it, or the date saved on the order when there is no update yet.
 */
export function buildTimeline(deal: DealLite, events: OrderEventLite[] = []): TimelineStep[] {
  if (isCancelled(deal.status)) return []
  const rank = RANK[deal.status] ?? 0
  const latest = new Map<string, string>()
  for (const e of events) {
    const step = e.status ? STEP_OF_STATUS[e.status] : undefined
    if (step && (!latest.has(step) || latest.get(step)! < e.created_at)) latest.set(step, e.created_at)
  }
  return STEPS.map(s => ({
    key: s.key,
    label: s.label,
    // the last step is "done" once delivered, every other step at the current rank is "current"
    state: s.rank < rank || (s.rank === rank && rank === DELIVERED_RANK) ? 'done' : s.rank === rank ? 'current' : 'upcoming',
    at: s.rank <= rank ? latest.get(s.key) ?? s.at(deal) ?? null : null,
  }))
}

// ─── What you can choose on the Orders page ────────────────────────────────────────────────────

/** The statuses offered on Admin > Orders, in order. "Order received" is stored as deposit_paid; deposit_pending stays only on the Deals page. */
export const ADMIN_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'deposit_paid', label: 'Order received' },
  { value: 'sourcing', label: 'We are sourcing your item' },
  { value: 'purchased', label: 'Item purchased' },
  { value: 'shipping', label: 'On its way from Europe' },
  { value: 'arrived_egypt', label: 'Arrived in Egypt' },
  { value: 'egypt_handling', label: 'Shipping handling in Egypt' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

/** The option that matches a stored status (deposit_pending shows as "Order received"). */
export function adminStatusValue(status: string): string { return status === 'deposit_pending' ? 'deposit_paid' : status }

// ─── Expected delivery ─────────────────────────────────────────────────────────────────────────

/** Typical window when no date was set by hand. The FAQ promises "1 to 2 weeks", counted from the deposit. Adjust here. */
export const DELIVERY_WINDOW_DAYS = { min: 7, max: 14 }
/** After arrival in Egypt the courier needs about 1 to 3 days. */
export const LOCAL_DELIVERY_DAYS = { min: 1, max: 3 }

const DAY_MS = 86_400_000
const isoDay = (d: Date) => d.toISOString().slice(0, 10)
const plusDays = (iso: string, n: number) => isoDay(new Date(new Date(iso).getTime() + n * DAY_MS))

export interface ExpectedDelivery { from: string; to: string | null; estimate: boolean }

/**
 * The date shown to the customer. A date you set by hand always wins (exact). Otherwise a window is estimated:
 * 1 to 2 weeks from the deposit, or 1 to 3 days after the parcel reached Egypt. Delivered or cancelled orders show none,
 * and so does an estimate that is already in the past (the page then tells the customer to message you).
 */
export function expectedDelivery(deal: DealLite, now = new Date()): ExpectedDelivery | null {
  if (isCancelled(deal.status) || (RANK[deal.status] ?? 0) >= 7) return null
  const today = isoDay(now)
  if (deal.expected_delivery_date) return { from: deal.expected_delivery_date.slice(0, 10), to: null, estimate: false }
  if (deal.status === 'out_for_delivery') return { from: today, to: plusDays(today, 1), estimate: true }
  if (deal.status === 'arrived_egypt' || deal.status === 'egypt_handling') {
    const base = (deal.arrived_egypt_at ?? today).slice(0, 10)
    const to = plusDays(base, LOCAL_DELIVERY_DAYS.max)
    return to < today ? null : { from: plusDays(base, LOCAL_DELIVERY_DAYS.min) < today ? today : plusDays(base, LOCAL_DELIVERY_DAYS.min), to, estimate: true }
  }
  if (['deposit_paid', 'sourcing', 'purchased', 'shipping'].includes(deal.status)) {
    const base = (deal.deposit_paid_at ?? deal.created_at ?? '').slice(0, 10)
    if (!base) return null
    const to = plusDays(base, DELIVERY_WINDOW_DAYS.max)
    return to < today ? null : { from: plusDays(base, DELIVERY_WINDOW_DAYS.min) < today ? today : plusDays(base, DELIVERY_WINDOW_DAYS.min), to, estimate: true }
  }
  return null
}

/** One plain sentence for the top of the order card, and the title of the update in the log. */
export function statusHeadline(status: string): string {
  return STATUS_LABEL[status] ?? 'In progress'
}

export interface CustomerOrder {
  id: string
  orderCode: string | null
  headline: string
  expected: ExpectedDelivery | null
  /** Updates you posted, newest first. */
  events: PublicEvent[]
  /** Latest status date we know of, for "Last update". */
  lastUpdateAt: string | null
  title: string
  status: string
  cancelled: boolean
  placedAt: string | null
  timeline: TimelineStep[]
  trackingNumber: string | null
  carrier: string | null
  message: string | null
  sellingPriceEgp: number | null
  paidEgp: number | null
  remainingEgp: number | null
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * The ONLY shape that leaves the server for a customer. Built field by field (never spread the row),
 * so cost, margin, source link and internal notes cannot leak by accident.
 */
export function toCustomerOrder(deal: DealLite, title?: string | null, now = new Date(), events: OrderEventLite[] = []): CustomerOrder {
  const price = num(deal.selling_price_egp)
  const deposit = num(deal.deposit_amount_egp)
  const remaining = num(deal.remaining_amount_egp)
  const depositPaid = deal.status !== 'deposit_pending' && deal.status !== 'cancelled' && deal.status in RANK
  const sorted = [...events].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  const stamps = [...sorted.map((e) => e.created_at), deal.delivered_at, deal.arrived_egypt_at, deal.shipped_at, deal.deposit_paid_at, deal.created_at].filter((v): v is string => !!v)
  return {
    id: deal.id,
    orderCode: deal.order_code?.trim() || null,
    headline: statusHeadline(deal.status),
    expected: expectedDelivery(deal, now),
    events: sorted.map((e) => ({ title: e.title, comment: e.comment?.trim() || null, at: e.created_at })),
    lastUpdateAt: stamps.sort().at(-1) ?? null,
    title: title?.trim() || 'Your order',
    status: deal.status,
    cancelled: isCancelled(deal.status),
    placedAt: deal.created_at ?? null,
    timeline: buildTimeline(deal, events),
    trackingNumber: deal.tracking_number?.trim() || null,
    carrier: deal.carrier?.trim() || null,
    message: deal.customer_message?.trim() || null,
    sellingPriceEgp: price,
    paidEgp: depositPaid ? deposit : null,
    remainingEgp: remaining,
  }
}

// ─── Linking deals to accounts ───────────────────────────────────────────────────────────────────

export interface AccountLite { user_id: string; email?: string | null; name?: string | null; phone?: string | null }

/** Registered accounts that probably own this deal: same phone (strong) or same name (weak), strongest first. */
export function suggestAccounts(deal: DealLite, accounts: AccountLite[]): { account: AccountLite; reason: 'phone' | 'name' }[] {
  const dealPhone = phoneKey(deal.phone)
  const dealName = (deal.customer_name ?? '').trim().toLowerCase()
  const out: { account: AccountLite; reason: 'phone' | 'name' }[] = []
  for (const a of accounts) {
    if (dealPhone && phoneKey(a.phone) === dealPhone) out.push({ account: a, reason: 'phone' })
    else if (dealName.length >= 4 && (a.name ?? '').trim().toLowerCase() === dealName) out.push({ account: a, reason: 'name' })
  }
  return out.sort((x, y) => (x.reason === y.reason ? 0 : x.reason === 'phone' ? -1 : 1))
}

// ─── Follow-ups (sales closing) ─────────────────────────────────────────────────────────────────

export interface FollowUp {
  kind: 'request' | 'deposit' | 'reservation'
  ref: string
  name: string
  phone: string | null
  what: string
  ageDays: number
  link: string // admin page where it is handled
  whatsapp: string | null
}

const DAY = 86_400_000
const ageDays = (iso: string | null | undefined, now: Date) => iso ? Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY)) : 0

/** wa.me link with a ready message. Egyptian numbers starting with 0 get the +20 prefix. */
export function whatsappLink(phone: string | null | undefined, text: string): string | null {
  let d = (phone ?? '').replace(/\D/g, '')
  if (d.length < 8) return null
  if (d.startsWith('00')) d = d.slice(2)
  else if (d.startsWith('0')) d = '20' + d.slice(1)
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`
}

export interface FollowUpInput {
  requests: { id: number; customer_name?: string | null; phone?: string | null; requested_product?: string | null; status?: string | null; created_at: string }[]
  deals: { id: string; product_request_id?: number | null; customer_name?: string | null; phone?: string | null; status: string; created_at: string }[]
  reservations: { id: number | string; name?: string | null; phone?: string | null; status?: string | null; created_at: string; product_title?: string | null }[]
}

/**
 * Who should get a message today. Rules (all use whole days):
 *  - request with no deal yet, still pending/contacted, older than 1 day
 *  - deal waiting for its deposit for more than 2 days
 *  - reservation still pending after 1 day
 * Oldest first, so nobody is forgotten.
 */
export function buildFollowUps(input: FollowUpInput, now = new Date()): FollowUp[] {
  const dealt = new Set(input.deals.map(d => d.product_request_id).filter((v): v is number => typeof v === 'number'))
  const out: FollowUp[] = []

  for (const r of input.requests) {
    if (dealt.has(r.id) || !['pending', 'contacted', null, undefined].includes(r.status as never)) continue
    const age = ageDays(r.created_at, now)
    if (age < 1) continue
    const name = r.customer_name?.trim() || 'there'
    const what = r.requested_product?.trim() || 'your request'
    out.push({ kind: 'request', ref: String(r.id), name, phone: r.phone ?? null, what, ageDays: age, link: '/admin/requests',
      whatsapp: whatsappLink(r.phone, `Hi ${name}, this is Pulse Gear. We looked into ${what} and have an update for you. Do you still want us to source it?`) })
  }
  for (const d of input.deals) {
    if (d.status !== 'deposit_pending') continue
    const age = ageDays(d.created_at, now)
    if (age <= 2) continue
    const name = d.customer_name?.trim() || 'there'
    out.push({ kind: 'deposit', ref: d.id, name, phone: d.phone ?? null, what: 'deposit for your order', ageDays: age, link: '/admin/deals',
      whatsapp: whatsappLink(d.phone, `Hi ${name}, a quick reminder from Pulse Gear: your order is ready to start as soon as the deposit arrives. Need any help?`) })
  }
  for (const r of input.reservations) {
    if ((r.status ?? 'pending') !== 'pending') continue
    const age = ageDays(r.created_at, now)
    if (age < 1) continue
    const name = r.name?.trim() || 'there'
    const what = r.product_title?.trim() || 'the item you reserved'
    out.push({ kind: 'reservation', ref: String(r.id), name, phone: r.phone ?? null, what, ageDays: age, link: '/admin/reservations',
      whatsapp: whatsappLink(r.phone, `Hi ${name}, Pulse Gear here. Your reservation for ${what} is still waiting for confirmation. Shall we go ahead?`) })
  }
  return out.sort((a, b) => b.ageDays - a.ageDays)
}


// ─── Public tracking (no account) ───────────────────────────────────────────────────────────────

export const ORDER_CODE_RE = /^PG-[0-9A-F]{8}$/

/** "pg-3fa9 c21b" -> "PG-3FA9C21B". Returns null when it cannot be a real code. */
export function normalizeOrderCode(input: string | null | undefined): string | null {
  const raw = (input ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '')
  const body = raw.startsWith('PG') ? raw.slice(2) : raw
  const code = `PG-${body}`
  return ORDER_CODE_RE.test(code) ? code : null
}

/** The customer proves the order is theirs with the last 4 digits of the phone on it. Needs at least 4 digits on both sides. */
export function phoneLast4Matches(orderPhone: string | null | undefined, typed: string | null | undefined): boolean {
  const a = (orderPhone ?? '').replace(/\D/g, '')
  const b = (typed ?? '').replace(/\D/g, '')
  if (a.length < 4 || b.length < 4) return false
  return a.slice(-4) === b.slice(-4)
}

/** What a visitor without an account may see: status, dates and tracking, never prices, name, phone or notes. */
export type PublicOrder = Pick<CustomerOrder, 'orderCode' | 'headline' | 'expected' | 'events' | 'lastUpdateAt' | 'title' | 'status' | 'cancelled' | 'timeline' | 'trackingNumber' | 'carrier' | 'message'>

export function toPublicOrder(order: CustomerOrder): PublicOrder {
  const { orderCode, headline, expected, events, lastUpdateAt, title, status, cancelled, timeline, trackingNumber, carrier, message } = order
  return { orderCode, headline, expected, events, lastUpdateAt, title, status, cancelled, timeline, trackingNumber, carrier, message }
}

/** A ready WhatsApp message for the admin to send in one tap (Arabic first, English below). */
export function statusMessage(order: CustomerOrder, trackUrl: string, name?: string | null): string {
  const hi = name?.trim() ? name.trim().split(/\s+/)[0] : ''
  const note = order.events[0]?.comment ?? null
  const eta = order.expected ? (order.expected.to ? `${order.expected.from} - ${order.expected.to}` : order.expected.from) : null
  return [
    `أهلاً ${hi}`.trim() + ' 👋',
    `طلبك ${order.orderCode ?? ''}: ${order.headline}`.trim(),
    note ? `ملاحظة: ${note}` : '',
    eta ? `التسليم المتوقع: ${eta}` : '',
    `تابع طلبك من هنا: ${trackUrl}`,
    '',
    `Hi ${hi}`.trim() + ' 👋',
    `Your order ${order.orderCode ?? ''}: ${order.headline}`.trim(),
    note ? `Note: ${note}` : '',
    eta ? `Expected delivery: ${eta}` : '',
    `Track it here: ${trackUrl}`,
  ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i !== a.length - 1)).join('\n')
}
