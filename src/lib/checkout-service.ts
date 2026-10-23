// src/lib/checkout-service.ts
// Server-side logic of the cart checkout. Every function takes the database client, so it can be tested.
//
// LIFE OF AN ORDER (no payment on the website: you contact the customer on WhatsApp)
//   place    -> status pending. The customer pressed "Confirm order". Items are HELD for 24 hours: a one-off item is set to
//               "reserved", normal stock is taken off the stock number. You get a Telegram message with a WhatsApp link.
//   approve  -> status approved ("the customer confirmed on WhatsApp"). One Deal per item is created, one-off items become sold.
//   reject / expire / cancel -> the held items go back on sale.

import { timingSafeEqual } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { clampPercent, computeTotals, holdUntil, type CleanCustomer, type CheckoutStatus, type Totals } from '@/lib/checkout-core'
import { MAX_LINE_QUANTITY, type CartLine } from '@/lib/cart'
import { activeVariants, availability, clampQuantity, type VariantLite } from '@/lib/stock'
import { imagesForVariant } from '@/lib/variant-images'
import { loadVariants } from '@/lib/variants'
import { commissionForCode } from '@/lib/deal-codes'
import { logOrderEvent } from '@/lib/order-events'
import { phoneLast4Matches, toCustomerOrder, toPublicOrder, type DealLite, type PublicOrder } from '@/lib/orders'
import { loadEvents } from '@/lib/order-events'
import { problemText, type LineProblem, type QuoteLine, type QuoteResult } from '@/lib/quote'

export { problemText }
export type { LineProblem, QuoteLine, QuoteResult }

type Db = SupabaseClient

type ProductRow = { id: number; slug: string | null; title: string; price_egp: number; status: string; stock_quantity?: number | null; discount_enabled: boolean | null }
type ImageRow = { product_id: number; image_url: string; is_primary: boolean; display_order: number; variant_id?: number | null }

async function loadProducts(db: Db, ids: number[]): Promise<ProductRow[]> {
  if (ids.length === 0) return []
  const full = await db.from('products').select('id, slug, title, price_egp, status, stock_quantity, discount_enabled').in('id', ids)
  if (!full.error) return (full.data ?? []) as ProductRow[]
  // stock_quantity does not exist before the step 14 migration: everything is a one-off item then
  const basic = await db.from('products').select('id, slug, title, price_egp, status, discount_enabled').in('id', ids)
  return (basic.data ?? []) as ProductRow[]
}

async function loadImages(db: Db, ids: number[]): Promise<ImageRow[]> {
  if (ids.length === 0) return []
  const full = await db.from('product_images').select('product_id, image_url, is_primary, display_order, variant_id').in('product_id', ids)
  if (!full.error) return (full.data ?? []) as ImageRow[]
  const basic = await db.from('product_images').select('product_id, image_url, is_primary, display_order').in('product_id', ids)
  return (basic.data ?? []) as ImageRow[]
}

async function lookupDiscount(db: Db, raw: string | null | undefined): Promise<{ code: string | null; percent: number; error: string | null }> {
  const code = raw?.trim().toUpperCase()
  if (!code) return { code: null, percent: 0, error: null }
  const { data } = await db.from('discount_codes').select('code, discount_percent, is_active').eq('code', code).maybeSingle()
  if (!data || !data.is_active) return { code: null, percent: 0, error: 'This discount code is invalid or no longer active' }
  return { code: data.code as string, percent: clampPercent(data.discount_percent, 0), error: null }
}

