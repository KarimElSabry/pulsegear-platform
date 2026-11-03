import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from '@/lib/__tests__/fakeDb'

let db: FakeDb & { storage?: unknown }
const sent: string[] = []
const stored: string[] = []

vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => db }))
vi.mock('@/lib/telegram', () => ({ escapeTelegramHtml: (s: string) => s, sendTelegramMessage: async (t: string) => { sent.push(t); return true } }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

import { POST } from '../receipt/route'
import { placeCheckout } from '@/lib/checkout-service'
import { resetRateLimits } from '@/lib/rate-limit'
import type { SupabaseClient } from '@supabase/supabase-js'

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array(40).fill(1)])

function request(fields: Record<string, string | Blob>, ip = '2.2.2.2') {
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) { if (typeof v === 'string') form.set(k, v); else form.set(k, v, 'receipt.jpg') }
  return new Request('http://x/api/checkout/receipt', { method: 'POST', headers: { 'x-forwarded-for': ip }, body: form })
}

let order: { code: string; view_token: string }

beforeEach(async () => {
  resetRateLimits(); sent.length = 0; stored.length = 0
  db = new FakeDb()
  db.storage = { from: () => ({ upload: async (p: string) => { stored.push(p); return { error: null } } }) }
  db.seed('products', [{ id: 1, slug: 'p1', title: 'Garmin', price_egp: 10000, status: 'available', stock_quantity: null, discount_enabled: true, reserved_until: null }])
  const r = await placeCheckout(db as unknown as SupabaseClient, { lines: [{ productId: 1, variantId: null, quantity: 1, note: '' }], customer: { name: 'Ahmed Mohamed', phone: '01012345678', email: null, address: '12 Street, Nasr City, Cairo', note: null } })
  if (!r.ok) throw new Error('setup')
  order = { code: r.code, view_token: r.token }
})

describe('POST /api/checkout/receipt', () => {
  it('accepts a receipt for the right order, stores it and tells you on Telegram', async () => {
    const res = await POST(request({ code: order.code, token: order.view_token, amount: '5000', file: new Blob([JPEG]) }))
    expect(res.status).toBe(200)
    expect(stored).toHaveLength(1)
    expect(sent[0]).toContain(order.code)
    expect(db.rows('payment_receipts')).toHaveLength(1)
  })
  it('refuses a wrong token without storing anything', async () => {
    const res = await POST(request({ code: order.code, token: 'nope', file: new Blob([JPEG]) }))
    expect(res.status).toBe(404)
    expect(stored).toHaveLength(0)
    expect(sent).toHaveLength(0)
  })
  it('refuses a file that is not an image or PDF even if it is called receipt.jpg', async () => {
    const res = await POST(request({ code: order.code, token: order.view_token, file: new Blob(['<html>not an image at all</html>']) }))
    expect(res.status).toBe(415)
    expect(stored).toHaveLength(0)
  })
  it('refuses a request without a file', async () => {
    expect((await POST(request({ code: order.code, token: order.view_token }))).status).toBe(400)
  })
  it('refuses an oversized declared body early', async () => {
    const req = new Request('http://x/api/checkout/receipt', { method: 'POST', headers: { 'content-length': '9000000', 'x-forwarded-for': '3.3.3.3' }, body: new FormData() })
    expect((await POST(req)).status).toBe(413)
  })
  it('is rate limited per connection', async () => {
    let last = 200
    for (let i = 0; i < 12; i++) last = (await POST(request({ code: order.code, token: 'nope', file: new Blob([JPEG]) }, '4.4.4.4'))).status
    expect(last).toBe(429)
  })
})
