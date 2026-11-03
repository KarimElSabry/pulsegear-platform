import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from '@/lib/__tests__/fakeDb'

let db: FakeDb
vi.mock('@/lib/admin-auth', () => ({ assertAdmin: async () => {} }))
vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => db }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))
vi.mock('../../deals/actions', () => ({ updateDealStatus: async () => {} }))

import { editOrderEvent, setEventHidden } from '../actions'

const E1 = '11111111-1111-4111-8111-111111111111'
const form = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f }

beforeEach(() => {
  db = new FakeDb()
  db.seed('order_events', [{ id: E1, title: 'Shipping', comment: 'old', hidden: false }, { id: '22222222-2222-4222-8222-222222222222', title: 'Other', comment: null, hidden: false }])
})

describe('editing and hiding updates', () => {
  it('changes the words of exactly one update', async () => {
    await editOrderEvent(form({ event_id: E1, title: 'On its way', comment: 'DHL 123' }))
    expect(db.rows('order_events').map((e) => [e.title, e.comment])).toEqual([['On its way', 'DHL 123'], ['Other', null]])
  })
  it('refuses an empty title or a bad id', async () => {
    await editOrderEvent(form({ event_id: E1, title: '  ', comment: 'x' }))
    await editOrderEvent(form({ event_id: 'nope', title: 'x' }))
    expect(db.rows('order_events')[0].title).toBe('Shipping')
  })
  it('hides and shows an update', async () => {
    await setEventHidden(form({ event_id: E1, hide: '1' }))
    expect(db.rows('order_events').map((e) => e.hidden)).toEqual([true, false])
    await setEventHidden(form({ event_id: E1, hide: '0' }))
    expect(db.rows('order_events')[0].hidden).toBe(false)
  })
})
