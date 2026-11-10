import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from '@/lib/__tests__/fakeDb'

let db: FakeDb
vi.mock('@/lib/admin-auth', () => ({ assertAdmin: async () => {} }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: (t: string) => db.from(t) }) }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

import { createDeal, updateDeal, updateDealStatus } from '../actions'

const deal = (id: string, over: Record<string, unknown> = {}) => ({
  id, status: 'delivered', customer_name: 'Ahmed', phone: '01012345678', item_title: 'Watch', selling_price_egp: 5000, source_price_eur: 50, shipping_eur: 5, exchange_rate: 50,
  egypt_shipping_egp: 0, commission_egp: 0, remaining_paid_at: '2026-11-20T10:00:00Z', product_request_id: null, ...over,
})
const form = (fields: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(fields)) f.set(k, v); return f }
const sales = () => db.rows('sales')

beforeEach(() => {
  db = new FakeDb()
  db.seed('deals', [deal('own-0000001'), deal('client-00001', { client_listing: true })])
  db.seed('sales', [])
  db.seed('order_events', [])
})

describe('client items stay out of the finance system', () => {
  it('a completed normal order becomes a sale; a completed client item does not', async () => {
    await updateDealStatus('own-0000001', 'completed')
    await updateDealStatus('client-00001', 'completed')
    expect(sales().map((s) => s.deal_id)).toEqual(['own-0000001'])
  })
  it('a sale that was counted before the order was marked as a client item is removed', async () => {
    db.seed('sales', [{ id: 's1', deal_id: 'client-00001', selling_price_egp: 5000 }, { id: 's2', deal_id: 'own-0000001', selling_price_egp: 5000 }])
    await updateDealStatus('client-00001', 'completed')
    expect(sales().map((s) => s.id)).toEqual(['s2'])
  })
  it('ticking "client item" while editing a completed order removes its sale', async () => {
    db.rows('deals').find((d) => d.id === 'own-0000001')!.status = 'completed'
    db.seed('sales', [{ id: 's2', deal_id: 'own-0000001', selling_price_egp: 5000 }])
    await updateDeal('own-0000001', form({ customer_name: 'Ahmed', selling_price_egp: '5000', client_listing: 'on' }))
    expect(db.rows('deals').find((d) => d.id === 'own-0000001')?.client_listing).toBe(true)
    expect(sales()).toHaveLength(0)
  })
  it('unticking it on a completed order makes it a normal sale again', async () => {
    db.rows('deals').find((d) => d.id === 'client-00001')!.status = 'completed'
    await updateDeal('client-00001', form({ customer_name: 'Ahmed', selling_price_egp: '5000' }))
    expect(db.rows('deals').find((d) => d.id === 'client-00001')?.client_listing).toBe(false)
    expect(sales().map((s) => s.deal_id)).toEqual(['client-00001'])
  })
  it('editing a normal order without the tick leaves everything as it was', async () => {
    db.rows('deals').find((d) => d.id === 'own-0000001')!.status = 'completed'
    db.seed('sales', [{ id: 's2', deal_id: 'own-0000001', selling_price_egp: 4000 }])
    await updateDeal('own-0000001', form({ customer_name: 'Ahmed', selling_price_egp: '5000' }))
    expect(sales().map((s) => [s.id, s.selling_price_egp])).toEqual([['s2', 5000]])
    expect(db.rows('deals').find((d) => d.id === 'own-0000001')?.client_listing).toBeUndefined()
  })
  it('a new order created with the tick is marked, one without it is not', async () => {
    await createDeal(form({ customer_name: 'Sara', selling_price_egp: '3000', client_listing: 'on' }))
    await createDeal(form({ customer_name: 'Omar', selling_price_egp: '3000' }))
    const created = db.rows('deals').slice(-2)
    expect(created.map((d) => d.client_listing)).toEqual([true, undefined])
  })
})
