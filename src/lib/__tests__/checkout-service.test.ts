import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { approveCheckout, findByCodeAndToken, placeCheckout, quoteCart, rejectCheckout, releaseExpired, trackCheckout } from '../checkout-service'
import type { CleanCustomer } from '../checkout-core'

vi.mock('../order-events', async () => {
  const actual = await vi.importActual<typeof import('../order-events')>('../order-events')
  return actual
})

let db: FakeDb
const client = () => db as unknown as SupabaseClient
const NOW = new Date('2026-10-21T10:00:00.000Z')
const at = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)

const customer: CleanCustomer = { name: 'Ahmed Mohamed', phone: '01012345678', email: null, address: '12 Street, Nasr City, Cairo', note: 'Call before delivery' }
const line = (productId: number, variantId: number | null = null, quantity = 1, note = '') => ({ productId, variantId, quantity, note })

const product = (id: number, over: Record<string, unknown> = {}) => ({
  id, slug: `p${id}`, title: `Product ${id}`, price_egp: 1000, status: 'available', stock_quantity: null, discount_enabled: true, reserved_until: null, ...over,
})

beforeEach(() => {
  db = new FakeDb()
  db.seed('products', [
    product(1),                                         // one-off
    product(2, { stock_quantity: 5, price_egp: 2000 }), // normal stock
    product(3, { stock_quantity: 5 }),                  // normal stock with colors
    product(4, { status: 'sold' }),
    product(5, { status: 'reserved' }),
    product(6, { discount_enabled: false, price_egp: 500 }),
  ])
  db.seed('product_variants', [
    { id: 31, product_id: 3, name: 'Black', color_hex: '#000000', stock_quantity: 2, is_active: true, display_order: 0 },
    { id: 32, product_id: 3, name: 'Red', color_hex: '#cc0000', stock_quantity: null, is_active: true, display_order: 1 },
    { id: 33, product_id: 3, name: 'Old', color_hex: null, stock_quantity: 9, is_active: false, display_order: 2 },
  ])
  db.seed('product_images', [{ product_id: 3, image_url: 'black.jpg', is_primary: true, display_order: 0, variant_id: 31 }, { product_id: 1, image_url: 'one.jpg', is_primary: true, display_order: 0, variant_id: null }])
  db.seed('discount_codes', [{ id: 1, code: 'TRIEDGE', discount_percent: 10, is_active: true, usage_count: 0 }, { id: 2, code: 'OFF', discount_percent: 50, is_active: false, usage_count: 0 }])
})

const stock = (table: 'products' | 'product_variants', id: number) => db.rows(table).find((r) => r.id === id)?.stock_quantity
const prod = (id: number) => db.rows('products').find((r) => r.id === id)!

describe('quoteCart', () => {
  it('prices a one-off item and a stock item from the database, not from the browser', async () => {
    const q = await quoteCart(client(), [line(1), line(2, null, 2)])
    expect(q.buyable).toBe(true)
    expect(q.totals).toMatchObject({ subtotal: 5000, total: 5000 })
    expect(q.lines[0]).toMatchObject({ title: 'Product 1', oneOff: true, maxQuantity: 1, imageUrl: 'one.jpg', problem: 'ok' })
    expect(q.lines[1]).toMatchObject({ oneOff: false, unitsLeft: 5, quantity: 2 })
  })
  it('limits the quantity to what is in stock', async () => {
    const q = await quoteCart(client(), [line(2, null, 99)])
    expect(q.lines[0].quantity).toBe(5)
  })
  it('requires a color when the product has colors, and knows the color stock and photo', async () => {
    expect((await quoteCart(client(), [line(3)])).lines[0].problem).toBe('choose_color')
    expect((await quoteCart(client(), [line(3, 33)])).lines[0].problem).toBe('color_gone') // inactive color
    const ok = await quoteCart(client(), [line(3, 31, 9)])
    expect(ok.lines[0]).toMatchObject({ colorName: 'Black', quantity: 2, maxQuantity: 2, imageUrl: 'black.jpg', problem: 'ok' })
    const red = await quoteCart(client(), [line(3, 32, 9)])
    expect(red.lines[0]).toMatchObject({ maxQuantity: 5, quantity: 5 }) // empty color stock follows the product's 5
  })
  it('marks sold, held and missing items and leaves them out of the total', async () => {
    const q = await quoteCart(client(), [line(4), line(5), line(99), line(1)])
    expect(q.lines.map((l) => l.problem)).toEqual(['sold', 'reserved', 'gone', 'ok'])
    expect(q.buyable).toBe(false)
    expect(q.totals.total).toBe(1000)
  })
  it('applies a discount code only to products that allow it; rejects unknown or inactive codes', async () => {
    const q = await quoteCart(client(), [line(1), line(6)], { discountCode: 'triedge' })
    expect(q.discountPercent).toBe(10)
    expect(q.totals.discount).toBe(100)
    expect(q.totals.total).toBe(1400)
    expect((await quoteCart(client(), [line(1)], { discountCode: 'OFF' })).discountError).toMatch(/invalid/)
    expect((await quoteCart(client(), [line(1)], { discountCode: 'NOPE' })).discountPercent).toBe(0)
  })
  it('still works before the step 14 migration (no stock column): items are one-offs', async () => {
    db.failing.add('product_variants')
    const q = await quoteCart(client(), [line(1)])
    expect(q.buyable).toBe(true)
  })
})