/** Prices, names and availability of a cart, from the database. The browser only says what and how many. */
export async function quoteCart(db: Db, cart: CartLine[], opts: { discountCode?: string | null } = {}): Promise<QuoteResult> {
  const ids = [...new Set(cart.map((l) => l.productId))]
  const [products, images, variantMap, discount] = await Promise.all([
    loadProducts(db, ids),
    loadImages(db, ids),
    loadVariants(db, ids),
    lookupDiscount(db, opts.discountCode),
  ])
  const byId = new Map(products.map((p) => [Number(p.id), p]))

  const lines: QuoteLine[] = cart.map((c): QuoteLine => {
    const p = byId.get(c.productId)
    const base = { productId: c.productId, variantId: c.variantId, note: c.note, quantity: Math.min(c.quantity, MAX_LINE_QUANTITY) }
    if (!p) {
      return { ...base, slug: null, title: 'An item in your cart', colorName: null, imageUrl: null, unitPriceEgp: 0, maxQuantity: 0, discountEnabled: false, oneOff: true, unitsLeft: null, problem: 'gone' }
    }
    const colors = activeVariants(variantMap.get(Number(p.id)))
    const variant: VariantLite | null = c.variantId ? colors.find((v) => v.id === c.variantId) ?? null : null
    const stockProduct = { status: p.status, stock_quantity: p.stock_quantity ?? null }

    let problem: LineProblem = 'ok'
    if (colors.length > 0 && c.variantId === null) problem = 'choose_color'
    else if (c.variantId !== null && !variant) problem = 'color_gone'

    const a = availability(stockProduct, variant)
    if (problem === 'ok' && !a.canBuy) problem = a.reason === 'ok' ? 'out_of_stock' : a.reason

    const photos = imagesForVariant(images.filter((i) => Number(i.product_id) === Number(p.id)), variant?.id ?? null, colors.length > 0)
    const photo = photos.find((i) => i.is_primary) ?? photos[0]
    return {
      ...base,
      quantity: problem === 'ok' ? clampQuantity(c.quantity, a) : base.quantity,
      slug: p.slug,
      title: p.title,
      colorName: variant?.name ?? null,
      imageUrl: photo?.image_url ?? null,
      unitPriceEgp: Number(p.price_egp) || 0,
      maxQuantity: a.maxQuantity,
      discountEnabled: p.discount_enabled !== false,
      oneOff: a.oneOff,
      unitsLeft: a.unitsLeft,
      problem,
    }
  })

  const priced = lines.filter((l) => l.problem === 'ok')
  const totals = computeTotals(priced.map((l) => ({ unitPriceEgp: l.unitPriceEgp, quantity: l.quantity, discountEnabled: l.discountEnabled })), discount.percent)
  return {
    lines,
    buyable: lines.length > 0 && lines.every((l) => l.problem === 'ok'),
    discountCode: discount.code,
    discountPercent: discount.percent,
    discountError: discount.error,
    totals,
  }
}

// ─── Holding items ────────────────────────────────────────────────────────────

type ItemRow = {
  id: number
  checkout_id: string
  product_id: number
  variant_id: number | null
  quantity: number
  hold_kind: 'oneoff' | 'variant' | 'product' | null
  held: boolean
  hold_until: string | null
  title?: string
  color_name?: string | null
  unit_price_egp?: number
  discount_egp?: number
  note?: string | null
}

const CAS_TRIES = 6

/** Changes a stock number by delta only if nobody changed it in between (compare-and-set), so two buyers cannot take the same unit. */
async function adjustStock(db: Db, table: 'products' | 'product_variants', id: number, delta: number): Promise<boolean> {
  for (let i = 0; i < CAS_TRIES; i++) {
    const { data: row } = await db.from(table).select('stock_quantity').eq('id', id).maybeSingle()
    const current = row?.stock_quantity
    if (current === null || current === undefined) return false
    const next = Number(current) + delta
    if (next < 0) return false
    const { data: hit } = await db.from(table).update({ stock_quantity: next }).eq('id', id).eq('stock_quantity', current).select('id')
    if (hit && hit.length === 1) return true
  }
  return false
}

async function holdItem(db: Db, item: ItemRow, kind: NonNullable<ItemRow['hold_kind']>, until: Date): Promise<boolean> {
  let ok = false
  if (kind === 'oneoff') {
    const { data } = await db.from('products')
      .update({ status: 'reserved', reserved_until: until.toISOString() })
      .eq('id', item.product_id).eq('status', 'available').is('stock_quantity', null).select('id')
    ok = !!data && data.length === 1
  } else if (kind === 'variant') {
    ok = await adjustStock(db, 'product_variants', item.variant_id as number, -item.quantity)
  } else {
    ok = await adjustStock(db, 'products', item.product_id, -item.quantity)
  }
  if (ok) await db.from('checkout_items').update({ held: true, hold_kind: kind, hold_until: until.toISOString() }).eq('id', item.id)
  return ok
}

async function releaseItem(db: Db, item: ItemRow): Promise<void> {
  if (!item.held || !item.hold_kind) return
  if (item.hold_kind === 'oneoff') {
    // only free it if the hold is still ours (a manual reservation or a later hold must not be undone)
    if (item.hold_until) {
      await db.from('products').update({ status: 'available', reserved_until: null })
        .eq('id', item.product_id).eq('status', 'reserved').eq('reserved_until', item.hold_until)
    }
  } else if (item.hold_kind === 'variant') {
    await adjustStock(db, 'product_variants', item.variant_id as number, item.quantity)
  } else {
    await adjustStock(db, 'products', item.product_id, item.quantity)
  }
  await db.from('checkout_items').update({ held: false }).eq('id', item.id)
}

