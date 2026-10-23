// src/lib/checkout-core.ts
// Pure rules for the cart checkout: money, validation, status names. No database code here.

import { normalizeDigits } from '@/lib/digits'

/** After the customer confirms, the items are held for them this long while you contact them on WhatsApp. */
export const HOLD_HOURS = 24

export type CheckoutStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled'

export const CHECKOUT_STATUS_LABEL: Record<CheckoutStatus, string> = {
  pending: 'Order received, we will contact you on WhatsApp',
  approved: 'Order confirmed',
  rejected: 'Order not confirmed',
  expired: 'Time ran out',
  cancelled: 'Cancelled',
}

export type PricedLine = {
  unitPriceEgp: number
  quantity: number
  /** discount codes only apply to products that allow them */
  discountEnabled: boolean
}

export type LineTotals = { lineTotal: number; discount: number; net: number }
export type Totals = { subtotal: number; discount: number; total: number; lines: LineTotals[] }

export function clampPercent(value: unknown, fallback = 0): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n * 100) / 100))
}

/** Money for an order, in whole EGP. The discount applies only to the lines that allow discount codes. */
export function computeTotals(lines: PricedLine[], discountPercent: number): Totals {
  const dPct = clampPercent(discountPercent, 0)
  const out = lines.map((l) => {
    const lineTotal = Math.round(l.unitPriceEgp * l.quantity)
    const discount = l.discountEnabled && dPct > 0 ? Math.round(lineTotal * (dPct / 100)) : 0
    return { lineTotal, discount, net: lineTotal - discount }
  })
  const subtotal = out.reduce((s, l) => s + l.lineTotal, 0)
  const discount = out.reduce((s, l) => s + l.discount, 0)
  return { subtotal, discount, total: subtotal - discount, lines: out }
}

export type CustomerInput = { name?: unknown; phone?: unknown; email?: unknown; address?: unknown; note?: unknown }
export type CleanCustomer = { name: string; phone: string; email: string | null; address: string; note: string | null }

export function cleanPhone(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const digits = normalizeDigits(value).replace(/[^\d+]/g, '')
  const count = digits.replace(/\D/g, '').length
  return count >= 10 && count <= 15 ? digits : null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateCustomer(input: CustomerInput): { ok: true; value: CleanCustomer } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (name.length < 2 || name.length > 80) errors.name = 'Please enter your full name'
  const phone = cleanPhone(input.phone)
  if (!phone) errors.phone = 'Please enter a valid phone number (10 digits or more)'
  const emailRaw = typeof input.email === 'string' ? input.email.trim() : ''
  if (emailRaw && (!EMAIL.test(emailRaw) || emailRaw.length > 120)) errors.email = 'This email does not look right'
  const address = typeof input.address === 'string' ? normalizeDigits(input.address).trim() : ''
  if (address.length < 8 || address.length > 400) errors.address = 'Please enter the full delivery address (street, area, city)'
  const noteRaw = typeof input.note === 'string' ? input.note.trim() : ''
  if (noteRaw.length > 600) errors.note = 'Please keep the note under 600 characters'
  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    value: { name, phone: phone!, email: emailRaw || null, address, note: noteRaw || null },
  }
}

export function holdUntil(now: Date, hours = HOLD_HOURS): Date {
  return new Date(now.getTime() + hours * 3_600_000)
}

export const egp = (n: number) => `${Math.round(n).toLocaleString('en-US')} EGP`
