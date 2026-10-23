import { describe, expect, it } from 'vitest'
import { activeVariants, anyVariantBuyable, availability, clampQuantity, cleanHex, cleanVariant, stockLabel, type VariantLite } from '../stock'

const v = (id: number, stock: number | null, active = true, order = id): VariantLite => ({ id, name: `c${id}`, color_hex: null, stock_quantity: stock, is_active: active, display_order: order })

describe('availability', () => {
  it('one-off item follows status', () => {
    expect(availability({ status: 'available' })).toMatchObject({ canBuy: true, maxQuantity: 1, oneOff: true })
    expect(availability({ status: 'sold' })).toMatchObject({ canBuy: false, reason: 'sold' })
    expect(availability({ status: 'reserved' })).toMatchObject({ canBuy: false, reason: 'reserved' })
  })
  it('normal stock follows the number', () => {
    expect(availability({ status: 'available', stock_quantity: 5 })).toMatchObject({ canBuy: true, maxQuantity: 5, oneOff: false, unitsLeft: 5 })
    expect(availability({ status: 'available', stock_quantity: 0 })).toMatchObject({ canBuy: false, reason: 'out_of_stock' })
    expect(availability({ status: 'out_of_stock', stock_quantity: 5 }).canBuy).toBe(false)
  })
  it('caps one order at 10 units', () => {
    expect(availability({ stock_quantity: 50 }).maxQuantity).toBe(10)
  })
  it('a color uses its own stock, or follows the product when empty', () => {
    expect(availability({ stock_quantity: 5 }, v(1, 2))).toMatchObject({ canBuy: true, maxQuantity: 2 })
    expect(availability({ stock_quantity: 5 }, v(1, 0)).canBuy).toBe(false)
    expect(availability({ stock_quantity: 5 }, v(1, null)).maxQuantity).toBe(5)
    expect(availability({ status: 'available' }, v(1, null))).toMatchObject({ canBuy: true, oneOff: true })
  })
  it('ignores bad numbers', () => {
    expect(availability({ stock_quantity: Number.NaN }).oneOff).toBe(true)
    expect(availability({ stock_quantity: -3 }).canBuy).toBe(false)
  })
})

describe('variants helpers', () => {
  it('keeps only active colors in order', () => {
    expect(activeVariants([v(2, 1, true, 2), v(1, 1, false, 1), v(3, 1, true, 0)]).map((x) => x.id)).toEqual([3, 2])
    expect(activeVariants(null)).toEqual([])
  })
  it('anyVariantBuyable', () => {
    expect(anyVariantBuyable({ stock_quantity: 0 }, [v(1, 0), v(2, 3)])).toBe(true)
    expect(anyVariantBuyable({ stock_quantity: 0 }, [v(1, 0)])).toBe(false)
    expect(anyVariantBuyable({ status: 'available' }, [])).toBe(true)
  })
  it('labels and clamps', () => {
    expect(stockLabel(availability({ stock_quantity: 2 }))).toBe('Only 2 left')
    expect(stockLabel(availability({ stock_quantity: 9 }))).toBe('In stock')
    expect(stockLabel(availability({ status: 'sold' }))).toBe('Sold')
    const a = availability({ stock_quantity: 3 })
    expect(clampQuantity(9, a)).toBe(3)
    expect(clampQuantity(0, a)).toBe(1)
    expect(clampQuantity(2, availability({ status: 'sold' }))).toBe(0)
  })
})

describe('cleanVariant', () => {
  it('accepts a good color', () => {
    expect(cleanVariant({ name: ' Black ', color_hex: '#000000', stock_quantity: '4' }, 2)).toEqual({ value: { id: undefined, name: 'Black', color_hex: '#000000', stock_quantity: 4, is_active: true, display_order: 2 } })
  })
  it('allows empty stock and empty hex', () => {
    expect(cleanVariant({ name: 'Red', stock_quantity: '' }, 0)).toMatchObject({ value: { stock_quantity: null, color_hex: null } })
  })
  it('rejects bad input', () => {
    expect(cleanVariant({ name: '' }, 0)).toHaveProperty('error')
    expect(cleanVariant({ name: 'x', stock_quantity: -1 }, 0)).toHaveProperty('error')
    expect(cleanVariant({ name: 'x', stock_quantity: 1.5 }, 0)).toHaveProperty('error')
    expect(cleanVariant({ name: 'x', color_hex: 'red' }, 0)).toHaveProperty('error')
    expect(cleanVariant({ name: 'x'.repeat(41) }, 0)).toHaveProperty('error')
  })
  it('cleanHex', () => { expect(cleanHex('#ABCDEF')).toBe('#abcdef'); expect(cleanHex('abc')).toBeNull() })
})
