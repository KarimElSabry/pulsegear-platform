// src/lib/deal-codes.ts
// A discount / partner code's percentage becomes the deal's commission: price x percent, 2 decimals.

export function commissionForCode(sellingPriceEgp: number, percent: number): number {
  if (!(sellingPriceEgp > 0) || !(percent > 0)) return 0
  return Math.round(sellingPriceEgp * percent) / 100
}
