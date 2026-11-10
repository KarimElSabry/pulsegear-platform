// src/lib/sellers.ts
// The "Seller" filter of the shop: Pulse Gear's own products or the ones listed on behalf of clients.

export const SELLER_OPTIONS = ['All', 'Pulse Gear', 'Client listing'] as const
export type SellerFilter = (typeof SELLER_OPTIONS)[number]

/** Reads a filter value from the address (?seller=client) or a stored value. Anything unknown means All. */
export function canonSeller(value: string | null | undefined): SellerFilter {
  const v = (value ?? '').toLowerCase().replace(/[\s_-]+/g, '')
  if (v === 'client' || v === 'clients' || v === 'clientlisting' || v === 'clientlistings') return 'Client listing'
  if (v === 'pulsegear' || v === 'own') return 'Pulse Gear'
  return 'All'
}

export const isClientListing = (p: { client_listing?: boolean | null }) => p.client_listing === true

export function matchesSeller(p: { client_listing?: boolean | null }, seller: string | null | undefined): boolean {
  const s = canonSeller(seller)
  if (s === 'All') return true
  return s === 'Client listing' ? isClientListing(p) : !isClientListing(p)
}
