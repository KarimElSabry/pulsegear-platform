import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from '@/lib/__tests__/fakeDb'

let db: FakeDb
const sent: string[] = []

vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => db }))
vi.mock('@/lib/supabase-server', () => ({ createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-9' } } }) } }) }))
vi.mock('@/lib/telegram', () => ({ escapeTelegramHtml: (s: string) => s, sendTelegramMessage: async (t: string) => { sent.push(t); return true } }))

import { POST as quote } from '../../cart/quote/route'
import { POST as place } from '../route'
import { resetRateLimits } from '@/lib/rate-limit'

const req = (body: unknown, ip = '1.1.1.1') => new Request('http://x/api', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) })
const customer = { name: 'Ahmed Mohamed', phone: '٠١٠١٢٣٤٥٦٧٨', address: '12 Street, Nasr City, Cairo', note: 'After 5 pm please' }

beforeEach(() => {
  resetRateLimits(); sent.length = 0
  db = new FakeDb()
  db.seed('products', [{ id: 1, slug: 'p1', title: 'Garmin Forerunner', price_egp: 10000, status: 'available', stock_quantity: null, discount_enabled: true }])
})

describe('POST /api/cart/quote', () => {
  it('prices the cart from the database and ignores anything the browser says about prices', async () => {
    const res = await quote(req({ lines: [{ productId: 1, variantId: null, quantity: 1, note: '', price: 1 }] }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.totals).toMatchObject({ subtotal: 10000, total: 10000 })
  })
  it('an empty or garbage cart is an empty quote, not an error', async () => {
    expect((await (await quote(req({ lines: 'nope' }))).json()).lines).toEqual([])
  })
  it('is rate limited', async () => {
    let last = 200
    for (let i = 0; i < 62; i++) last = (await quote(req({ lines: [] }))).status
    expect(last).toBe(429)
  })
})

describe('POST /api/checkout (Confirm order)', () => {
  const body = (over: Record<string, unknown> = {}) => ({ lines: [{ productId: 1, variantId: null, quantity: 1, note: 'size M' }], customer, ...over })

  it('places the order for a guest or a logged-in customer, holds the item and returns the page token', async () => {
    const res = await place(req(body()))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data).toMatchObject({ totalEgp: 10000 })
    expect(data.code).toMatch(/^PG-/)
    expect(data.token.length).toBeGreaterThan(10)
    expect(db.rows('checkout_orders')[0]).toMatchObject({ user_id: 'user-9', phone: '01012345678', status: 'pending' })
    expect(db.rows('products')[0].status).toBe('reserved')
  })
  it('tells you on Telegram, with a WhatsApp link to the customer (Egyptian number with +20)', async () => {
    const data = await (await place(req(body()))).json()
    expect(sent).toHaveLength(1)
    expect(sent[0]).toContain(data.code)
    expect(sent[0]).toContain('Garmin Forerunner')
    expect(sent[0]).toContain('note: size M')
    expect(sent[0]).toContain('After 5 pm please')
    expect(sent[0]).toContain('https://wa.me/201012345678?text=')
    expect(sent[0]).not.toMatch(/token/i)
  })
  it('rejects bad details with the fields to fix, and an empty cart, without sending anything', async () => {
    const bad = await place(req(body({ customer: { ...customer, name: '', address: 'x' } })))
    expect(bad.status).toBe(400)
    expect(Object.keys((await bad.json()).fields)).toEqual(['name', 'address'])
    expect((await place(req(body({ lines: [] })))).status).toBe(400)
    expect(db.rows('checkout_orders')).toHaveLength(0)
    expect(sent).toHaveLength(0)
  })
  it('a second customer gets a clear conflict for an item that is held', async () => {
    expect((await place(req(body()))).status).toBe(200)
    const second = await place(req(body(), '2.2.2.2'))
    expect(second.status).toBe(409)
    expect((await second.json()).error).toMatch(/held for another customer|just taken/)
    expect(sent).toHaveLength(1)
  })
  it('limits orders per connection', async () => {
    let last = 200
    for (let i = 0; i < 7; i++) last = (await place(req(body({ lines: [] })))).status
    expect(last).toBe(429)
  })
})