describe('placeCheckout', () => {
  it('holds a one-off item for 24 hours and stock items by taking them off the stock', async () => {
    const r = await placeCheckout(client(), { lines: [line(1), line(2, null, 2)], customer, now: NOW })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.totals.total).toBe(5000)
    expect(prod(1)).toMatchObject({ status: 'reserved', reserved_until: at(24 * 60).toISOString() })
    expect(stock('products', 2)).toBe(3)
    const order = db.rows('checkout_orders')[0]
    expect(order).toMatchObject({ status: 'pending', hold_expires_at: at(24 * 60).toISOString(), total_egp: 5000, customer_name: 'Ahmed Mohamed', customer_note: 'Call before delivery' })
    expect(db.rows('checkout_items').every((i) => i.held === true)).toBe(true)
    expect(r.code).toMatch(/^PG-/)
  })
  it('colors: a color with its own stock uses it, an empty one uses the product stock', async () => {
    await placeCheckout(client(), { lines: [line(3, 31, 2), line(3, 32, 1)], customer, now: NOW })
    expect(stock('product_variants', 31)).toBe(0)
    expect(stock('products', 3)).toBe(4)
  })
  it('the second customer cannot get a one-off item that is held', async () => {
    expect((await placeCheckout(client(), { lines: [line(1)], customer, now: NOW })).ok).toBe(true)
    const second = await placeCheckout(client(), { lines: [line(1)], customer, now: at(5) })
    expect(second).toMatchObject({ ok: false, reason: 'UNAVAILABLE' })
    expect(db.rows('checkout_orders')).toHaveLength(1)
  })
  it('the last unit goes to one customer only', async () => {
    db.seed('products', [product(2, { stock_quantity: 1 })])
    expect((await placeCheckout(client(), { lines: [line(2)], customer, now: NOW })).ok).toBe(true)
    expect(await placeCheckout(client(), { lines: [line(2)], customer, now: NOW })).toMatchObject({ ok: false })
    expect(stock('products', 2)).toBe(0)
  })
  it('if one item is taken at the last moment, everything held so far is given back', async () => {
    let first = true
    db.onUpdate = (table, patch) => { if (first && table === 'products' && patch.status === 'reserved') { first = false; db.rows('products').find((p) => p.id === 2)!.stock_quantity = 0 } }
    const r = await placeCheckout(client(), { lines: [line(1), line(2)], customer, now: NOW })
    expect(r).toMatchObject({ ok: false, reason: 'UNAVAILABLE' })
    expect(prod(1)).toMatchObject({ status: 'available', reserved_until: null })
    expect(db.rows('checkout_orders')[0].status).toBe('cancelled')
  })
  it('a one-off item taken by someone else between checking and holding is not double-sold', async () => {
    db.onInsert = (table) => { if (table === 'checkout_items') { prod(1).status = 'reserved' } }
    const r = await placeCheckout(client(), { lines: [line(1)], customer, now: NOW })
    expect(r).toMatchObject({ ok: false, reason: 'UNAVAILABLE' })
    expect(prod(1).status).toBe('reserved') // the other customer's hold is untouched
  })
  it('refuses an empty cart, unavailable items and a bad discount code without holding anything', async () => {
    expect(await placeCheckout(client(), { lines: [], customer, now: NOW })).toMatchObject({ ok: false, reason: 'EMPTY' })
    expect(await placeCheckout(client(), { lines: [line(4)], customer, now: NOW })).toMatchObject({ ok: false, reason: 'UNAVAILABLE' })
    expect(await placeCheckout(client(), { lines: [line(1)], customer, discountCode: 'NOPE', now: NOW })).toMatchObject({ ok: false, reason: 'DISCOUNT' })
    expect(prod(1).status).toBe('available')
    expect(db.rows('checkout_orders')).toHaveLength(0)
  })
  it('records the discount and links the account', async () => {
    const r = await placeCheckout(client(), { lines: [line(1)], customer, discountCode: 'triedge', userId: 'user-1', now: NOW })
    expect(r.ok).toBe(true)
    expect(db.rows('checkout_orders')[0]).toMatchObject({ discount_code: 'TRIEDGE', discount_egp: 100, total_egp: 900, user_id: 'user-1' })
  })
})

