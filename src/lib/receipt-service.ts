// src/lib/receipt-service.ts
// Deposit receipts: the customer uploads a transfer screenshot or PDF for their order, you verify or reject it.
// Files live in a private bucket; only this server code (service role) can read them.

import type { SupabaseClient } from '@supabase/supabase-js'
import { holdUntil } from './checkout-core'
import { findByCodeAndToken } from './checkout-service'
import { MAX_RECEIPTS_PER_ORDER, MAX_RECEIPT_BYTES, cleanReceiptInput, sniffReceipt, type ReceiptInput } from './receipts'
import { depositFor } from './payment-details'

type Db = SupabaseClient
type Row = Record<string, unknown>

export const RECEIPT_BUCKET = 'payment-receipts'
/** While you check a receipt the items stay held this long (instead of 24 hours). */
export const RECEIPT_HOLD_HOURS = 48

export type Upload = (path: string, bytes: Uint8Array, mime: string) => Promise<{ error: { message: string } | null }>

export type SubmitResult =
  | { ok: true; receiptId: string; depositDue: number; firstReceipt: boolean; code: string; payerPhone: string | null; amountEgp: number | null }
  | { ok: false; status: number; message: string }

const fail = (status: number, message: string): SubmitResult => ({ ok: false, status, message })

/** Moves the hold of a pending order (order, items, and one-off product reservations) to a later time. Never shortens it. */
export async function extendHold(db: Db, checkoutId: string, until: Date): Promise<boolean> {
  const { data: o } = await db.from('checkout_orders').select('status, hold_expires_at').eq('id', checkoutId).maybeSingle()
  if (!o || o.status !== 'pending') return false
  if (o.hold_expires_at && new Date(o.hold_expires_at as string).getTime() >= until.getTime()) return false

  const { data: items } = await db.from('checkout_items').select('id, product_id, hold_kind, held, hold_until').eq('checkout_id', checkoutId)
  for (const it of (items ?? []) as Row[]) {
    if (!it.held || it.hold_kind === 'ondemand') continue
    if (it.hold_kind === 'oneoff' && it.hold_until) {
      // only move the product's reservation if it is still ours (same compare as when releasing)
      const { data: hit } = await db.from('products').update({ reserved_until: until.toISOString() })
        .eq('id', it.product_id as number).eq('status', 'reserved').eq('reserved_until', it.hold_until as string).select('id')
      if (!hit || hit.length !== 1) continue
    }
    await db.from('checkout_items').update({ hold_until: until.toISOString() }).eq('id', it.id as number)
  }
  await db.from('checkout_orders').update({ hold_expires_at: until.toISOString() }).eq('id', checkoutId).eq('status', 'pending')
  return true
}

export async function submitReceipt(
  db: Db,
  upload: Upload,
  input: { code: string; token: string; bytes: Uint8Array; fields: ReceiptInput; now?: Date; randomId?: () => string },
): Promise<SubmitResult> {
  const now = input.now ?? new Date()
  const order = await findByCodeAndToken(db, input.code, input.token)
  if (!order) return fail(404, 'We could not find this order. Open the link we gave you after you placed it.')
  if (order.status !== 'pending' && order.status !== 'approved') return fail(409, 'This order is closed, so we cannot take a receipt for it. Please contact us.')

  if (input.bytes.length === 0) return fail(400, 'Choose your receipt (a screenshot, photo or PDF).')
  if (input.bytes.length > MAX_RECEIPT_BYTES) return fail(413, 'The file is too large (4 MB at most). Send a screenshot instead of the original photo.')
  const kind = sniffReceipt(input.bytes)
  if (!kind) return fail(415, 'Please send a JPG, PNG or WebP image, or a PDF.')

  const clean = cleanReceiptInput(input.fields)
  if (!clean.ok) return fail(400, clean.message)

  const { data: existing, error: countError } = await db.from('payment_receipts').select('id').eq('checkout_id', order.id)
  if (countError) return fail(500, 'Receipts are not available yet. Please contact us on WhatsApp.')
  const count = (existing ?? []).length
  if (count >= MAX_RECEIPTS_PER_ORDER) return fail(429, 'You already sent several receipts for this order. Please contact us on WhatsApp.')

  const id = (input.randomId ?? (() => crypto.randomUUID()))()
  const path = `${order.code}/${now.getTime()}-${id}.${kind.ext}`
  const { error: upError } = await upload(path, input.bytes, kind.mime)
  if (upError) return fail(500, 'We could not save your receipt. Please try again.')

  const { data: row, error } = await db.from('payment_receipts').insert({
    checkout_id: order.id, path, mime: kind.mime, size_bytes: input.bytes.length, method: clean.value.method,
    amount_egp: clean.value.amountEgp, payer_name: clean.value.payerName, payer_phone: clean.value.payerPhone,
  }).select('id').single()
  if (error || !row) return fail(500, 'We could not save your receipt. Please try again.')

  // the first receipt gives you time to check it: the items stay held for 48 hours instead of 24
  if (count === 0) await extendHold(db, order.id, holdUntil(now, RECEIPT_HOLD_HOURS))

  return {
    ok: true, receiptId: String(row.id), depositDue: depositFor(order.total_egp), firstReceipt: count === 0, code: order.code,
    payerPhone: clean.value.payerPhone, amountEgp: clean.value.amountEgp,
  }
}

