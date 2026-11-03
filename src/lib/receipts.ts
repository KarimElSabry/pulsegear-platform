// src/lib/receipts.ts
// Pure rules for the deposit receipt a customer uploads: allowed files, size, and what the optional fields may contain.
// The file type is decided from the first bytes of the file, never from the name or the type the browser claims.

import { cleanPhone } from '@/lib/checkout-core'

export const MAX_RECEIPT_BYTES = 4_000_000
export const MAX_RECEIPTS_PER_ORDER = 5

export type ReceiptKind = { mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'; ext: 'jpg' | 'png' | 'webp' | 'pdf' }

export function sniffReceipt(b: Uint8Array): ReceiptKind | null {
  const at = (i: number, ...v: number[]) => v.every((x, k) => b[i + k] === x)
  if (b.length < 12) return null
  if (at(0, 0xff, 0xd8, 0xff)) return { mime: 'image/jpeg', ext: 'jpg' }
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { mime: 'image/png', ext: 'png' }
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return { mime: 'image/webp', ext: 'webp' }
  if (at(0, 0x25, 0x50, 0x44, 0x46, 0x2d)) return { mime: 'application/pdf', ext: 'pdf' }
  return null
}

export type ReceiptInput = { method?: unknown; amount?: unknown; payerName?: unknown; payerPhone?: unknown }
export type CleanReceiptInput = { method: 'instapay' | 'bank'; amountEgp: number | null; payerName: string | null; payerPhone: string | null }

export function cleanReceiptInput(i: ReceiptInput): { ok: true; value: CleanReceiptInput } | { ok: false; message: string } {
  const method = i.method === 'bank' ? 'bank' : 'instapay'
  let amountEgp: number | null = null
  if (typeof i.amount === 'string' && i.amount.trim() !== '') {
    const n = Number(i.amount.replace(/,/g, ''))
    if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) return { ok: false, message: 'The amount you sent does not look right.' }
    amountEgp = Math.round(n * 100) / 100
  }
  const name = typeof i.payerName === 'string' ? i.payerName.trim().slice(0, 80) : ''
  let payerPhone: string | null = null
  if (typeof i.payerPhone === 'string' && i.payerPhone.trim() !== '') {
    payerPhone = cleanPhone(i.payerPhone)
    if (!payerPhone) return { ok: false, message: 'The phone number you paid from does not look right.' }
  }
  return { ok: true, value: { method, amountEgp, payerName: name || null, payerPhone } }
}
