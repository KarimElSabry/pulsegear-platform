import { describe, expect, it } from 'vitest'
import { addToCart, cartCount, lineKey, parseCart, removeLine, serializeCart, setNote, setQuantity, MAX_CART_LINES } from '../cart'

const L = (productId: number, variantId: number | null = null, quantity = 1, note = '') => ({ productId, variantId, quantity, note })

describe('parseCart', () => {
  it('round-trips a cart', () => {
    const lines = [L(1, 2, 3, 'size M'), L(4)]
    expect(parseCart(serializeCart(lines))).toEqual(lines)
  })
  it('survives garbage and tampering', () => {
    expect(parseCart(null)).toEqual([])
    expect(parseCart('not json')).toEqual([])
    expect(parseCart('{"a":1}')).toEqual([])
    expect(parseCart(JSON.stringify([{ productId: -1 }, { productId: 'x' }, null, 5, { productId: 3, variantId: 'abc' }]))).toEqual([])
  })
  it('caps quantity, trims long notes, drops duplicates', () => {
    const raw = JSON.stringify([{ productId: 1, variantId: null, quantity: 99, note: 'x'.repeat(500) }, { productId: 1, variantId: null, quantity: 2 }])
    const [only, ...rest] = parseCart(raw)
    expect(rest).toHaveLength(0)
    expect(only.quantity).toBe(10)
    expect(only.note).toHaveLength(300)
  })
  it('limits the number of lines', () => {
    const raw = JSON.stringify(Array.from({ length: 40 }, (_, i) => L(i + 1)))
    expect(parseCart(raw)).toHaveLength(MAX_CART_LINES)
  })
})

describe('addToCart', () => {
  it('adds, then merges the same product and color', () => {
    const a = addToCart([], { productId: 1, variantId: 2 }, 5)
    expect(a.status).toBe('added')
    const b = addToCart(a.lines, { productId: 1, variantId: 2 }, 5)
    expect(b.status).toBe('merged')
    expect(b.lines[0].quantity).toBe(2)
  })
  it('keeps different colors as different lines', () => {
    const a = addToCart([L(1, 2)], { productId: 1, variantId: 3 }, 5)
    expect(a.lines).toHaveLength(2)
  })
  it('never goes above the available quantity', () => {
    const r = addToCart([L(1, null, 2)], { productId: 1, variantId: null, quantity: 5 }, 3)
    expect(r.status).toBe('capped')
    expect(r.lines[0].quantity).toBe(3)
  })
  it('a one-off item can only be added once', () => {
    const r = addToCart([L(7)], { productId: 7, variantId: null }, 1)
    expect(r.status).toBe('capped')
    expect(r.lines[0].quantity).toBe(1)
  })
  it('refuses a new line when the cart is full', () => {
    const full = Array.from({ length: MAX_CART_LINES }, (_, i) => L(i + 1))
    expect(addToCart(full, { productId: 999, variantId: null }, 1).status).toBe('full')
  })
})

describe('editing', () => {
  const lines = [L(1, null, 2), L(2, 5, 1)]
  it('sets quantity, removes at zero', () => {
    expect(setQuantity(lines, lineKey(lines[0]), 4)[0].quantity).toBe(4)
    expect(setQuantity(lines, lineKey(lines[0]), 4, 3)[0].quantity).toBe(3)
    expect(setQuantity(lines, lineKey(lines[0]), 0)).toHaveLength(1)
  })
  it('sets notes, removes lines, counts units', () => {
    expect(setNote(lines, lineKey(lines[1]), 'gift wrap')[1].note).toBe('gift wrap')
    expect(removeLine(lines, lineKey(lines[1]))).toHaveLength(1)
    expect(cartCount(lines)).toBe(3)
  })
})
