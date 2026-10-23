// src/lib/checkout-http.ts
// Small helpers shared by the public cart and checkout API routes.

import { parseCart, MAX_CART_LINES, type CartLine } from '@/lib/cart'

export const clientIp = (req: Request): string =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

/** The browser sends its cart; keep only well-formed lines (same rules as when reading it from storage). */
export function linesFromBody(value: unknown): CartLine[] {
  if (!Array.isArray(value) || value.length > MAX_CART_LINES * 2) return []
  return parseCart(JSON.stringify(value))
}
