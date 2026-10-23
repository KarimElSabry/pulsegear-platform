import { describe, it, expect } from 'vitest'
import { buildTimeline, toCustomerOrder, suggestAccounts, buildFollowUps, whatsappLink, type DealLite } from '../orders'

const deal = (o: Partial<DealLite> = {}): DealLite => ({ id: 'd1', status: 'deposit_paid', created_at: '2026-10-01T10:00:00Z', ...o })

describe('buildTimeline', () => {
  it('marks earlier steps done, the current one current, later ones upcoming', () => {
    const t = buildTimeline(deal({ status: 'shipping', shipped_at: '2026-10-05T00:00:00Z' }))
    expect(t.map(s => s.state)).toEqual(['done', 'done', 'done', 'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])
    expect(t.find(s => s.key === 'shipping')?.at).toBe('2026-10-05T00:00:00Z')
  })
  it('shows every step done once delivered', () => {
    expect(buildTimeline(deal({ status: 'delivered' })).every(s => s.state === 'done')).toBe(true)
    expect(buildTimeline(deal({ status: 'completed' })).every(s => s.state === 'done')).toBe(true)
  })
  it('has no timeline when cancelled, and only "placed" for an unknown status', () => {
    expect(buildTimeline(deal({ status: 'cancelled' }))).toEqual([])
    expect(buildTimeline(deal({ status: 'weird' }))[0].state).toBe('current')
  })
  it('does not show dates for steps not reached yet', () => {
    const t = buildTimeline(deal({ status: 'sourcing', shipped_at: '2026-10-09T00:00:00Z' }))
    expect(t.find(s => s.key === 'shipping')?.at).toBeNull()
  })
})

describe('toCustomerOrder', () => {
  it('never exposes cost, margin, source link or internal notes', () => {
    const leaky = { ...deal(), source_price_eur: 80, commission_egp: 500, notes: 'secret', source_link: 'https://x', exchange_rate: 55 } as DealLite
    const out = JSON.stringify(toCustomerOrder(leaky, 'Garmin 265'))
    for (const bad of ['source_price', 'commission', 'secret', 'https://x', 'exchange_rate', '"notes"']) expect(out).not.toContain(bad)
  })
  it('uses a friendly title and only counts the deposit once paid', () => {
    const o = toCustomerOrder(deal({ status: 'deposit_pending', deposit_amount_egp: '1000' }), '')
    expect(o.title).toBe('Your order')
    expect(o.paidEgp).toBeNull()
    expect(toCustomerOrder(deal({ status: 'shipping', deposit_amount_egp: '1000' })).paidEgp).toBe(1000)
  })
  it('flags cancelled orders', () => expect(toCustomerOrder(deal({ status: 'cancelled' })).cancelled).toBe(true))
})

describe('suggestAccounts', () => {
  const accounts = [
    { user_id: 'a', name: 'Omar Hassan', phone: '+20 101 234 5678' },
    { user_id: 'b', name: 'Sara Ali', phone: null },
  ]
  it('matches by phone across formats, then by exact name', () => {
    expect(suggestAccounts({ id: 'x', status: 's', phone: '01012345678' }, accounts)[0]).toMatchObject({ reason: 'phone', account: { user_id: 'a' } })
    expect(suggestAccounts({ id: 'x', status: 's', customer_name: 'sara ali' }, accounts)[0]).toMatchObject({ reason: 'name', account: { user_id: 'b' } })
  })
  it('ranks phone before name and ignores short names and missing data', () => {
    const r = suggestAccounts({ id: 'x', status: 's', phone: '01012345678', customer_name: 'Sara Ali' }, accounts)
    expect(r.map(x => x.reason)).toEqual(['phone', 'name'])
    expect(suggestAccounts({ id: 'x', status: 's', customer_name: 'Al' }, [{ user_id: 'c', name: 'Al' }])).toEqual([])
  })
})

describe('follow-ups', () => {
  const now = new Date('2026-10-20T12:00:00Z')
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString()
  it('lists stale requests, unpaid deposits and pending reservations, oldest first', () => {
    const list = buildFollowUps({
      requests: [
        { id: 1, customer_name: 'A', phone: '01011112222', requested_product: 'Watch', status: 'pending', created_at: daysAgo(3) },
        { id: 2, customer_name: 'B', status: 'pending', created_at: daysAgo(0) },          // too fresh
        { id: 3, customer_name: 'C', status: 'completed', created_at: daysAgo(9) },        // finished
        { id: 4, customer_name: 'D', status: 'pending', created_at: daysAgo(8) },          // already has a deal
      ],
      deals: [
        { id: 'd1', product_request_id: 4, customer_name: 'D', status: 'deposit_pending', created_at: daysAgo(5) },
        { id: 'd2', customer_name: 'E', status: 'deposit_pending', created_at: daysAgo(1) }, // not yet
      ],
      reservations: [{ id: 7, name: 'F', phone: '01022223333', status: 'pending', created_at: daysAgo(2) }],
    }, now)
    expect(list.map(f => `${f.kind}:${f.ref}`)).toEqual(['deposit:d1', 'request:1', 'reservation:7'])
    expect(list[1].whatsapp).toContain('https://wa.me/201011112222?text=')
  })
  it('builds whatsapp links with the Egypt prefix and skips bad numbers', () => {
    expect(whatsappLink('0100 111 2222', 'hi')).toBe('https://wa.me/2001001112222'.replace('2001', '201') + '?text=hi')
    expect(whatsappLink('+49 170 1234567', 'hi')).toContain('wa.me/491701234567')
    expect(whatsappLink('12', 'hi')).toBeNull()
  })
})

import { expectedDelivery, normalizeOrderCode, phoneLast4Matches, statusHeadline, toPublicOrder } from '../orders'

describe('expected delivery', () => {
  const now = new Date('2026-10-20T12:00:00Z')
  it('a date set by hand wins and is exact', () => {
    expect(expectedDelivery(deal({ status: 'shipping', expected_delivery_date: '2026-10-28' }), now)).toEqual({ from: '2026-10-28', to: null, estimate: false })
  })
  it('estimates 1 to 2 weeks from the deposit', () => {
    expect(expectedDelivery(deal({ status: 'sourcing', deposit_paid_at: '2026-10-18T10:00:00Z' }), now)).toEqual({ from: '2026-10-25', to: '2026-11-01', estimate: true })
  })
  it('after arrival in Egypt, estimates 1 to 3 days; out for delivery means today or tomorrow', () => {
    expect(expectedDelivery(deal({ status: 'arrived_egypt', arrived_egypt_at: '2026-10-19T10:00:00Z' }), now)).toEqual({ from: '2026-10-20', to: '2026-10-22', estimate: true })
    expect(expectedDelivery(deal({ status: 'out_for_delivery' }), now)).toEqual({ from: '2026-10-20', to: '2026-10-21', estimate: true })
  })
  it('shows nothing when delivered, cancelled, or when the estimate is already past', () => {
    expect(expectedDelivery(deal({ status: 'delivered' }), now)).toBeNull()
    expect(expectedDelivery(deal({ status: 'cancelled' }), now)).toBeNull()
    expect(expectedDelivery(deal({ status: 'shipping', deposit_paid_at: '2026-08-01T00:00:00Z' }), now)).toBeNull()
  })
  it('has a plain headline for every status and a safe default', () => {
    expect(statusHeadline('shipping')).toBe('On its way from Europe')
    expect(statusHeadline('egypt_handling')).toBe('Shipping handling in Egypt')
    expect(statusHeadline('deposit_pending')).toBe('Order received')
    expect(statusHeadline('deposit_paid')).toBe('Order received')
    expect(statusHeadline('whatever')).toBe('In progress')
  })
})

describe('public tracking helpers', () => {
  it('normalises order codes typed in any way and rejects anything else', () => {
    expect(normalizeOrderCode('pg-3fa9c21b')).toBe('PG-3FA9C21B')
    expect(normalizeOrderCode(' PG 3FA9 C21B ')).toBe('PG-3FA9C21B')
    expect(normalizeOrderCode('3fa9c21b')).toBe('PG-3FA9C21B')
    for (const bad of ['', 'PG-123', 'PG-3FA9C21BZ', "PG-'; drop table", null, undefined]) expect(normalizeOrderCode(bad as string)).toBeNull()
  })
  it('matches the last 4 digits of the phone however it was written', () => {
    expect(phoneLast4Matches('+20 100 111 2222', '2222')).toBe(true)
    expect(phoneLast4Matches('01001112222', '22-22')).toBe(true)
    expect(phoneLast4Matches('01001112222', '1111')).toBe(false)
    expect(phoneLast4Matches(null, '2222')).toBe(false)
    expect(phoneLast4Matches('01001112222', '22')).toBe(false)
    expect(phoneLast4Matches('123', '123')).toBe(false)
  })
  it('the public order has no prices, name, phone or notes', () => {
    const full = toCustomerOrder({ ...deal({ status: 'shipping', order_code: 'PG-3FA9C21B', selling_price_egp: 9000, deposit_amount_egp: 4500, remaining_amount_egp: 4500 }), customer_name: 'Omar', phone: '01001112222' } as DealLite, 'Garmin 265')
    const out = JSON.stringify(toPublicOrder(full))
    for (const bad of ['9000', '4500', 'Omar', '01001112222', 'sellingPrice', 'paidEgp', 'remainingEgp']) expect(out).not.toContain(bad)
    expect(out).toContain('PG-3FA9C21B')
  })
})

import { ADMIN_STATUS_OPTIONS, adminStatusValue } from '../orders'
import { isDuplicateEvent } from '../order-events'

describe('update log', () => {
  const ev = (status: string | null, title: string, at: string, comment: string | null = null) => ({ status, title, comment, created_at: at })

  it('has the new steps in order, with Shipping handling in Egypt before Out for delivery', () => {
    expect(buildTimeline(deal({ status: 'sourcing' })).map(s => s.label)).toEqual([
      'Order received', 'We are sourcing your item', 'Item purchased', 'On its way from Europe',
      'Arrived in Egypt', 'Shipping handling in Egypt', 'Out for delivery', 'Delivered'])
    const t = buildTimeline(deal({ status: 'egypt_handling' }))
    expect(t.map(s => s.state)).toEqual(['done', 'done', 'done', 'done', 'done', 'current', 'upcoming', 'upcoming'])
  })
  it('deposit pending and deposit paid are both just "Order received" for the customer', () => {
    expect(buildTimeline(deal({ status: 'deposit_pending' }))[0].state).toBe('current')
    expect(buildTimeline(deal({ status: 'deposit_paid' }))[0].state).toBe('current')
  })
  it('dates each step from the latest update for it, falling back to the date saved on the order', () => {
    const t = buildTimeline(deal({ status: 'purchased', created_at: '2026-10-01T10:00:00Z' }), [
      ev('sourcing', 'We are sourcing your item', '2026-10-03T09:00:00Z'),
      ev('purchased', 'Item purchased', '2026-10-05T12:30:00Z'),
      ev('purchased', 'Item purchased', '2026-10-06T08:00:00Z', 'Seller packed it'),
    ])
    expect(t.find(s => s.key === 'sourcing')?.at).toBe('2026-10-03T09:00:00Z')
    expect(t.find(s => s.key === 'purchased')?.at).toBe('2026-10-06T08:00:00Z')
    expect(t.find(s => s.key === 'received')?.at).toBe('2026-10-01T10:00:00Z')
    expect(t.find(s => s.key === 'shipping')?.at).toBeNull()
  })
  it('the customer order lists the updates newest first, with comments, and last update is the newest', () => {
    const o = toCustomerOrder(deal({ status: 'shipping' }), 'Watch', new Date('2026-10-20T00:00:00Z'), [
      ev('purchased', 'Item purchased', '2026-10-05T12:00:00Z'),
      ev('shipping', 'On its way from Europe', '2026-10-08T09:00:00Z', 'Tracking: DHL123'),
    ])
    expect(o.events.map(e => e.title)).toEqual(['On its way from Europe', 'Item purchased'])
    expect(o.events[0].comment).toBe('Tracking: DHL123')
    expect(o.lastUpdateAt).toBe('2026-10-08T09:00:00Z')
  })
  it('the public order carries the updates', () => {
    const o = toCustomerOrder(deal({ status: 'shipping', order_code: 'PG-3FA9C21B' }), 'Watch', new Date('2026-10-20T00:00:00Z'), [ev('shipping', 'On its way from Europe', '2026-10-08T09:00:00Z', 'Leaves Friday')])
    expect(toPublicOrder(o).events).toEqual([{ title: 'On its way from Europe', comment: 'Leaves Friday', at: '2026-10-08T09:00:00Z' }])
  })
  it('offers the statuses you asked for and no "deposit pending"', () => {
    const labels = ADMIN_STATUS_OPTIONS.map(o => o.label)
    expect(labels).toContain('Order received')
    expect(labels).toContain('On its way from Europe')
    expect(labels).toContain('Shipping handling in Egypt')
    // every status the Deals page has must be selectable here, or the dropdown would show the wrong one for that order
    for (const st of ['sourcing', 'purchased', 'shipping', 'arrived_egypt', 'egypt_handling', 'out_for_delivery', 'delivered', 'remaining_pending', 'completed', 'cancelled']) expect(ADMIN_STATUS_OPTIONS.some(o => o.value === adminStatusValue(st))).toBe(true)
    expect(labels.some(l => /deposit/i.test(l))).toBe(false)
    expect(adminStatusValue('deposit_pending')).toBe('deposit_paid')
    expect(adminStatusValue('shipping')).toBe('shipping')
  })
  it('a repeated title without a new comment is not logged twice', () => {
    expect(isDuplicateEvent({ title: 'Order received' }, 'Order received', null)).toBe(true)
    expect(isDuplicateEvent({ title: 'Order received' }, 'Order received', 'Deposit arrived')).toBe(false)
    expect(isDuplicateEvent({ title: 'Item purchased' }, 'Order received', null)).toBe(false)
    expect(isDuplicateEvent(null, 'Order received', null)).toBe(false)
  })
})