async function loadItems(db: Db, checkoutId: string): Promise<ItemRow[]> {
  const { data } = await db.from('checkout_items').select('*').eq('checkout_id', checkoutId).order('id', { ascending: true })
  return (data ?? []) as ItemRow[]
}

/** Puts every held item back on sale and sets the final status. */
export async function releaseCheckout(db: Db, checkoutId: string, status: Extract<CheckoutStatus, 'rejected' | 'expired' | 'cancelled'>, note?: string | null, now = new Date()) {
  for (const item of await loadItems(db, checkoutId)) await releaseItem(db, item)
  await db.from('checkout_orders').update({
    status,
    ...(note !== undefined ? { review_note: note } : {}),
    ...(status === 'rejected' ? { reviewed_at: now.toISOString() } : {}),
  }).eq('id', checkoutId)
}

/** Orders still pending after 24 hours: the items go back on sale. Called on every checkout action and by the daily cron. */
export async function releaseExpired(db: Db, now = new Date()): Promise<number> {
  const { data } = await db.from('checkout_orders').select('id')
    .eq('status', 'pending').lt('hold_expires_at', now.toISOString())
  const rows = (data ?? []) as { id: string }[]
  for (const r of rows) await releaseCheckout(db, r.id, 'expired')
  return rows.length
}

// ─── Placing an order ─────────────────────────────────────────────────────────

export type PlaceResult =
  | { ok: true; id: string; code: string; token: string; totals: Totals; holdExpiresAt: string; customerName: string }
  | { ok: false; reason: 'EMPTY' | 'UNAVAILABLE' | 'DISCOUNT' | 'DB'; message: string }

export async function placeCheckout(db: Db, input: { lines: CartLine[]; customer: CleanCustomer; discountCode?: string | null; userId?: string | null; now?: Date }): Promise<PlaceResult> {
  const now = input.now ?? new Date()
  if (input.lines.length === 0) return { ok: false, reason: 'EMPTY', message: 'Your cart is empty' }

  await releaseExpired(db, now)
  const quote = await quoteCart(db, input.lines, { discountCode: input.discountCode })
  if (input.discountCode?.trim() && quote.discountError) return { ok: false, reason: 'DISCOUNT', message: quote.discountError }
  const bad = quote.lines.filter((l) => l.problem !== 'ok')
  if (bad.length) return { ok: false, reason: 'UNAVAILABLE', message: bad.map(problemText).join('. ') + '. Please update your cart.' }

  const until = holdUntil(now)
  const t = quote.totals
  const { data: order, error } = await db.from('checkout_orders').insert({
    user_id: input.userId ?? null,
    customer_name: input.customer.name, phone: input.customer.phone, email: input.customer.email,
    address: input.customer.address, customer_note: input.customer.note,
    discount_code: quote.discountCode,
    subtotal_egp: t.subtotal, discount_egp: t.discount, total_egp: t.total,
    status: 'pending',
    hold_expires_at: until.toISOString(),
  }).select('id, code, view_token').single()
  if (error || !order) {
    console.error('[checkout] could not create the order:', error?.message)
    return { ok: false, reason: 'DB', message: 'We could not place your order right now. Please try again in a minute.' }
  }

  const { data: items, error: itemsError } = await db.from('checkout_items').insert(
    quote.lines.map((l, i) => ({
      checkout_id: order.id, product_id: l.productId, variant_id: l.variantId,
      title: l.title, color_name: l.colorName, unit_price_egp: l.unitPriceEgp, quantity: l.quantity,
      discount_egp: t.lines[i].discount, note: l.note || null,
    }))
  ).select('*')
  if (itemsError || !items) {
    await db.from('checkout_orders').delete().eq('id', order.id)
    return { ok: false, reason: 'DB', message: 'We could not place your order right now. Please try again in a minute.' }
  }

  const rows = (items as ItemRow[]).sort((a, b) => a.id - b.id)
  for (const [i, row] of rows.entries()) {
    const l = quote.lines[i]
    const kind = l.oneOff ? 'oneoff' : l.variantId && l.unitsLeft !== null && (await variantHasOwnStock(db, l.variantId)) ? 'variant' : 'product'
    if (!(await holdItem(db, row, kind, until))) {
      await releaseCheckout(db, order.id as string, 'cancelled', 'An item was taken by another customer while this order was being placed')
      return { ok: false, reason: 'UNAVAILABLE', message: `${l.title} was just taken by another customer. Please update your cart.` }
    }
  }
  return { ok: true, id: order.id as string, code: order.code as string, token: order.view_token as string, totals: t, holdExpiresAt: until.toISOString(), customerName: input.customer.name }
}

