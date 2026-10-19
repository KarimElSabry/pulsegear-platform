import { beforeEach, describe, expect, it, vi } from 'vitest'

const updates: Record<string, unknown>[] = []
const stored = { egypt_shipping_egp: 120, discount_code: null as string | null }

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: stored }), maybeSingle: async () => ({ data: stored }) }) }),
      update: (row: Record<string, unknown>) => { updates.push(row); return { eq: async () => ({ error: null }) } },
    }),
    rpc: async () => ({ error: null }),
  }),
}))
vi.mock('@/lib/admin-auth', () => ({ assertAdmin: async () => {} }))
vi.mock('@/lib/tracking/server', () => ({ recordServerEvent: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { updateSale } from '../actions'

const form = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f }
const base = { product_name: 'Fenix', original_eur: '100', shipping_eur: '10', exchange_rate: '50', selling_price_egp: '8000', commission_egp: '0', sale_channel: 'whatsapp', sale_date: '2026-10-05' }

beforeEach(() => { updates.length = 0 })

describe('updateSale and shipping in Egypt', () => {
  it('uses the Egypt shipping from the form: cost and profit follow it', async () => {
    await updateSale('s1', form({ ...base, egypt_shipping_egp: '200' }))
    // (100 + 10) * 50 + 200 = 5700 cost; 8000 - 5700 = 2300 profit
    expect(updates[0]).toMatchObject({ egypt_shipping_egp: 200, cost_egp: 5700, profit_egp: 2300 })
  })

  it('a form that does not send it keeps the stored value instead of resetting it to 0', async () => {
    await updateSale('s1', form(base))
    expect(updates[0]).toMatchObject({ egypt_shipping_egp: 120, cost_egp: 5620, profit_egp: 2380 })
  })

  it('can be set to 0 on purpose', async () => {
    await updateSale('s1', form({ ...base, egypt_shipping_egp: '0' }))
    expect(updates[0]).toMatchObject({ egypt_shipping_egp: 0, cost_egp: 5500, profit_egp: 2500 })
  })
})
