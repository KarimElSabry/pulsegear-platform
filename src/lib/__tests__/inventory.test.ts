import { describe, expect, it } from 'vitest'
import { inventorySummary } from '../inventory'

const NOW = new Date('2026-10-19T00:00:00Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString()

describe('inventorySummary', () => {
  const list = [
    { id: 1, title: 'A', status: 'available', price_egp: 1000, cost_egp: 600, created_at: daysAgo(5) },
    { id: 2, title: 'B', status: 'reserved', price_egp: '2000', cost_egp: null, created_at: daysAgo(45) },
    { id: 3, title: 'C', status: 'available', price_egp: 500, cost_egp: 0, created_at: daysAgo(120) },
    { id: 4, title: 'Sold', status: 'sold', price_egp: 9999, cost_egp: 1, created_at: daysAgo(200) },
  ]
  it('counts only unsold stock, values it and finds items without a cost', () => {
    const s = inventorySummary(list, NOW)
    expect(s.items).toBe(3)
    expect(s.retailValue).toBe(3500)
    expect(s.knownCostValue).toBe(600)
    expect(s.uncosted).toBe(1)
  })
  it('buckets by age and lists slow movers oldest first with margin where cost is known', () => {
    const s = inventorySummary(list, NOW)
    expect(s.buckets.map((b) => b.count)).toEqual([1, 1, 0, 1])
    expect(s.slow.map((r) => r.id)).toEqual([3, 2])
    expect(inventorySummary(list, NOW).slow[1].marginPct).toBeNull()
    expect(inventorySummary([list[0]], NOW, 1).slow[0].marginPct).toBe(40)
  })
})