async function variantHasOwnStock(db: Db, variantId: number): Promise<boolean> {
  const { data } = await db.from('product_variants').select('stock_quantity').eq('id', variantId).maybeSingle()
  return data?.stock_quantity !== null && data?.stock_quantity !== undefined
}

// ─── Reading an order ─────────────────────────────────────────────────────────

export function tokenMatches(a: unknown, b: unknown): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length || a.length === 0) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export type OrderRow = {
  id: string; code: string; view_token: string; user_id: string | null
  customer_name: string; phone: string; email: string | null; address: string; customer_note: string | null
  discount_code: string | null; subtotal_egp: number; discount_egp: number; total_egp: number
  status: CheckoutStatus; hold_expires_at: string | null; review_note: string | null; reviewed_at: string | null; created_at: string
}

export async function findByCodeAndToken(db: Db, code: string, token: string): Promise<OrderRow | null> {
  const { data } = await db.from('checkout_orders').select('*').eq('code', code).maybeSingle()
  if (!data || !tokenMatches((data as OrderRow).view_token, token)) return null
  return data as OrderRow
}

// ─── Your review ──────────────────────────────────────────────────────────────

export type ApproveResult = { ok: true; dealIds: string[]; code: string } | { ok: false; message: string }

export async function approveCheckout(db: Db, id: string, now = new Date()): Promise<ApproveResult> {
  const { data: found } = await db.from('checkout_orders').select('*').eq('id', id).maybeSingle()
  const order = found as OrderRow | null
  if (!order) return { ok: false, message: 'Order not found' }
  if (order.status !== 'pending' && order.status !== 'expired') return { ok: false, message: 'Only a pending order can be confirmed' }

  // claim it first, so a double click cannot create the deals twice
  const { data: claimed } = await db.from('checkout_orders')
    .update({ status: 'approved', reviewed_at: now.toISOString() }).eq('id', id).in('status', ['pending', 'expired']).select('id')
  if (!claimed || claimed.length !== 1) return { ok: false, message: 'This order was just handled by someone else' }

  const items = await loadItems(db, id)
  const undo = async (message: string, dealIds: string[]) => {
    if (dealIds.length) await db.from('deals').delete().in('id', dealIds)
    await db.from('checkout_orders').update({ status: order.status, reviewed_at: null }).eq('id', id)
    return { ok: false as const, message }
  }

  // Items that are no longer held (the hold timed out) must be taken again, if still available.
  for (const item of items) {
    if (item.hold_kind === 'oneoff') {
      const { data: p } = await db.from('products').select('status, reserved_until').eq('id', item.product_id).maybeSingle()
      const stillOurs = item.held && p?.status === 'reserved' && p?.reserved_until !== null && sameInstant(p?.reserved_until, item.hold_until)
      if (stillOurs) continue
      if (p?.status === 'available') {
        if (await holdItem(db, { ...item, held: false }, 'oneoff', holdUntil(now))) continue
      }
      return undo(`"${item.title}" is no longer available. Reject this order and refund the customer.`, [])
    }
    if (!item.held) {
      const kind = item.hold_kind ?? (item.variant_id ? 'variant' : 'product')
      if (!(await holdItem(db, item, kind, holdUntil(now)))) {
        return undo(`"${item.title}" is out of stock now. Reject this order and refund the customer.`, [])
      }
    }
  }

  const dealIds: string[] = []
  const fresh = await loadItems(db, id)
  // the partner percent of the code becomes the commission, like on the Deals page
  let codePercent = 0
  if (order.discount_code) {
    const { data: c } = await db.from('discount_codes').select('discount_percent').eq('code', order.discount_code).maybeSingle()
    codePercent = clampPercent(c?.discount_percent, 0)
  }
  for (const item of fresh) {
    const unit = Number(item.unit_price_egp) || 0
    const net = Math.round(unit * item.quantity) - (Number(item.discount_egp) || 0)
    const title = [item.title, item.color_name ? `(${item.color_name})` : null, item.quantity > 1 ? `x${item.quantity}` : null].filter(Boolean).join(' ')
    const notes = [item.note ? `Customer note: ${item.note}` : null, order.customer_note ? `Order note: ${order.customer_note}` : null,
      `Website order ${order.code}`].filter(Boolean).join('\n')
    const { data: deal, error } = await db.from('deals').insert({
      customer_name: order.customer_name, phone: order.phone, customer_address: order.address,
      sale_channel: 'website', status: 'deposit_pending',
      selling_price_egp: net,
      discount_code: order.discount_code,
      commission_egp: order.discount_code && (Number(item.discount_egp) || 0) > 0 ? commissionForCode(net, codePercent) : 0,
      user_id: order.user_id, checkout_id: order.id, checkout_code: order.code, item_title: title, notes,
    }).select('id').single()
    if (error || !deal) {
      console.error('[checkout] could not create a deal:', error?.message)
      return undo('Could not create the order records. Nothing was changed, please try again.', dealIds)
    }
    dealIds.push(deal.id as string)
  }

  // The deals exist: from here on the stock is really gone. One-off items are sold, held units are consumed.
  for (const item of fresh) {
    if (item.hold_kind === 'oneoff') {
      await db.from('products').update({ status: 'sold', sold_at: now.toISOString(), reserved_until: null }).eq('id', item.product_id)
    }
    await db.from('checkout_items').update({ held: false }).eq('id', item.id)
  }
  for (const dealId of dealIds) {
    await logOrderEvent(db, { dealId, status: 'deposit_pending', comment: 'Order confirmed. Thank you!' })
  }
  if (order.discount_code) {
    const { data: c } = await db.from('discount_codes').select('id, usage_count').eq('code', order.discount_code).maybeSingle()
    if (c?.id) await db.from('discount_codes').update({ usage_count: (Number(c.usage_count) || 0) + 1 }).eq('id', c.id)
  }
  return { ok: true, dealIds, code: order.code }
}

