// src/lib/order-board.ts
// One list for everything: website orders (with their per-item deals) and deals you created by hand.
// Pure code: decides which stage an order is in, which filter tab it belongs to and how the list is searched and sorted.

import type { CheckoutStatus } from './checkout-core'

export type Stage = 'waiting_payment' | 'receipt' | 'active' | 'remaining' | 'completed' | 'closed'
export type BoardFilter = 'needs_me' | 'active' | 'completed' | 'closed' | 'all'

export const FILTERS: { value: BoardFilter; label: string }[] = [
  { value: 'needs_me', label: 'Needs me' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Cancelled / expired' },
  { value: 'all', label: 'All' },
]

export interface BoardDeal {
  id: string
  status: string
  customer_name: string | null
  phone: string | null
  user_id: string | null
  created_at: string
  item_title: string | null
  order_code: string | null
  expected_delivery_date: string | null
  selling_price_egp: number | null
  deposit_amount_egp: number | null
  deposit_paid_at: string | null
  checkout_id: string | null
  checkout_code: string | null
}

export interface BoardCheckout {
  id: string
  code: string
  status: CheckoutStatus
  customer_name: string
  phone: string
  created_at: string
  total_egp: number
  hold_expires_at: string | null
}

export interface BoardItem { title: string; color: string | null; quantity: number; net: number }

export interface BoardOrder {
  key: string
  kind: 'online' | 'manual'
  checkout: BoardCheckout | null
  deals: BoardDeal[]
  items: BoardItem[]
  receiptsWaiting: boolean
  code: string | null
  customer: string
  phone: string
  createdAt: string
  total: number
  stage: Stage
  stageLabel: string
}

/** Stage of an order from the website order status, its deals and whether a receipt waits for you. */
export function stageOf(checkoutStatus: CheckoutStatus | null, deals: { status: string }[], receiptWaiting: boolean): Stage {
  if (checkoutStatus === 'rejected' || checkoutStatus === 'expired' || checkoutStatus === 'cancelled') return 'closed'
  if (checkoutStatus === 'pending') return receiptWaiting ? 'receipt' : 'waiting_payment'

  const live = deals.filter((d) => d.status !== 'cancelled')
  if (deals.length > 0 && live.length === 0) return 'closed'
  if (live.length === 0) return 'active'
  if (live.every((d) => d.status === 'completed')) return 'completed'
  if (live.some((d) => d.status === 'deposit_pending')) return receiptWaiting ? 'receipt' : 'waiting_payment'
  // everything delivered: the rest of the money is still to collect / the order is still to be closed
  if (live.every((d) => ['delivered', 'remaining_pending', 'completed'].includes(d.status))) return 'remaining'
  return 'active'
}

const STATUS_WORDS: Record<string, string> = {
  deposit_paid: 'Order received', sourcing: 'Sourcing', purchased: 'Purchased', shipping: 'On its way from Europe',
  arrived_egypt: 'Arrived in Egypt', egypt_handling: 'Shipping handling in Egypt', out_for_delivery: 'Out for delivery',
}

export function stageLabel(stage: Stage, deals: { status: string }[]): string {
  switch (stage) {
    case 'waiting_payment': return 'Waiting for the deposit'
    case 'receipt': return 'Receipt to check'
    case 'remaining': return 'Delivered, collect the rest and close'
    case 'completed': return 'Completed'
    case 'closed': return 'Cancelled / expired'
    default: {
      const live = [...new Set(deals.filter((d) => d.status !== 'cancelled').map((d) => d.status))]
      if (live.length === 1) return STATUS_WORDS[live[0]] ?? 'In progress'
      return live.length > 1 ? 'In progress (items differ)' : 'In progress'
    }
  }
}

export const filterMatches = (stage: Stage, filter: BoardFilter): boolean => {
  if (filter === 'all') return true
  if (filter === 'needs_me') return stage === 'receipt' || stage === 'remaining'
  if (filter === 'active') return stage === 'waiting_payment' || stage === 'receipt' || stage === 'active' || stage === 'remaining'
  if (filter === 'completed') return stage === 'completed'
  return stage === 'closed'
}

export function parseFilter(v: unknown): BoardFilter {
  return FILTERS.some((f) => f.value === v) ? (v as BoardFilter) : 'active'
}

const net = (price: number, qty: number, discount: number) => Math.round(price * qty) - discount

export function buildBoard(input: {
  checkouts: BoardCheckout[]
  deals: BoardDeal[]
  items: { checkout_id: string; title: string; color_name: string | null; quantity: number; unit_price_egp: number; discount_egp: number }[]
  waitingReceipts: Set<string>
}): BoardOrder[] {
  const dealsByCheckout = new Map<string, BoardDeal[]>()
  const manual: BoardDeal[] = []
  const known = new Set(input.checkouts.map((c) => c.id))
  for (const d of input.deals) {
    // a deal whose website order is not in the loaded list is shown on its own rather than lost
    if (d.checkout_id && known.has(d.checkout_id)) dealsByCheckout.set(d.checkout_id, [...(dealsByCheckout.get(d.checkout_id) ?? []), d])
    else manual.push(d)
  }

  const online: BoardOrder[] = input.checkouts.map((c) => {
    const deals = dealsByCheckout.get(c.id) ?? []
    const waiting = input.waitingReceipts.has(c.id)
    const stage = stageOf(c.status, deals, waiting)
    return {
      key: `c:${c.id}`, kind: 'online', checkout: c, deals,
      items: input.items.filter((i) => i.checkout_id === c.id).map((i) => ({ title: i.title, color: i.color_name, quantity: i.quantity, net: net(Number(i.unit_price_egp), i.quantity, Number(i.discount_egp) || 0) })),
      receiptsWaiting: waiting, code: c.code, customer: c.customer_name, phone: c.phone, createdAt: c.created_at,
      total: Number(c.total_egp) || 0, stage, stageLabel: stageLabel(stage, deals),
    }
  })

  const hand: BoardOrder[] = manual.map((d) => {
    const stage = stageOf(null, [d], false)
    const price = Number(d.selling_price_egp) || 0
    return {
      key: `d:${d.id}`, kind: 'manual', checkout: null, deals: [d],
      items: d.item_title ? [{ title: d.item_title, color: null, quantity: 1, net: price }] : [],
      receiptsWaiting: false, code: d.checkout_code ?? d.order_code, customer: d.customer_name ?? 'No name', phone: d.phone ?? '',
      createdAt: d.created_at, total: price, stage, stageLabel: stageLabel(stage, [d]),
    }
  })
  return [...online, ...hand]
}

const PRIORITY: Record<Stage, number> = { receipt: 0, remaining: 1, waiting_payment: 2, active: 3, completed: 4, closed: 5 }

export function visibleOrders(all: BoardOrder[], filter: BoardFilter, query: string): BoardOrder[] {
  const q = query.trim().toLowerCase()
  const digits = q.replace(/\D/g, '')
  return all
    .filter((o) => filterMatches(o.stage, filter))
    .filter((o) => !q
      || o.customer.toLowerCase().includes(q)
      || (o.code ?? '').toLowerCase().includes(q)
      || o.items.some((i) => i.title.toLowerCase().includes(q))
      || (digits.length >= 4 && o.phone.replace(/\D/g, '').includes(digits)))
    .sort((a, b) => (filter === 'completed' || filter === 'closed' || filter === 'all'
      ? 0 : PRIORITY[a.stage] - PRIORITY[b.stage]) || b.createdAt.localeCompare(a.createdAt))
}

export function countByFilter(all: BoardOrder[]): Record<BoardFilter, number> {
  const out = { needs_me: 0, active: 0, completed: 0, closed: 0, all: all.length } as Record<BoardFilter, number>
  for (const o of all) for (const f of FILTERS) if (f.value !== 'all' && filterMatches(o.stage, f.value)) out[f.value]++
  return out
}
