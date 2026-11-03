import { describe, expect, it } from 'vitest'
import { buildBoard, countByFilter, filterMatches, parseFilter, stageLabel, stageOf, visibleOrders, type BoardCheckout, type BoardDeal } from '../order-board'

const deal = (id: string, status: string, over: Partial<BoardDeal> = {}): BoardDeal => ({
  id, status, customer_name: 'Ali', phone: '01012345678', user_id: null, created_at: '2026-11-01T10:00:00Z', item_title: 'Garmin', order_code: null,
  expected_delivery_date: null, selling_price_egp: 1000, deposit_amount_egp: null, deposit_paid_at: null, checkout_id: null, checkout_code: null, ...over,
})
const checkout = (id: string, status: BoardCheckout['status'], over: Partial<BoardCheckout> = {}): BoardCheckout => ({
  id, code: `PG-${id}`, status, customer_name: 'Mona Ahmed', phone: '01099998888', created_at: '2026-11-02T10:00:00Z', total_egp: 5000, hold_expires_at: null, ...over,
})

describe('stageOf', () => {
  it('website order not confirmed yet: waiting for the deposit, or a receipt to check', () => {
    expect(stageOf('pending', [], false)).toBe('waiting_payment')
    expect(stageOf('pending', [], true)).toBe('receipt')
  })
  it('rejected, expired and cancelled website orders are closed', () => {
    for (const s of ['rejected', 'expired', 'cancelled'] as const) expect(stageOf(s, [], true)).toBe('closed')
  })
  it('a confirmed order whose deposit is not marked paid waits for the deposit, or the receipt', () => {
    expect(stageOf('approved', [{ status: 'deposit_pending' }], false)).toBe('waiting_payment')
    expect(stageOf('approved', [{ status: 'deposit_pending' }, { status: 'deposit_paid' }], true)).toBe('receipt')
  })
  it('is active while being bought and shipped, ignoring cancelled items', () => {
    expect(stageOf('approved', [{ status: 'sourcing' }, { status: 'cancelled' }], false)).toBe('active')
    expect(stageOf('approved', [{ status: 'shipping' }, { status: 'purchased' }], false)).toBe('active')
  })
  it('needs you when everything is delivered but not completed', () => {
    expect(stageOf('approved', [{ status: 'delivered' }, { status: 'remaining_pending' }], false)).toBe('remaining')
    expect(stageOf('approved', [{ status: 'completed' }, { status: 'delivered' }], false)).toBe('remaining')
  })
  it('is completed only when every live item is completed', () => {
    expect(stageOf('approved', [{ status: 'completed' }, { status: 'cancelled' }], false)).toBe('completed')
    expect(stageOf('approved', [{ status: 'completed' }, { status: 'shipping' }], false)).toBe('active')
  })
  it('is closed when every item is cancelled', () => {
    expect(stageOf('approved', [{ status: 'cancelled' }, { status: 'cancelled' }], false)).toBe('closed')
  })
  it('manual deals use the same rules without a website order', () => {
    expect(stageOf(null, [{ status: 'deposit_pending' }], false)).toBe('waiting_payment')
    expect(stageOf(null, [{ status: 'completed' }], false)).toBe('completed')
    expect(stageOf(null, [{ status: 'cancelled' }], false)).toBe('closed')
  })
})

describe('labels and filters', () => {
  it('names the common status, or says the items differ', () => {
    expect(stageLabel('active', [{ status: 'shipping' }])).toBe('On its way from Europe')
    expect(stageLabel('active', [{ status: 'shipping' }, { status: 'sourcing' }])).toBe('In progress (items differ)')
  })
  it('every stage lands in exactly the expected tabs', () => {
    expect(filterMatches('receipt', 'needs_me') && filterMatches('receipt', 'active')).toBe(true)
    expect(filterMatches('remaining', 'needs_me') && filterMatches('remaining', 'active')).toBe(true)
    expect(filterMatches('waiting_payment', 'needs_me')).toBe(false)
    expect(filterMatches('waiting_payment', 'active')).toBe(true)
    expect(filterMatches('completed', 'active')).toBe(false)
    expect(filterMatches('completed', 'completed')).toBe(true)
    expect(filterMatches('closed', 'closed')).toBe(true)
    expect(filterMatches('closed', 'active')).toBe(false)
  })
  it('an unknown filter falls back to Active', () => {
    expect(parseFilter('nope')).toBe('active')
    expect(parseFilter('completed')).toBe('completed')
  })
})

describe('buildBoard', () => {
  const checkouts = [checkout('a', 'pending'), checkout('b', 'approved'), checkout('c', 'cancelled')]
  const deals = [
    deal('d1', 'sourcing', { checkout_id: 'b', checkout_code: 'PG-b', item_title: 'Watch' }),
    deal('d2', 'shipping', { checkout_id: 'b', checkout_code: 'PG-b', item_title: 'Strap' }),
    deal('d3', 'completed', { customer_name: 'Hand Deal' }),
    deal('d4', 'sourcing', { checkout_id: 'not-loaded' }),
  ]
  const items = [
    { checkout_id: 'a', title: 'Garmin 265', color_name: 'Black', quantity: 1, unit_price_egp: 20000, discount_egp: 500 },
    { checkout_id: 'b', title: 'Watch', color_name: null, quantity: 2, unit_price_egp: 1000, discount_egp: 0 },
  ]
  const board = buildBoard({ checkouts, deals, items, waitingReceipts: new Set(['a']) })

  it('groups the deals of one website order and keeps hand-made deals on their own', () => {
    expect(board).toHaveLength(5)
    expect(board.find((o) => o.checkout?.id === 'b')?.deals.map((d) => d.id)).toEqual(['d1', 'd2'])
    expect(board.filter((o) => o.kind === 'manual').map((o) => o.deals[0].id).sort()).toEqual(['d3', 'd4'])
  })
  it('computes item totals after discount and the stage with the waiting receipt', () => {
    const a = board.find((o) => o.checkout?.id === 'a')!
    expect(a.items).toEqual([{ title: 'Garmin 265', color: 'Black', quantity: 1, net: 19500 }])
    expect(a.stage).toBe('receipt')
  })
  it('counts the tabs', () => {
    expect(countByFilter(board)).toEqual({ needs_me: 1, active: 3, completed: 1, closed: 1, all: 5 })
  })
  it('puts what needs you first in the Active tab, newest first within a stage', () => {
    const ids = visibleOrders(board, 'active', '').map((o) => o.key)
    expect(ids[0]).toBe('c:a')
    expect(ids).toHaveLength(3)
  })
  it('searches name, order ID, item and phone digits', () => {
    expect(visibleOrders(board, 'all', 'mona')).toHaveLength(3)
    expect(visibleOrders(board, 'all', 'PG-b').map((o) => o.key)).toEqual(['c:b'])
    expect(visibleOrders(board, 'all', 'strap')).toHaveLength(0)
    expect(visibleOrders(board, 'all', 'garmin').map((o) => o.key).sort()).toEqual(['c:a', 'd:d3', 'd:d4'])
    expect(visibleOrders(board, 'all', '0109999').length).toBe(3)
    expect(visibleOrders(board, 'all', '12')).toHaveLength(0)
  })
})
