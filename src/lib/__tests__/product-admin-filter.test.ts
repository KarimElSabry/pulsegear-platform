import { describe, it, expect } from 'vitest'
import { filterProducts, statusCounts, matchesSearch } from '../product-admin-filter'

const P = [
  { id: 1, title: 'Garmin Venu 2', status: 'available' },
  { id: 2, title: 'Coros Pace 3', status: 'reserved' },
  { id: 3, title: 'Polar H10', status: 'sold' },
  { id: 4, title: 'Whoop 4.0', status: 'out_of_stock' },
  { id: 5, title: 'Old row without status' },
]
const ids = (l: { id: number }[]) => l.map((p) => p.id)

describe('product-admin-filter', () => {
  it('active = available + reserved + missing status (default)', () => {
    expect(ids(filterProducts(P, 'active', ''))).toEqual([1, 2, 5])
  })
  it('sold shows only sold; out_of_stock only out of stock', () => {
    expect(ids(filterProducts(P, 'sold', ''))).toEqual([3])
    expect(ids(filterProducts(P, 'out_of_stock', ''))).toEqual([4])
  })
  it('all shows everything', () => {
    expect(filterProducts(P, 'all', '')).toHaveLength(5)
  })
  it('search ignores case and matches title or id, combined with the status filter', () => {
    expect(ids(filterProducts(P, 'all', '  GARMIN '))).toEqual([1])
    expect(ids(filterProducts(P, 'all', '3'))).toEqual([2, 3])
    expect(ids(filterProducts(P, 'sold', 'garmin'))).toEqual([])
    expect(matchesSearch({ title: null }, 'x')).toBe(false)
  })
  it('counts per tab', () => {
    expect(statusCounts(P)).toEqual({ active: 3, sold: 1, out_of_stock: 1, all: 5 })
  })
})