export interface ReceiptView {
  id: string
  checkoutId: string
  status: 'submitted' | 'verified' | 'rejected'
  method: 'instapay' | 'bank'
  amountEgp: number | null
  payerName: string | null
  payerPhone: string | null
  mime: string
  reviewNote: string | null
  createdAt: string
  /** Short-lived link to the private file (admin only). */
  url: string | null
}

const toView = (r: Row, url: string | null): ReceiptView => ({
  id: String(r.id), checkoutId: String(r.checkout_id),
  status: (['verified', 'rejected'].includes(String(r.status)) ? r.status : 'submitted') as ReceiptView['status'],
  method: r.method === 'bank' ? 'bank' : 'instapay',
  amountEgp: r.amount_egp === null || r.amount_egp === undefined ? null : Number(r.amount_egp),
  payerName: (r.payer_name as string) ?? null, payerPhone: (r.payer_phone as string) ?? null,
  mime: String(r.mime ?? ''), reviewNote: (r.review_note as string) ?? null, createdAt: String(r.created_at), url,
})

/** Receipts of many orders for the admin, with one-hour links to the files. Returns [] if the table is not there yet. */
export async function loadReceipts(db: Db, checkoutIds: string[]): Promise<ReceiptView[]> {
  if (checkoutIds.length === 0) return []
  const { data, error } = await db.from('payment_receipts').select('*').in('checkout_id', checkoutIds).order('created_at', { ascending: true })
  if (error) return []
  const out: ReceiptView[] = []
  for (const r of (data ?? []) as Row[]) {
    let url: string | null = null
    try {
      const signed = await db.storage.from(RECEIPT_BUCKET).createSignedUrl(String(r.path), 3600)
      url = signed.data?.signedUrl ?? null
    } catch { /* the file link is optional */ }
    out.push(toView(r, url))
  }
  return out
}

/** What the customer may see about their own receipts (no file links, no payer details). */
export async function customerReceiptStatus(db: Db, checkoutId: string): Promise<{ status: ReceiptView['status']; createdAt: string; note: string | null }[]> {
  const { data, error } = await db.from('payment_receipts').select('status, created_at, review_note').eq('checkout_id', checkoutId).order('created_at', { ascending: true })
  if (error) return []
  return ((data ?? []) as Row[]).map((r) => ({
    status: (['verified', 'rejected'].includes(String(r.status)) ? r.status : 'submitted') as ReceiptView['status'],
    createdAt: String(r.created_at), note: (r.review_note as string) ?? null,
  }))
}

/** Verify or reject. Claim first (the status must still be what you saw), so a double click acts once. */
export async function reviewReceipt(db: Db, id: string, status: 'verified' | 'rejected', note: string | null, now = new Date()): Promise<{ ok: true; checkoutId: string } | { ok: false; message: string }> {
  const { data: found } = await db.from('payment_receipts').select('id, checkout_id, status').eq('id', id).maybeSingle()
  if (!found) return { ok: false, message: 'Receipt not found.' }
  const from = status === 'verified' ? ['submitted', 'rejected'] : ['submitted']
  const { data: hit } = await db.from('payment_receipts')
    .update({ status, review_note: note ? note.slice(0, 300) : null, reviewed_at: now.toISOString() }).eq('id', id).in('status', from).select('id')
  if (!hit || hit.length !== 1) return { ok: false, message: 'This receipt was already handled.' }
  return { ok: true, checkoutId: String(found.checkout_id) }
}
