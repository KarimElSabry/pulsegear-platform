import { beforeEach, describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { placeCheckout } from '../checkout-service'
import { RECEIPT_HOLD_HOURS, customerReceiptStatus, extendHold, reviewReceipt, submitReceipt, type Upload } from '../receipt-service'
import type { CleanCustomer } from '../checkout-core'

let db: FakeDb
const client = () => db as unknown as SupabaseClient
const NOW = new Date('2026-11-03T10:00:00.000Z')
const at = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)
const customer: CleanCustomer = { name: 'Ahmed Mohamed', phone: '01012345678', email: null, address: '12 Street, Nasr City, Cairo', note: null }
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, ...new Array(40).fill(1)])
const uploaded: { path: string; mime: string }[] = []
const upload: Upload = async (path, _b, mime) => { uploaded.push({ path, mime }); return { error: null } }

async function place(productId = 1) {
  const r = await placeCheckout(client(), { lines: [{ productId, variantId: null, quantity: 1, note: '' }], customer, now: NOW })
  if (!r.ok) throw new Error(r.message)
  const { data: o } = await client().from('checkout_orders').select('*').eq('id', r.id).single()
  return o as { id: string; code: string; view_token: string; hold_expires_at: string }
}

beforeEach(() => {
  uploaded.length = 0
  db = new FakeDb()
  db.seed('products', [
    { id: 1, slug: 'p1', title: 'One-off', price_egp: 10000, status: 'available', stock_quantity: null, discount_enabled: true, reserved_until: null },
    { id: 2, slug: 'p2', title: 'Stocked', price_egp: 2000, status: 'available', stock_quantity: 5, discount_enabled: true, reserved_until: null },
  ])
})

const send = (o: { code: string; view_token: string }, over: Partial<Parameters<typeof submitReceipt>[2]> = {}) =>
  submitReceipt(client(), upload, { code: o.code, token: o.view_token, bytes: JPEG, fields: { method: 'instapay', amount: '5000', payerPhone: '01099998888' }, now: at(30), randomId: () => 'r1', ...over })

describe('submitReceipt', () => {
  it('stores the file privately, records the receipt and reports the deposit due', async () => {
    const o = await place()
    const r = await send(o)
    expect(r).toMatchObject({ ok: true, depositDue: 5000, firstReceipt: true, code: o.code })
    expect(uploaded).toEqual([{ path: `${o.code}/${at(30).getTime()}-r1.jpg`, mime: 'image/jpeg' }])
    expect(db.rows('payment_receipts')[0]).toMatchObject({ checkout_id: o.id, status: 'submitted', method: 'instapay', amount_egp: 5000, payer_phone: '01099998888' })
  })

  it('needs the order token: a wrong token or code finds nothing and uploads nothing', async () => {
    const o = await place()
    expect(await send({ code: o.code, view_token: 'wrong' })).toMatchObject({ ok: false, status: 404 })
    expect(await send({ code: 'PG-00000000', view_token: o.view_token })).toMatchObject({ ok: false, status: 404 })
    expect(uploaded).toHaveLength(0)
  })

  it('refuses files that are not images or PDFs, empty files and big files', async () => {
    const o = await place()
    expect(await send(o, { bytes: new TextEncoder().encode('<script>alert(1)</script> padding padding') })).toMatchObject({ ok: false, status: 415 })
    expect(await send(o, { bytes: new Uint8Array(0) })).toMatchObject({ ok: false, status: 400 })
    expect(await send(o, { bytes: new Uint8Array(4_000_001).fill(0xff) })).toMatchObject({ ok: false, status: 413 })
    expect(uploaded).toHaveLength(0)
  })

  it('refuses a bad amount and does not upload', async () => {
    const o = await place()
    expect(await send(o, { fields: { amount: 'abc' } })).toMatchObject({ ok: false, status: 400 })
    expect(uploaded).toHaveLength(0)
  })

  it('stops after five receipts', async () => {
    const o = await place()
    for (let i = 0; i < 5; i++) expect((await send(o, { randomId: () => `r${i}` })).ok).toBe(true)
    expect(await send(o)).toMatchObject({ ok: false, status: 429 })
  })

  it('does not accept a receipt for a cancelled order', async () => {
    const o = await place()
    db.rows('checkout_orders')[0].status = 'cancelled'
    expect(await send(o)).toMatchObject({ ok: false, status: 409 })
  })

  it('reports a storage failure and records nothing', async () => {
    const o = await place()
    const r = await submitReceipt(client(), async () => ({ error: { message: 'boom' } }), { code: o.code, token: o.view_token, bytes: JPEG, fields: {}, now: at(30) })
    expect(r).toMatchObject({ ok: false, status: 500 })
    expect(db.rows('payment_receipts')).toHaveLength(0)
  })

  it('tells the customer to contact you if the receipts table does not exist yet', async () => {
    const o = await place()
    db.failing.add('payment_receipts')
    expect(await send(o)).toMatchObject({ ok: false, status: 500 })
    expect(uploaded).toHaveLength(0)
  })
})