function sameInstant(a: unknown, b: unknown): boolean {
  if (!a || !b) return false
  return new Date(String(a)).getTime() === new Date(String(b)).getTime()
}

export async function rejectCheckout(db: Db, id: string, reason: string, now = new Date()): Promise<{ ok: boolean; message?: string }> {
  const { data } = await db.from('checkout_orders').select('status').eq('id', id).maybeSingle()
  if (!data) return { ok: false, message: 'Order not found' }
  if (data.status !== 'pending' && data.status !== 'expired') return { ok: false, message: 'This order is already closed' }
  await releaseCheckout(db, id, 'rejected', reason.trim().slice(0, 300) || 'We could not confirm this order', now)
  return { ok: true }
}

// ─── Tracking (public, order ID + last 4 digits of the phone) ─────────────────

export type PublicCheckout = {
  code: string
  status: CheckoutStatus
  note: string | null
  items: { title: string; colorName: string | null; quantity: number }[]
  totalEgp: number
  placedAt: string
}

export type CheckoutTracking =
  | { kind: 'none' }
  | { kind: 'orders'; orders: PublicOrder[] }
  | { kind: 'pending'; checkout: PublicCheckout }

const DEAL_TRACK_COLUMNS = 'id, status, phone, created_at, deposit_paid_at, shipped_at, arrived_egypt_at, delivered_at, order_code, expected_delivery_date, item_title, tracking_number, carrier, customer_message, selling_price_egp, deposit_amount_egp, remaining_amount_egp'

/** A cart order code on the tracking page: shows its state, or (once approved) the status of every item. */
export async function trackCheckout(db: Db, code: string, phoneLast4: string, now = new Date()): Promise<CheckoutTracking> {
  const { data } = await db.from('checkout_orders').select('id, code, status, phone, total_egp, review_note, created_at').eq('code', code).maybeSingle()
  if (!data || !phoneLast4Matches(data.phone as string, phoneLast4)) return { kind: 'none' }
  const status = data.status as CheckoutStatus

  if (status === 'approved') {
    const { data: deals } = await db.from('deals').select(DEAL_TRACK_COLUMNS).eq('checkout_code', code).order('created_at', { ascending: true })
    const list = (deals ?? []) as DealLite[]
    if (list.length > 0) {
      const events = await loadEvents(db, list.map((d) => d.id))
      return { kind: 'orders', orders: list.map((d) => toPublicOrder(toCustomerOrder(d, null, now, events.get(d.id) ?? []))) }
    }
  }
  const { data: items } = await db.from('checkout_items').select('title, color_name, quantity').eq('checkout_id', data.id as string).order('id', { ascending: true })
  return {
    kind: 'pending',
    checkout: {
      code, status,
      note: status === 'rejected' || status === 'cancelled' ? ((data.review_note as string | null) ?? null) : null,
      items: ((items ?? []) as { title: string; color_name: string | null; quantity: number }[]).map((i) => ({ title: i.title, colorName: i.color_name, quantity: i.quantity })),
      totalEgp: Number(data.total_egp) || 0, placedAt: data.created_at as string,
    },
  }
}
