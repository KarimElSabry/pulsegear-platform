import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { cleanVariantList, parseVariantsField, replaceVariants, saveOptionsForNewProduct } from '../variant-service'

let db: FakeDb
const client = () => db as unknown as SupabaseClient
const rowsOf = (r: ReturnType<typeof cleanVariantList>) => { if ('error' in r) throw new Error(r.error); return r.rows }

beforeEach(() => { db = new FakeDb() })

describe('parseVariantsField (the options typed in Add Product)', () => {
  it('nothing typed = no options', () => {
    expect(parseVariantsField(null)).toEqual({ rows: [] })
    expect(parseVariantsField('')).toEqual({ rows: [] })
    expect(parseVariantsField('[]')).toEqual({ rows: [] })
  })
  it('keeps a color with its own price, and a color left at the product price', () => {
    const r = parseVariantsField(JSON.stringify([{ name: 'Black', size_name: 'M', price_egp: '1200', stock_quantity: '3' }, { name: 'White', size_name: null, price_egp: null }]))
    expect('rows' in r && r.rows.map((x) => [x.name, x.size_name, x.price_egp, x.stock_quantity])).toEqual([['Black', 'M', 1200, 3], ['White', null, null, null]])
  })
  it('ignores a row you added but never filled in', () => {
    const r = parseVariantsField(JSON.stringify([{ name: '', size_name: null, price_egp: null, stock_quantity: null }, { name: 'Black' }]))
    expect('rows' in r && r.rows).toHaveLength(1)
  })
  it('a row with only a price but no color or size is an error, not silently dropped', () => {
    expect(parseVariantsField(JSON.stringify([{ name: '', price_egp: '500' }]))).toHaveProperty('error')
  })
  it('refuses bad prices, duplicates, broken text and too many options', () => {
    expect(parseVariantsField(JSON.stringify([{ name: 'Black', price_egp: 'abc' }]))).toHaveProperty('error')
    expect(parseVariantsField(JSON.stringify([{ name: 'Black', size_name: 'M' }, { name: 'black', size_name: 'm' }]))).toEqual({ error: 'Two options have the same color and size' })
    expect(parseVariantsField('{oops')).toHaveProperty('error')
    expect(parseVariantsField('{"a":1}')).toHaveProperty('error')
    expect(parseVariantsField(JSON.stringify(Array.from({ length: 31 }, (_, i) => ({ name: `C${i}` }))))).toHaveProperty('error')
  })
})

describe('replaceVariants', () => {
  it('adds new options to the product', async () => {
    const r = await replaceVariants(client(), 5, rowsOf(cleanVariantList([{ name: 'Black', size_name: 'M', price_egp: 100 }, { name: 'White' }])))
    expect(r.ok).toBe(true)
    expect(db.rows('product_variants').map((v) => [v.product_id, v.name, v.size_name, v.price_egp, v.display_order])).toEqual([[5, 'Black', 'M', 100, 0], [5, 'White', null, null, 1]])
  })
  it('updates rows that have an id and deletes the ones that are missing, only for this product', async () => {
    db.seed('product_variants', [
      { id: 1, product_id: 5, name: 'Black', size_name: null, price_egp: null, color_hex: null, stock_quantity: null, is_active: true, display_order: 0 },
      { id: 2, product_id: 5, name: 'Old', size_name: null, price_egp: null, color_hex: null, stock_quantity: null, is_active: true, display_order: 1 },
      { id: 3, product_id: 9, name: 'Other product', size_name: null, price_egp: null, color_hex: null, stock_quantity: null, is_active: true, display_order: 0 },
    ])
    const r = await replaceVariants(client(), 5, rowsOf(cleanVariantList([{ id: 1, name: 'Black', price_egp: 250 }])))
    expect(r.ok).toBe(true)
    expect(db.rows('product_variants').map((v) => [v.id, v.price_egp])).toEqual([[1, 250], [3, null]])
  })
  it('reports a database failure', async () => {
    db.failing.add('product_variants')
    const r = await replaceVariants(client(), 5, rowsOf(cleanVariantList([{ name: 'Black' }])))
    expect(r.ok).toBe(false)
  })
  it('explains the missing sizes migration', async () => {
    const real = db.from.bind(db)
    ;(db as unknown as { from: (t: string) => unknown }).from = (t: string) => {
      const q = real(t) as { insert: (v: unknown) => unknown }
      if (t === 'product_variants') q.insert = () => Promise.resolve({ data: null, error: { message: 'column size_name does not exist' } })
      return q
    }
    const r = await replaceVariants(client(), 5, rowsOf(cleanVariantList([{ name: 'Black', size_name: 'M' }])))
    expect(!r.ok && r.message).toContain('20261106_01_sizes_and_prices.sql')
  })
})

describe('saveOptionsForNewProduct', () => {
  it('saves the options and keeps the product', async () => {
    const remove = vi.fn()
    const r = await saveOptionsForNewProduct(client(), 7, rowsOf(cleanVariantList([{ name: 'Black' }])), remove)
    expect(r).toEqual({ ok: true })
    expect(remove).not.toHaveBeenCalled()
    expect(db.rows('product_variants')).toHaveLength(1)
  })
  it('does nothing when there are no options', async () => {
    const remove = vi.fn()
    expect(await saveOptionsForNewProduct(client(), 7, [], remove)).toEqual({ ok: true })
    expect(remove).not.toHaveBeenCalled()
  })
  it('removes the new product again when the options cannot be saved', async () => {
    db.failing.add('product_variants')
    const remove = vi.fn().mockResolvedValue(undefined)
    const r = await saveOptionsForNewProduct(client(), 7, rowsOf(cleanVariantList([{ name: 'Black' }])), remove)
    expect(remove).toHaveBeenCalledWith(7)
    expect(!r.ok && r.message).toContain('the product was not added')
  })
  it('still reports the failure when removing the product also fails', async () => {
    db.failing.add('product_variants')
    const r = await saveOptionsForNewProduct(client(), 7, rowsOf(cleanVariantList([{ name: 'Black' }])), vi.fn().mockRejectedValue(new Error('boom')))
    expect(r.ok).toBe(false)
  })
})