describe('expiry', () => {
  it('after 24 hours the items go back on sale and the order expires', async () => {
    await placeCheckout(client(), { lines: [line(1), line(2, null, 2)], customer, now: NOW })
    expect(await releaseExpired(client(), at(23 * 60))).toBe(0)
    expect(await releaseExpired(client(), at(25 * 60))).toBe(1)
    expect(prod(1)).toMatchObject({ status: 'available', reserved_until: null })
    expect(stock('products', 2)).toBe(5)
    expect(db.rows('checkout_orders')[0].status).toBe('expired')
  })
  it('a new customer can buy the item once the old hold has expired (checked when ordering)', async () => {
    await placeCheckout(client(), { lines: [line(1)], customer, now: NOW })
    expect((await placeCheckout(client(), { lines: [line(1)], customer, now: at(26 * 60) })).ok).toBe(true)
  })
  it('does not undo a manual reservation made later on the same product', async () => {
    await placeCheckout(client(), { lines: [line(1)], customer, now: NOW })
    prod(1).reserved_until = at(48 * 60).toISOString() // someone reserved it by hand after our hold ended
    await releaseExpired(client(), at(25 * 60))
    expect(prod(1).status).toBe('reserved')
  })
  it('findByCodeAndToken hides the order from a wrong token', async () => {
    const r = await placeCheckout(client(), { lines: [line(1)], customer, now: NOW })
    if (!r.ok) throw new Error('setup')
    expect(await findByCodeAndToken(client(), r.code, r.token)).not.toBeNull()
    expect(await findByCodeAndToken(client(), r.code, 'x'.repeat(r.token.length))).toBeNull()
  })
})

async function pendingOrder(lines = [line(1), line(2, null, 2)], extra: { discountCode?: string } = {}) {
  const placed = await placeCheckout(client(), { lines, customer, userId: 'user-1', now: NOW, ...extra })
  if (!placed.ok) throw new Error('setup: ' + placed.message)
  return placed
}

