import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from '@/lib/__tests__/fakeDb'

let db: FakeDb
const moved: { id: string; status: string }[] = []

vi.mock('@/lib/admin-auth', () => ({ assertAdmin: async () => {} }))
vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => db }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))
vi.mock('../../deals/actions', () => ({
  updateDealStatus: async (id: string, status: string) => { moved.push({ id, status }); db.rows('deals').find((d) => d.id === id)!.status = status },
}))

import { saveExpectedDelivery, setOrderStatus } from '../actions'

const form = (fields: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(fields)) f.set(k, v); return f }

beforeEach(() => {
  moved.length = 0
  db = new FakeDb()
  db.seed('deals', [
    { id: 'deal-0000001', status: 'sourcing' },
    { id: 'deal-0000002', status: 'purchased' },
    { id: 'deal-0000003', status: 'cancelled' },
  ])
})

describe('one status for the whole order', () => {
  it('moves every live item together and leaves a cancelled item cancelled', async () => {
    const r = await setOrderStatus(null, form({ deal_ids: 'deal-0000001,deal-0000002,deal-0000003', status: 'shipping' }))
    expect(r.ok).toBe(true)
    expect(moved.map((m) => m.id)).toEqual(['deal-0000001', 'deal-0000002'])
    expect(db.rows('deals').map((d) => d.status)).toEqual(['shipping', 'shipping', 'cancelled'])
  })
  it('still accepts the old single deal_id form field', async () => {
    expect((await setOrderStatus(null, form({ deal_id: 'deal-0000001', status: 'purchased' }))).ok).toBe(true)
    expect(moved).toEqual([{ id: 'deal-0000001', status: 'purchased' }])
  })
  it('choosing the status every item already has changes nothing', async () => {
    expect(await setOrderStatus(null, form({ deal_ids: 'deal-0000001', status: 'sourcing' }))).toMatchObject({ ok: false })
    expect(moved).toHaveLength(0)
  })
  it('rejects an invalid status, missing ids and ids that are not plain ids', async () => {
    expect((await setOrderStatus(null, form({ deal_ids: 'deal-0000001', status: 'bogus' }))).ok).toBe(false)
    expect((await setOrderStatus(null, form({ status: 'shipping' }))).ok).toBe(false)
    expect((await setOrderStatus(null, form({ deal_ids: 'x;drop table', status: 'shipping' }))).ok).toBe(false)
    expect(moved).toHaveLength(0)
  })
  it('refuses to move an order whose items are all cancelled', async () => {
    expect((await setOrderStatus(null, form({ deal_ids: 'deal-0000003', status: 'shipping' }))).ok).toBe(false)
    expect(moved).toHaveLength(0)
  })
})

describe('one delivery date for the whole order', () => {
  it('saves it on every item', async () => {
    const r = await saveExpectedDelivery(null, form({ deal_ids: 'deal-0000001,deal-0000002', expected_delivery_date: '2026-11-20' }))
    expect(r.ok).toBe(true)
    expect(db.rows('deals').map((d) => d.expected_delivery_date)).toEqual(['2026-11-20', '2026-11-20', undefined])
  })
  it('rejects a bad date', async () => {
    expect((await saveExpectedDelivery(null, form({ deal_ids: 'deal-0000001', expected_delivery_date: '20/11/2026' }))).ok).toBe(false)
  })
})
