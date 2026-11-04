// src/lib/stock.ts
// Pure rules for "can this be bought, and how many?". Used by the product page, the cart and the checkout.
//
//  One-off item   stock_quantity is empty. Bought once, and product.status says if it is still available.
//  Normal stock   stock_quantity is a number (0 = out of stock). A color (variant) can have its own number;
//                 a color with an empty number follows the product's number.
//  On demand      on_demand is ticked and there is no stock number: bought for the customer after they order. It is always
//                 available (unless switched off with the status) and an order never holds, sells or hides it.

export type ProductStatusLite = 'available' | 'sold' | 'reserved' | 'out_of_stock'

export type StockProduct = {
  status?: ProductStatusLite | string | null
  stock_quantity?: number | null
  on_demand?: boolean | null
}

export type VariantLite = {
  id: number
  name: string
  color_hex: string | null
  stock_quantity: number | null
  is_active: boolean
  display_order: number
  /** Optional size label (XS-S, M-XL ...). */
  size_name?: string | null
  /** Optional price of this option; empty = the product's price. */
  price_egp?: number | null
}

/** "Black", "M-XL" or "Black · M-XL": what the customer and you read for one option. */
export function variantLabel(v: Pick<VariantLite, 'name' | 'size_name'> | null | undefined): string | null {
  if (!v) return null
  const label = [v.name, v.size_name].map((x) => (x ?? '').trim()).filter(Boolean).join(' · ')
  return label || null
}

/** The price of an option: its own price, otherwise the product's. */
export function variantPrice(v: Pick<VariantLite, 'price_egp'> | null | undefined, productPrice: number): number {
  const own = v?.price_egp == null ? null : Number(v.price_egp)
  return own !== null && Number.isFinite(own) && own > 0 ? own : productPrice
}

export type Availability = {
  /** Can it be added to the cart right now? */
  canBuy: boolean
  /** The most units one customer can add (1 for one-off items). */
  maxQuantity: number
  /** One-off item (no stock number): needs a hold while the customer pays. */
  oneOff: boolean
  /** Bought on demand: always available, nothing is held or sold out by an order. */
  onDemand: boolean
  /** Units left when stock is managed with a number, otherwise null. */
  unitsLeft: number | null
  reason: 'ok' | 'sold' | 'reserved' | 'out_of_stock'
}

export const MAX_CART_QUANTITY = 10

const STATUS_BLOCK = new Set(['sold', 'out_of_stock'])

function whole(n: unknown): number | null {
  if (n === null || n === undefined || n === '') return null
  const v = Number(n)
  return Number.isFinite(v) ? Math.max(0, Math.floor(v)) : null
}

export function activeVariants(variants: VariantLite[] | null | undefined): VariantLite[] {
  return (variants ?? []).filter((v) => v.is_active).sort((a, b) => a.display_order - b.display_order || a.id - b.id)
}

/** Availability of a product, optionally for one chosen color. */
export function availability(product: StockProduct, variant?: VariantLite | null): Availability {
  const status = String(product.status ?? 'available')
  const productUnits = whole(product.stock_quantity)
  const units = variant ? whole(variant.stock_quantity) ?? productUnits : productUnits

  if (units === null && product.on_demand === true) {
    // On demand: only the status can switch it off (sold or out of stock). An old "reserved" status does not block it.
    if (status === 'sold' || status === 'out_of_stock') return { canBuy: false, maxQuantity: 0, oneOff: false, onDemand: true, unitsLeft: null, reason: status }
    return { canBuy: true, maxQuantity: MAX_CART_QUANTITY, oneOff: false, onDemand: true, unitsLeft: null, reason: 'ok' }
  }

  if (units === null) {
    // One-off item
    if (status === 'sold') return { canBuy: false, maxQuantity: 0, oneOff: true, onDemand: false, unitsLeft: null, reason: 'sold' }
    if (status === 'reserved') return { canBuy: false, maxQuantity: 0, oneOff: true, onDemand: false, unitsLeft: null, reason: 'reserved' }
    if (status === 'out_of_stock') return { canBuy: false, maxQuantity: 0, oneOff: true, onDemand: false, unitsLeft: null, reason: 'out_of_stock' }
    return { canBuy: true, maxQuantity: 1, oneOff: true, onDemand: false, unitsLeft: null, reason: 'ok' }
  }

  // Normal stock: the number rules, a sold/out_of_stock status switches the product off.
  if (STATUS_BLOCK.has(status) || units <= 0) {
    return { canBuy: false, maxQuantity: 0, oneOff: false, onDemand: false, unitsLeft: 0, reason: status === 'sold' ? 'sold' : 'out_of_stock' }
  }
  return { canBuy: true, maxQuantity: Math.min(units, MAX_CART_QUANTITY), oneOff: false, onDemand: false, unitsLeft: units, reason: 'ok' }
}