describe('approveCheckout', () => {
  it('creates one "Order received" deal per item, links the account and sells one-off items', async () => {
    const o = await pendingOrder()
    const res = await approveCheckout(client(), o.id, at(30))
    expect(res.ok).toBe(true)
    const deals = db.rows('deals')
    expect(deals).toHaveLength(2)
    expect(deals[0]).toMatchObject({
      customer_name: 'Ahmed Mohamed', phone: '01012345678', sale_channel: 'website', status: 'deposit_pending',
      selling_price_egp: 1000, user_id: 'user-1', checkout_id: o.id, checkout_code: o.code, item_title: 'Product 1',
    })
    expect(deals[0]).not.toHaveProperty('deposit_amount_egp')
    expect(String(deals[0].notes)).toContain('Call before delivery')
    expect(deals[1]).toMatchObject({ selling_price_egp: 4000, item_title: 'Product 2 x2' })
    expect(prod(1)).toMatchObject({ status: 'sold', reserved_until: null })
    expect(stock('products', 2)).toBe(3) // stays taken off
    expect(db.rows('checkout_orders')[0].status).toBe('approved')
    expect(db.rows('order_events')).toHaveLength(2)
  })
  it('cannot be approved twice', async () => {
    const o = await pendingOrder()
    expect((await approveCheckout(client(), o.id, at(30))).ok).toBe(true)
    expect((await approveCheckout(client(), o.id, at(31))).ok).toBe(false)
    expect(db.rows('deals')).toHaveLength(2)
  })
  it('a discount code becomes the commission and counts as used', async () => {
    const o = await pendingOrder([line(1)], { discountCode: 'TRIEDGE' })
    await approveCheckout(client(), o.id, at(30))
    expect(db.rows('deals')[0]).toMatchObject({ discount_code: 'TRIEDGE', selling_price_egp: 900, commission_egp: 90 })
    expect(db.rows('discount_codes')[0].usage_count).toBe(1)
  })
  it('after the hold expired: takes the item again if it is still available', async () => {
    const placed = await pendingOrder([line(1)])
    await releaseExpired(client(), at(25 * 60))
    const res = await approveCheckout(client(), placed.id, at(26 * 60))
    expect(res.ok).toBe(true)
    expect(prod(1).status).toBe('sold')
  })
  it('after the hold expired: if someone else got the item, nothing is created and the order stays', async () => {
    const placed = await pendingOrder([line(1)])
    await releaseExpired(client(), at(25 * 60))
    prod(1).status = 'sold'
    const res = await approveCheckout(client(), placed.id, at(26 * 60))
    expect(res).toMatchObject({ ok: false })
    expect((res as { message: string }).message).toMatch(/no longer available/)
    expect(db.rows('deals')).toHaveLength(0)
    expect(db.rows('checkout_orders')[0].status).toBe('expired')
  })
  it('if the hold was freed by the daily cleanup, the item is taken again on approval', async () => {
    const o = await pendingOrder([line(1)])
    prod(1).status = 'available'; prod(1).reserved_until = null // freed by the reservation cleanup
    expect((await approveCheckout(client(), o.id, at(30))).ok).toBe(true)
    expect(prod(1).status).toBe('sold')
  })
})

describe('rejectCheckout', () => {
  it('rejecting puts everything back on sale and keeps the reason', async () => {
    const o = await pendingOrder()
    const res = await rejectCheckout(client(), o.id, 'Customer did not answer', at(30))
    expect(res.ok).toBe(true)
    expect(prod(1).status).toBe('available')
    expect(stock('products', 2)).toBe(5)
    expect(db.rows('checkout_orders')[0]).toMatchObject({ status: 'rejected', review_note: 'Customer did not answer' })
    expect((await rejectCheckout(client(), o.id, 'again')).ok).toBe(false)
  })
  it('an approved order cannot be rejected', async () => {
    const o = await pendingOrder()
    await approveCheckout(client(), o.id, at(30))
    expect((await rejectCheckout(client(), o.id, 'x')).ok).toBe(false)
    expect(prod(1).status).toBe('sold')
  })
})

describe('trackCheckout (public tracking of a cart order)', () => {
  it('shows the state to the right phone only, and nothing private', async () => {
    const o = await pendingOrder([line(1)])
    expect(await trackCheckout(client(), o.code, '9999', at(40))).toEqual({ kind: 'none' })
    expect(await trackCheckout(client(), 'PG-00000000', '5678', at(40))).toEqual({ kind: 'none' })
    const r = await trackCheckout(client(), o.code, '5678', at(40))
    expect(r.kind).toBe('pending')
    if (r.kind === 'pending') {
      expect(r.checkout).toMatchObject({ code: o.code, status: 'pending', items: [{ title: 'Product 1', quantity: 1 }], totalEgp: 1000 })
      expect(JSON.stringify(r)).not.toMatch(/token|address|01012345678/)
    }
  })
  it('after approval shows every item as its own order with the item name and the update log', async () => {
    const o = await pendingOrder([line(1), line(2, null, 2)])
    await approveCheckout(client(), o.id, at(30))
    const r = await trackCheckout(client(), o.code, '5678', at(40))
    expect(r.kind).toBe('orders')
    if (r.kind === 'orders') {
      expect(r.orders.map((x) => x.title)).toEqual(['Product 1', 'Product 2 x2'])
      expect(r.orders[0].headline).toBe('Order received')
      expect(r.orders[0].events[0].title).toBe('Order received')
    }
  })
  it('a rejected order shows the reason', async () => {
    const o = await pendingOrder([line(1)])
    await rejectCheckout(client(), o.id, 'Customer did not answer', at(30))
    expect(await trackCheckout(client(), o.code, '5678', at(40))).toMatchObject({ kind: 'pending', checkout: { status: 'rejected', note: 'Customer did not answer' } })
  })
})
