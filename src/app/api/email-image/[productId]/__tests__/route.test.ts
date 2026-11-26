import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeDb } from '@/lib/__tests__/fakeDb'

let db: FakeDb
vi.mock('@/lib/supabase', () => ({ createAdminSupabaseClient: () => db, createBrowserSupabaseClient: vi.fn() }))

import { GET } from '../route'

const get = (id: string) => (GET as unknown as (r: Request, c: { params: Promise<{ productId: string }> }) => Promise<Response>)(new Request(`http://x/api/email-image/${id}`), { params: Promise.resolve({ productId: id }) })

beforeEach(() => {
  db = new FakeDb()
  db.seed('product_images', [
    { product_id: 5, image_url: 'https://cdn.example.com/second.jpg', is_primary: false, display_order: 1 },
    { product_id: 5, image_url: 'https://de.healf.com/cdn-cgi/image/width=1536,onerror=redirect/img/a.jpg', is_primary: true, display_order: 3 },
    { product_id: 6, image_url: 'javascript:alert(1)', is_primary: true, display_order: 0 },
    { product_id: 7, image_url: 'https://cdn.example.com/first.jpg', is_primary: false, display_order: 2 },
    { product_id: 7, image_url: 'https://cdn.example.com/zero.jpg', is_primary: false, display_order: 0 },
  ])
})

describe('GET /api/email-image/[productId]', () => {
  it('sends the browser to the main photo of that product', async () => {
    const res = await get('5')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://de.healf.com/cdn-cgi/image/width=1536,onerror=redirect/img/a.jpg')
  })
  it('without a main photo, the first one in order', async () => {
    expect((await get('7')).headers.get('location')).toBe('https://cdn.example.com/zero.jpg')
  })
  it('only web addresses: a javascript: link is never followed', async () => {
    expect((await get('6')).status).toBe(404)
  })
  it('unknown product, a product without photos, or a made-up id: 404, never a redirect', async () => {
    expect((await get('99')).status).toBe(404)
    expect((await get('abc')).status).toBe(404)
    expect((await get('-1')).status).toBe(404)
    expect((await get('1.5')).status).toBe(404)
  })
})
