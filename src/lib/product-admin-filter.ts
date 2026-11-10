// Manage Products list filter: Active / Sold / Out of stock / All, plus a search box.
// "Active" = what customers can still buy or that is on hold (available + reserved).
import type { ProductStatus } from '@/types/product'

export type StatusFilter = 'active' | 'sold' | 'out_of_stock' | 'all'

type Row = { title?: string | null; status?: ProductStatus | string | null; id?: number | string }

export function statusOf(p: Row): string {
  return p.status ?? 'available'
}

export function matchesStatusFilter(p: Row, filter: StatusFilter): boolean {
  const s = statusOf(p)
  if (filter === 'all') return true
  if (filter === 'active') return s === 'available' || s === 'reserved'
  return s === filter
}

export function matchesSearch(p: Row, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return `${p.title ?? ''} ${p.id ?? ''}`.toLowerCase().includes(q)
}

export function filterProducts<T extends Row>(products: T[], filter: StatusFilter, query: string): T[] {
  return products.filter((p) => matchesStatusFilter(p, filter) && matchesSearch(p, query))
}

export function statusCounts(products: Row[]): Record<StatusFilter, number> {
  const c: Record<StatusFilter, number> = { active: 0, sold: 0, out_of_stock: 0, all: products.length }
  for (const p of products) {
    for (const f of ['active', 'sold', 'out_of_stock'] as const) if (matchesStatusFilter(p, f)) c[f]++
  }
  return c
}