describe('the hold while you check the receipt', () => {
  it('the first receipt extends the order, the item and the one-off reservation to 48 hours', async () => {
    const o = await place(1)
    await send(o)
    const until = at(30 + RECEIPT_HOLD_HOURS * 60).toISOString()
    expect(new Date(db.rows('checkout_orders')[0].hold_expires_at as string).toISOString()).toBe(until)
    expect(new Date(db.rows('checkout_items')[0].hold_until as string).toISOString()).toBe(until)
    expect(new Date(db.rows('products')[0].reserved_until as string).toISOString()).toBe(until)
    expect(db.rows('products')[0].status).toBe('reserved')
  })

  it('later receipts do not extend it again', async () => {
    const o = await place(1)
    await send(o)
    const first = db.rows('checkout_orders')[0].hold_expires_at
    await send(o, { now: at(60 * 40), randomId: () => 'r2' })
    expect(db.rows('checkout_orders')[0].hold_expires_at).toBe(first)
  })

  it('extends the hold of a stock-number item without touching stock', async () => {
    const o = await place(2)
    await send(o)
    expect(db.rows('products')[1].stock_quantity).toBe(4)
    expect(new Date(db.rows('checkout_items')[0].hold_until as string).getTime()).toBe(at(30 + RECEIPT_HOLD_HOURS * 60).getTime())
  })

  it('never shortens a hold and ignores orders that are no longer pending', async () => {
    const o = await place(1)
    expect(await extendHold(client(), o.id, at(60))).toBe(false)
    db.rows('checkout_orders')[0].status = 'approved'
    expect(await extendHold(client(), o.id, at(60 * 99))).toBe(false)
  })

  it('does not move a reservation that is no longer ours', async () => {
    const o = await place(1)
    db.rows('products')[0].reserved_until = '2030-01-01T00:00:00.000Z'
    await extendHold(client(), o.id, at(60 * 48))
    expect(db.rows('products')[0].reserved_until).toBe('2030-01-01T00:00:00.000Z')
  })
})

describe('reviewReceipt', () => {
  it('verifies once: a second click is refused', async () => {
    const o = await place()
    await send(o)
    const id = String(db.rows('payment_receipts')[0].id)
    expect(await reviewReceipt(client(), id, 'verified', null, at(60))).toMatchObject({ ok: true, checkoutId: o.id })
    expect(await reviewReceipt(client(), id, 'verified', null, at(61))).toMatchObject({ ok: false })
    expect(db.rows('payment_receipts')[0].status).toBe('verified')
  })

  it('a rejected receipt can still be verified later, but a verified one cannot be rejected', async () => {
    const o = await place()
    await send(o)
    const id = String(db.rows('payment_receipts')[0].id)
    expect((await reviewReceipt(client(), id, 'rejected', 'amount is wrong')).ok).toBe(true)
    expect((await reviewReceipt(client(), id, 'verified', null)).ok).toBe(true)
    expect((await reviewReceipt(client(), id, 'rejected', 'x')).ok).toBe(false)
  })

  it('shows the customer only the status and your note, never file links or payer details', async () => {
    const o = await place()
    await send(o)
    await reviewReceipt(client(), String(db.rows('payment_receipts')[0].id), 'rejected', 'amount is wrong')
    const view = await customerReceiptStatus(client(), o.id)
    expect(view).toEqual([{ status: 'rejected', createdAt: expect.any(String), note: 'amount is wrong' }])
  })
})
