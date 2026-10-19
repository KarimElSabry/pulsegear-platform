// src/lib/inventory.ts
// Stock on hand: what is tied up, how old it is, and what has no recorded cost. Pure, so it is easy to test.

export interface StockItem { id: number; title: string; brand?: string | null; status?: string | null; price_egp?: number | string | null; cost_egp?: number | string | null; created_at?: string | null }

export interface StockRow { id: number; title: string; brand: string; status: string; price: number; cost: number | null; ageDays: number; marginPct: number | null }
export interface InventorySummary {
  items: number
  retailValue: number
  /** Cost of the items whose cost is known. */
  knownCostValue: number
  uncosted: number
  buckets: { label: string; count: number; retail: number }[]
  slow: StockRow[]
  slowDays: number
}

const DAY = 86_400_000
const num = (v: unknown): number | null => { const n = Number(v); return v === null || v === undefined || v === '' || !Number.isFinite(n) ? null : n }
const round2 = (n: number) => Math.round(n * 100) / 100

export function inventorySummary(products: StockItem[], now = new Date(), slowDays = 30): InventorySummary {
  const rows: StockRow[] = products
    .filter((p) => (p.status ?? 'available') === 'available' || p.status === 'reserved')
    .map((p) => {
      const price = num(p.price_egp) ?? 0
      const cost = num(p.cost_egp)
      const ageDays = p.created_at ? Math.max(0, Math.floor((now.getTime() - new Date(p.created_at).getTime()) / DAY)) : 0
      return {
        id: p.id, title: p.title, brand: p.brand ?? '', status: p.status ?? 'available', price, cost, ageDays,
        marginPct: cost !== null && cost > 0 && price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : null,
      }
    })

  const bucketDefs: [string, (d: number) => boolean][] = [
    ['0-30 days', (d) => d <= 30], ['31-60 days', (d) => d > 30 && d <= 60], ['61-90 days', (d) => d > 60 && d <= 90], ['Over 90 days', (d) => d > 90],
  ]
  return {
    items: rows.length,
    retailValue: round2(rows.reduce((a, r) => a + r.price, 0)),
    knownCostValue: round2(rows.reduce((a, r) => a + (r.cost ?? 0), 0)),
    uncosted: rows.filter((r) => r.cost === null).length,
    buckets: bucketDefs.map(([label, test]) => {
      const inB = rows.filter((r) => test(r.ageDays))
      return { label, count: inB.length, retail: round2(inB.reduce((a, r) => a + r.price, 0)) }
    }),
    slow: rows.filter((r) => r.ageDays > slowDays).sort((a, b) => b.ageDays - a.ageDays),
    slowDays,
  }
}
