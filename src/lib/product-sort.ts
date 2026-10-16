// src/lib/product-sort.ts
// Unsold products first (newest first), then reserved, then sold (most recently sold first).
// Status is matched case-insensitively; an unrecognised status sinks to the bottom rather than floating to the top.

type Sortable = {
  status?: string | null
  created_at?: string | null
  sold_at?: string | null
}

const RANK: Record<string, number> = { available: 0, reserved: 1, out_of_stock: 2, sold: 3 }
const rank = (status?: string | null): number => RANK[(status ?? 'available').trim().toLowerCase()] ?? RANK.sold
const time = (v?: string | null) => (v ? new Date(v).getTime() || 0 : 0)

export function sortUnsoldFirst<T extends Sortable>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const ra = rank(a.status)
    const rb = rank(b.status)
    if (ra !== rb) return ra - rb
    const ta = ra === RANK.sold ? time(a.sold_at) || time(a.created_at) : time(a.created_at)
    const tb = rb === RANK.sold ? time(b.sold_at) || time(b.created_at) : time(b.created_at)
    return tb - ta
  })
}
