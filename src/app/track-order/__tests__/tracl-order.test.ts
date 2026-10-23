import { beforeEach, describe, expect, it, vi } from 'vitest'

let ip = '1.1.1.1'
const row = {
  id: 'd1', status: 'shipping', phone: '+20 100 111 2222', product_request_id: 5, created_at: '2026-10-10T10:00:00Z',
  deposit_paid_at: '2026-10-11T10:00:00Z', shipped_at: '2026-10-15T10:00:00Z', arrived_egypt_at: null, delivered_at: null,
  order_code: 'PG-3FA9C21B', expected_delivery_date: '2026-10-28',
  selling_price_egp: 9000, customer_name: 'Omar',
}
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': ip }) }))
const events = [
  { id: 'e2', deal_id: 'd1', status: 'shipping', title: 'On its way from Europe', comment: 'Left Germany today', created_at: '2026-10-15T10:00:00Z' },
  { id: 'e1', deal_id: 'd1', status: 'deposit_pending', title: 'Order received', comment: null, created_at: '2026-10-10T10:00:00Z' },
]
vi.mock('@/lib/supabase', () => ({
  createAdminSupabaseClient: () => ({
    from: (table: string) => ({
      select: () => ({
        in: () => ({ order: async () => ({ data: table === 'order_events' ? events : [], error: null }) }),
        eq: (_c: string, v: unknown) => ({
          maybeSingle: async () => table === 'deals'
            ? { data: v === row.order_code ? row : null, error: null }
            : { data: { requested_product: 'Garmin 265' }, error: null },
        }),
      }),
    }),
  }),
}))

import { trackOrder } from '../actions'
import { resetRateLimits } from '@/lib/rate-limit'

const form = (code: string, phone: string) => { const f = new FormData(); f.set('order_code', code); f.set('phone_last4', phone); return f }

beforeEach(() => { resetRateLimits(); ip = '1.1.1.1' })

describe('trackOrder (public)', () => {
  it('shows the status for the right order ID and phone ending', async () => {
    const r = await trackOrder(null, form('pg-3fa9c21b', '2222'))
    expect(r.ok).toBe(true)
    expect(r.order).toMatchObject({ orderCode: 'PG-3FA9C21B', headline: 'On its way from Europe', title: 'Garmin 265' })
    expect(r.order?.events.map((e) => e.title)).toEqual(['On its way from Europe', 'Order received'])
    expect(r.order?.events[0].comment).toBe('Left Germany today')
    expect(r.order?.expected).toEqual({ from: '2026-10-28', to: null, estimate: false })
  })

  it('never returns prices, the name or the phone', async () => {
    const out = JSON.stringify(await trackOrder(null, form('PG-3FA9C21B', '2222')))
    for (const bad of ['9000', 'Omar', '01001112222', '1112222']) expect(out).not.toContain(bad)
  })

  it('gives the same answer for a wrong phone, an unknown ID and a malformed ID', async () => {
    const wrongPhone = await trackOrder(null, form('PG-3FA9C21B', '9999'))
    const unknown = await trackOrder(null, form('PG-00000000', '2222'))
    const malformed = await trackOrder(null, form('hello', '2222'))
    expect(wrongPhone.ok).toBe(false)
    expect(unknown.message).toBe(wrongPhone.message)
    expect(malformed.message).toBe(wrongPhone.message)
    expect(wrongPhone.order).toBeUndefined()
  })

  it('stops a visitor after 10 tries in 10 minutes, per address', async () => {
    for (let i = 0; i < 10; i++) await trackOrder(null, form('PG-3FA9C21B', '0000'))
    const blocked = await trackOrder(null, form('PG-3FA9C21B', '2222'))
    expect(blocked.ok).toBe(false)
    expect(blocked.message).toMatch(/Too many tries/)
    ip = '2.2.2.2'
    expect((await trackOrder(null, form('PG-3FA9C21B', '2222'))).ok).toBe(true)
  })
})
