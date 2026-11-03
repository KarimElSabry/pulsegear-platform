import { beforeEach, describe, expect, it, vi } from 'vitest'

const updates: { patch: Record<string, unknown>; id: number; productId: number }[] = []
let failOn: number | null = null

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/supabase', () => ({
  createAdminSupabaseClient: () => ({
    from: () => ({
      update: (patch: Record<string, unknown>) => ({
        eq: (_c: string, id: number) => ({
          eq: (_c2: string, productId: number) => {
            updates.push({ patch, id, productId })
            return Promise.resolve({ error: failOn === id ? { message: 'column "variant_id" does not exist' } : null })
          },
        }),
      }),
    }),
  }),
}))

import { PATCH } from '../route'

const call = (images: unknown[]) =>
  PATCH(new Request('http://x', { method: 'PATCH', body: JSON.stringify({ images }) }) as never, { params: Promise.resolve({ id: '7' }) })

beforeEach(() => { updates.length = 0; failOn = null })

describe('PATCH /api/products/[id]/images', () => {
  it('saves the color of each photo (and null for "All colors")', async () => {
    const res = await call([
      { id: 1, display_order: 0, is_primary: true, variant_id: 31 },
      { id: 2, display_order: 1, is_primary: false, variant_id: null },
    ])
    expect(res.status).toBe(200)
    expect(updates.map((u) => u.patch)).toEqual([
      { display_order: 0, is_primary: true, variant_id: 31 },
      { display_order: 1, is_primary: false, variant_id: null },
    ])
    expect(updates.every((u) => u.productId === 7)).toBe(true)
  })
  it('leaves the color alone when the browser does not send one (a product without colors)', async () => {
    await call([{ id: 1, display_order: 0, is_primary: true }])
    expect(updates[0].patch).toEqual({ display_order: 0, is_primary: true })
  })
  it('reports a database error instead of saying it saved', async () => {
    failOn = 2
    const res = await call([{ id: 1, display_order: 0, is_primary: true, variant_id: 31 }, { id: 2, display_order: 1, is_primary: false, variant_id: 31 }])
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/variant_id/)
  })
})
