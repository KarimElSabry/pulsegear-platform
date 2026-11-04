import { beforeEach, describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { placeCheckout, quoteCart } from '../checkout-service'
import { cleanVariant, variantLabel, variantPrice } from '../stock'
import { imagesForVariant } from '../variant-images'
import type { CleanCustomer } from '../checkout-core'

let db: FakeDb
const client = () => db as unknown as SupabaseClient
const NOW = new Date('2026-11-04T10:00:00.000Z')
const customer: CleanCustomer = { name: 'Ahmed Mohamed', phone: '01012345678', email: null, address: '12 Street, Nasr City, Cairo', note: '' }
const line = (productId: number, variantId: number | null, quantity = 1) => ({ productId, variantId, quantity, note: '' })

// A heart-rate strap: price 1000, sizes XS-S / M-XL in black, and a size-only product.
beforeEach(() => {
  db = new FakeDb()
  db.seed('products', [
    { id: 10, slug: 'strap', title: 'HR Strap', price_egp: 1000, status: 'available', stock_quantity: 5, discount_enabled: true, reserved_until: null },
    { id: 11, slug: 'band', title: 'Band', price_egp: 800, status: 'available', stock_quantity: 5, discount_enabled: true, reserved_until: null },
  ])
  db.seed('product_variants', [
    { id: 101, product_id: 10, name: 'Black', size_name: 'XS-S', price_egp: null, color_hex: '#000000', stock_quantity: 2, is_active: true, display_order: 0 },
    { id: 102, product_id: 10, name: 'Black', size_name: 'M-XL', price_egp: 1200, color_hex: '#000000', stock_quantity: 1, is_active: true, display_order: 1 },
    { id: 103, product_id: 10, name: 'Red', size_name: 'M-XL', price_egp: 1200, color_hex: '#cc0000', stock_quantity: 0, is_active: true, display_order: 2 },
    { id: 111, product_id: 11, name: '', size_name: 'M-XXL', price_egp: null, color_hex: null, stock_quantity: 3, is_active: true, display_order: 0 },
  ])
  db.seed('product_images', [{ product_id: 10, image_url: 'red.jpg', is_primary: true, display_order: 0, variant_id: 103 }, { product_id: 10, image_url: 'black.jpg', is_primary: false, display_order: 1, variant_id: 101 }])
})

describe('labels and prices', () => {
  it('builds the label from color and size', () => {
    expect(variantLabel({ name: 'Black', size_name: 'M-XL' })).toBe('Black · M-XL')
    expect(variantLabel({ name: 'Black', size_name: null })).toBe('Black')
    expect(variantLabel({ name: '', size_name: 'M-XXL' })).toBe('M-XXL')
    expect(variantLabel(null)).toBeNull()
  })
  it('an option price replaces the product price, an empty one does not', () => {
    expect(variantPrice({ price_egp: 1200 }, 1000)).toBe(1200)
    expect(variantPrice({ price_egp: null }, 1000)).toBe(1000)
    expect(variantPrice(null, 1000)).toBe(1000)
  })
})

describe('cleanVariant with size and price', () => {
  it('accepts size only, color only, both, and a price', () => {
    expect(cleanVariant({ name: '', size_name: ' M-XL ', price_egp: '1200.5' }, 0)).toMatchObject({ value: { name: '', size_name: 'M-XL', price_egp: 1200.5 } })
    expect(cleanVariant({ name: 'Red' }, 0)).toMatchObject({ value: { size_name: null, price_egp: null } })
  })
  it('needs a color or a size, and a sane price', () => {
    expect(cleanVariant({ name: '', size_name: '' }, 0)).toHaveProperty('error')
    expect(cleanVariant({ name: 'x', price_egp: 0 }, 0)).toHaveProperty('error')
    expect(cleanVariant({ name: 'x', price_egp: 'abc' }, 0)).toHaveProperty('error')
    expect(cleanVariant({ name: 'x', size_name: 'y'.repeat(41) }, 0)).toHaveProperty('error')
  })
})

describe('quote and order with sizes', () => {
  it('prices each size from the database and names the option', async () => {
    const q = await quoteCart(client(), [line(10, 101), line(10, 102)])
    expect(q.lines[0]).toMatchObject({ colorName: 'Black · XS-S', unitPriceEgp: 1000, problem: 'ok' })
    expect(q.lines[1]).toMatchObject({ colorName: 'Black · M-XL', unitPriceEgp: 1200, problem: 'ok' })
    expect(q.totals.subtotal).toBe(2200)
  })
  it('a size-only product works and a sold-out size cannot be bought', async () => {
    expect((await quoteCart(client(), [line(11, 111)])).lines[0]).toMatchObject({ colorName: 'M-XXL', unitPriceEgp: 800, problem: 'ok' })
    expect((await quoteCart(client(), [line(10, 103)])).lines[0].problem).toBe('out_of_stock')
    expect((await quoteCart(client(), [line(10, null)])).lines[0].problem).toBe('choose_color')
  })
  it('stock is taken from the chosen size only, and the order keeps the price and label', async () => {
    const r = await placeCheckout(client(), { lines: [line(10, 102)], customer, now: NOW })
    expect(r.ok).toBe(true)
    expect(db.rows('product_variants').find((v) => v.id === 102)?.stock_quantity).toBe(0)
    expect(db.rows('product_variants').find((v) => v.id === 101)?.stock_quantity).toBe(2)
    const item = db.rows('checkout_items')[0]
    expect(item).toMatchObject({ unit_price_egp: 1200, color_name: 'Black · M-XL' })
  })
  it('the last M-XL cannot be sold twice', async () => {
    expect((await placeCheckout(client(), { lines: [line(10, 102)], customer, now: NOW })).ok).toBe(true)
    expect((await placeCheckout(client(), { lines: [line(10, 102)], customer, now: NOW })).ok).toBe(false)
  })
  it('both sizes of a color share its photos', async () => {
    const q = await quoteCart(client(), [line(10, 102)])
    expect(q.lines[0].imageUrl).toBe('black.jpg') // photo is tagged on the XS-S row only
  })
})

describe('photos shared by several sizes', () => {
  const imgs = [{ image_url: 'a', is_primary: true, display_order: 0, variant_id: 1 }, { image_url: 'a2', is_primary: false, display_order: 1, variant_id: 2 }, { image_url: 'b', is_primary: false, display_order: 1, variant_id: 3 }, { image_url: 'shared', is_primary: false, display_order: 2, variant_id: null }]
  it('accepts several ids for one color', () => {
    expect(imagesForVariant(imgs, [1, 2], true).map((i) => i.image_url)).toEqual(['a', 'a2', 'shared'])
  })
})
