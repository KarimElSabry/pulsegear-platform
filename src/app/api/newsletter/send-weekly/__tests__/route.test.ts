import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from '@/lib/__tests__/fakeDb'

let db: FakeDb
const sendWeekly = vi.fn(async () => {})
vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => db, createBrowserSupabaseClient: vi.fn() }))
vi.mock('@/lib/brevo', () => ({ sendWeeklyNewsletter: (...a: unknown[]) => sendWeekly(...(a as [])) }))
vi.mock('@/lib/admin-auth', () => ({ isCronAuthorized: () => true }))
vi.mock('@/lib/jobs', () => ({ withJobLog: (_n: string, fn: (req: Request) => Promise<Response>) => fn }))

import { GET } from '../route'

const run = async () => {
  const res = await (GET as unknown as (r: Request) => Promise<Response>)(new Request('http://x/api/newsletter/send-weekly'))
  return res.json()
}

beforeEach(() => {
  sendWeekly.mockClear()
  db = new FakeDb()
  db.seed('products', [{ id: 1, slug: 'p1', title: 'Watch', price_egp: 1000, status: 'available', created_at: '2020-01-01T00:00:00Z' }])
  db.seed('product_images', [])
})

describe('weekly newsletter', () => {
  it('skips when nothing is new, sold or on sale', async () => {
    expect(await run()).toMatchObject({ success: true, skipped: expect.any(String) })
    expect(sendWeekly).not.toHaveBeenCalled()
  })
  it('is sent when only a campaign is live, with the sale products in it', async () => {
    db.seed('promotions', [{ id: 1, name: 'Early White Friday', starts_at: null, ends_at: null, is_active: true, allow_codes: true }])
    db.seed('promotion_products', [{ promotion_id: 1, product_id: 1, percent_off: 20 }])
    expect(await run()).toMatchObject({ success: true, onSale: 1 })
    expect(sendWeekly).toHaveBeenCalledTimes(1)
    const sales = (sendWeekly.mock.calls[0] as unknown as [unknown[], unknown[], { price: number; percent: number }[]])[2]
    expect(sales).toMatchObject([{ price: 800, percent: 20 }])
  })
})
