import { describe, expect, it } from 'vitest'
import { canonSeller, isClientListing, matchesSeller } from '../sellers'

describe('seller filter', () => {
  it('reads the filter from the address and stored values', () => {
    expect(canonSeller('client')).toBe('Client listing')
    expect(canonSeller('Client listing')).toBe('Client listing')
    expect(canonSeller('client_listings')).toBe('Client listing')
    expect(canonSeller('pulse-gear')).toBe('Pulse Gear')
    expect(canonSeller('Pulse Gear')).toBe('Pulse Gear')
    expect(canonSeller('whatever')).toBe('All')
    expect(canonSeller(null)).toBe('All')
  })
  it('splits products into client listings and Pulse Gear products', () => {
    const client = { client_listing: true }
    const own = { client_listing: false }
    const old = {} // before the migration the column does not exist: a normal product
    expect(isClientListing(client)).toBe(true)
    expect(isClientListing(old)).toBe(false)
    expect([client, own, old].filter((p) => matchesSeller(p, 'Client listing'))).toEqual([client])
    expect([client, own, old].filter((p) => matchesSeller(p, 'Pulse Gear'))).toEqual([own, old])
    expect([client, own, old].filter((p) => matchesSeller(p, 'All'))).toHaveLength(3)
  })
})
