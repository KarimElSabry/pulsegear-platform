// src/lib/cart.ts
// The shopping cart lives in the visitor's browser (works for guests and accounts alike).
// It stores only WHAT and HOW MANY. Prices, names and availability always come from the server, never from here.

export type CartLine = { productId: number; variantId: number | null; quantity: number; note: string }

export const CART_KEY = 'pg_cart_v1'
export const CART_EVENT = 'pulsegear:cart-changed'
export const MAX_CART_LINES = 20
export const MAX_LINE_QUANTITY = 10
export const NOTE_MAX = 300

export const lineKey = (l: Pick<CartLine, 'productId' | 'variantId'>) => `${l.productId}:${l.variantId ?? 0}`

const posInt = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 ? n : null
}

/** Reads whatever is in storage and keeps only well-formed lines (storage can be edited by the visitor). */
export function parseCart(raw: string | null | undefined): CartLine[] {
  if (!raw) return []
  let data: unknown
  try { data = JSON.parse(raw) } catch { return [] }
  if (!Array.isArray(data)) return []
  const seen = new Set<string>()
  const out: CartLine[] = []
  for (const item of data) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const productId = posInt(r.productId)
    if (!productId) continue
    const variantId = r.variantId === null || r.variantId === undefined ? null : posInt(r.variantId)
    if (r.variantId !== null && r.variantId !== undefined && variantId === null) continue
    const quantity = Math.min(posInt(r.quantity) ?? 1, MAX_LINE_QUANTITY)
    const note = typeof r.note === 'string' ? r.note.slice(0, NOTE_MAX) : ''
    const line = { productId, variantId, quantity, note }
    if (seen.has(lineKey(line))) continue
    seen.add(lineKey(line))
    out.push(line)
    if (out.length >= MAX_CART_LINES) break
  }
  return out
}

export const serializeCart = (lines: CartLine[]) => JSON.stringify(lines)

export type AddResult = { lines: CartLine[]; status: 'added' | 'merged' | 'capped' | 'full' }

/** Adds a product (and color). The same product+color again increases the quantity, up to maxQuantity. */
export function addToCart(lines: CartLine[], add: { productId: number; variantId: number | null; quantity?: number; note?: string }, maxQuantity: number): AddResult {
  const cap = Math.max(1, Math.min(maxQuantity, MAX_LINE_QUANTITY))
  const qty = Math.max(1, Math.floor(add.quantity ?? 1))
  const key = lineKey(add)
  const existing = lines.find((l) => lineKey(l) === key)
  if (existing) {
    const next = Math.min(existing.quantity + qty, cap)
    const capped = existing.quantity + qty > cap
    return {
      lines: lines.map((l) => (l === existing ? { ...l, quantity: next, note: add.note ? add.note.slice(0, NOTE_MAX) : l.note } : l)),
      status: capped ? 'capped' : 'merged',
    }
  }
  if (lines.length >= MAX_CART_LINES) return { lines, status: 'full' }
  return {
    lines: [...lines, { productId: add.productId, variantId: add.variantId, quantity: Math.min(qty, cap), note: (add.note ?? '').slice(0, NOTE_MAX) }],
    status: qty > cap ? 'capped' : 'added',
  }
}

export function setQuantity(lines: CartLine[], key: string, quantity: number, maxQuantity = MAX_LINE_QUANTITY): CartLine[] {
  const q = Math.floor(Number(quantity))
  if (!Number.isFinite(q) || q < 1) return lines.filter((l) => lineKey(l) !== key)
  return lines.map((l) => (lineKey(l) === key ? { ...l, quantity: Math.min(q, maxQuantity, MAX_LINE_QUANTITY) } : l))
}

export const setNote = (lines: CartLine[], key: string, note: string): CartLine[] =>
  lines.map((l) => (lineKey(l) === key ? { ...l, note: note.slice(0, NOTE_MAX) } : l))

export const removeLine = (lines: CartLine[], key: string): CartLine[] => lines.filter((l) => lineKey(l) !== key)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0)

/** A discount code the visitor applied on a product page, remembered so the cart can use it. */
export const DISCOUNT_KEY = 'pg_cart_discount'