/** For a product with colors: is any color buyable? */
export function anyVariantBuyable(product: StockProduct, variants: VariantLite[]): boolean {
  const list = activeVariants(variants)
  if (list.length === 0) return availability(product).canBuy
  return list.some((v) => availability(product, v).canBuy)
}

export function stockLabel(a: Availability): string {
  if (!a.canBuy) return a.reason === 'sold' ? 'Sold' : a.reason === 'reserved' ? 'Reserved' : 'Out of stock'
  if (a.unitsLeft !== null && a.unitsLeft <= 3) return `Only ${a.unitsLeft} left`
  return 'In stock'
}

export function clampQuantity(wanted: number, a: Availability): number {
  if (!a.canBuy) return 0
  const n = Math.floor(Number(wanted))
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, a.maxQuantity)
}

const HEX = /^#[0-9A-Fa-f]{6}$/

export function cleanHex(value: unknown): string | null {
  return typeof value === 'string' && HEX.test(value.trim()) ? value.trim().toLowerCase() : null
}

export type VariantInput = { id?: number; name?: unknown; size_name?: unknown; price_egp?: unknown; color_hex?: unknown; stock_quantity?: unknown; is_active?: unknown }

/** Validates what the admin sent for one color. Returns an error text or the clean row. */
export function cleanVariant(input: VariantInput, order: number):
  { error: string } | { value: { id?: number; name: string; size_name: string | null; price_egp: number | null; color_hex: string | null; stock_quantity: number | null; is_active: boolean; display_order: number } } {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const size = typeof input.size_name === 'string' ? input.size_name.trim() : ''
  if (!name && !size) return { error: 'Every option needs a color name, a size, or both' }
  if (name.length > 40) return { error: `Color name "${name.slice(0, 12)}…" is too long (max 40)` }
  if (size.length > 40) return { error: `Size "${size.slice(0, 12)}…" is too long (max 40)` }
  const shown = variantLabel({ name, size_name: size }) as string
  const priceRaw = input.price_egp
  let price: number | null = null
  if (priceRaw !== null && priceRaw !== undefined && priceRaw !== '') {
    const n = Number(priceRaw)
    if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) return { error: `Price for "${shown}" must be a number above 0 (or empty to use the product price)` }
    price = Math.round(n * 100) / 100
  }
  const raw = input.stock_quantity
  let stock: number | null = null
  if (raw !== null && raw !== undefined && raw !== '') {
    const n = Number(raw)
    if (!Number.isInteger(n) || n < 0) return { error: `Stock for "${shown}" must be a whole number, 0 or more` }
    stock = n
  }
  const hexRaw = input.color_hex
  const hex = cleanHex(hexRaw)
  if (hexRaw && !hex) return { error: `Color code for "${shown}" must look like #1a2b3c` }
  return {
    value: {
      id: typeof input.id === 'number' ? input.id : undefined,
      name, size_name: size || null, price_egp: price, color_hex: hex, stock_quantity: stock,
      is_active: input.is_active === false ? false : true,
      display_order: order,
    },
  }
}
