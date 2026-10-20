import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = { dealStatus: 'shipping', events: [] as { deal_id: string; status: string | null; title: string; comment: string | null }[], deleted: [] as string[] }
const statusCalls: unknown[][] = []

function fakeDb() {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: table === 'deals' ? { status: state.dealStatus } : null, error: null }),
          order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: state.events.length ? { title: state.events[state.events.length - 1].title } : null, error: null }) }) }),
        }),
      }),
      insert: async (row: (typeof state.events)[number]) => { state.events.push(row); return { error: null } },
      delete: () => ({ eq: async (_c: string, id: string) => { state.deleted.push(id); return { error: null } } }),
    }),
  }
}

vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => fakeDb() }))
vi.mock('@/lib/admin-auth', () => ({ assertAdmin: async () => {} }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('../../deals/actions', () => ({ updateDealStatus: async (...a: unknown[]) => { statusCalls.push(a) } }))

import { deleteOrderEvent, setOrderStatus } from '../actions'

const form = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f }
const DEAL = '11111111-1111-4111-8111-111111111111'

beforeEach(() => { state.dealStatus = 'shipping'; state.events = []; state.deleted = []; statusCalls.length = 0 })

describe('setOrderStatus', () => {
  it('changes the status through the shared logic and passes the comment along', async () => {
    const r = await setOrderStatus(null, form({ deal_id: DEAL, status: 'egypt_handling', comment: 'Customs clearing' }))
    expect(r.ok).toBe(true)
    expect(statusCalls).toEqual([[DEAL, 'egypt_handling', undefined, 'Customs clearing']])
  })

  it('choosing the same status with a comment only posts the comment, without touching the status', async () => {
    const r = await setOrderStatus(null, form({ deal_id: DEAL, status: 'shipping', comment: 'Courier will call you' }))
    expect(r.ok).toBe(true)
    expect(statusCalls).toHaveLength(0)
    expect(state.events).toEqual([{ deal_id: DEAL, status: 'shipping', title: 'On its way from Europe', comment: 'Courier will call you' }])
  })

  it('the same status without a comment is refused with a helpful message', async () => {
    const r = await setOrderStatus(null, form({ deal_id: DEAL, status: 'shipping' }))
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/already has this status/)
    expect(statusCalls).toHaveLength(0)
  })

  it('an order waiting for its deposit already counts as "Order received", so nothing changes silently', async () => {
    state.dealStatus = 'deposit_pending'
    const r = await setOrderStatus(null, form({ deal_id: DEAL, status: 'deposit_paid' }))
    expect(r.ok).toBe(false)
    expect(statusCalls).toHaveLength(0)
  })

  it('rejects unknown statuses (deposit pending is not offered here) and a missing order', async () => {
    expect((await setOrderStatus(null, form({ deal_id: DEAL, status: 'deposit_pending' }))).ok).toBe(false)
    expect((await setOrderStatus(null, form({ deal_id: DEAL, status: 'hacked' }))).ok).toBe(false)
    expect((await setOrderStatus(null, form({ status: 'shipping' }))).ok).toBe(false)
  })

  it('a cancelled order passes the comment as the cancellation reason too', async () => {
    await setOrderStatus(null, form({ deal_id: DEAL, status: 'cancelled', comment: 'Seller sold it' }))
    expect(statusCalls[0]).toEqual([DEAL, 'cancelled', 'Seller sold it', 'Seller sold it'])
  })
})

describe('deleteOrderEvent', () => {
  it('removes one update by id, and ignores anything that is not an id', async () => {
    await deleteOrderEvent(form({ event_id: '22222222-2222-4222-8222-222222222222' }))
    await deleteOrderEvent(form({ event_id: "x'; drop table order_events;--" }))
    expect(state.deleted).toEqual(['22222222-2222-4222-8222-222222222222'])
  })
})
