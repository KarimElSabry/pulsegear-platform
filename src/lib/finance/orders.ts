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
}

export interface TimelineStep { key: string; label: string; state: 'done' | 'current' | 'upcoming'; at: string | null }

/** How far along an order is. Statuses the customer sees as the same step share a rank. */
const RANK: Record<string, number> = {
  deposit_pending: 0, deposit_paid: 1, sourcing: 2, purchased: 3, shipping: 4,
  arrived_egypt: 5, out_for_delivery: 6, delivered: 7, remaining_pending: 7, completed: 7,
}

const STEPS: { key: string; label: string; rank: number; at: (d: DealLite) => string | null | undefined }[] = [
  { key: 'placed', label: 'Order placed', rank: 0, at: d => d.created_at },
  { key: 'deposit', label: 'Deposit received', rank: 1, at: d => d.deposit_paid_at },
  { key: 'sourcing', label: 'We are sourcing your item', rank: 2, at: () => null },
  { key: 'purchased', label: 'Item purchased', rank: 3, at: () => null },
  { key: 'shipping', label: 'On its way from Germany', rank: 4, at: d => d.shipped_at },
  { key: 'arrived', label: 'Arrived in Egypt', rank: 5, at: d => d.arrived_egypt_at },
  { key: 'out', label: 'Out for delivery', rank: 6, at: () => null },
  { key: 'delivered', label: 'Delivered', rank: 7, at: d => d.delivered_at },
]

export function isCancelled(status: string): boolean { return status === 'cancelled' }

/** Steps with done / current / upcoming. A cancelled order has no timeline. Unknown statuses show only "placed". */
export function buildTimeline(deal: DealLite): TimelineStep[] {
  if (isCancelled(deal.status)) return []
  const rank = RANK[deal.status] ?? 0
  return STEPS.map(s => ({
    key: s.key,
    label: s.label,
    // the last step is "done" once delivered, every other step at the current rank is "current"
    state: s.rank < rank || (s.rank === rank && rank === 7) ? 'done' : s.rank === rank ? 'current' : 'upcoming',
    at: s.rank <= rank ? s.at(deal) ?? null : null,
  }))
}

export interface CustomerOrder {
  id: string
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
export function toCustomerOrder(deal: DealLite, title?: string | null): CustomerOrder {
  const price = num(deal.selling_price_egp)
  const deposit = num(deal.deposit_amount_egp)
  const remaining = num(deal.remaining_amount_egp)
  const depositPaid = RANK[deal.status] >= 1 && deal.status !== 'cancelled'
  return {
    id: deal.id,
    title: title?.trim() || 'Your order',
    status: deal.status,
    cancelled: isCancelled(deal.status),
    placedAt: deal.created_at ?? null,
    timeline: buildTimeline(deal),
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
