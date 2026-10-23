import { describe, expect, it } from 'vitest'
import { DEFAULT_PRICING, costEgp, describeMove, marginPct, niceCeil, niceRound, planReprice, planSetup, priceFloor, roundStep, targetPrice, type RepriceProduct } from '../repricing'

const p = (id: number, price: number, anchorEgp: number | null, anchorRate: number | null, follows = true): RepriceProduct =>
  ({ id, title: `P${id}`, price_egp: price, follows_eur: follows, price_anchor_egp: anchorEgp, price_anchor_rate: anchorRate })
const ON = { ...DEFAULT_PRICING, enabled: true }

describe('niceRound', () => {
  it('gives clean numbers by price size', () => {
    expect(niceRound(20833)).toBe(20850)
    expect(niceRound(21823)).toBe(21800)
    expect(niceRound(62345)).toBe(62350)
    expect(niceRound(48760)).toBe(48750)
    expect(niceRound(12349)).toBe(12350)
    expect(niceRound(3977)).toBe(4000)
    expect(niceRound(742)).toBe(740)
  })
  it('rounds to the NEAREST (up or down)', () => {
    expect(niceRound(40024)).toBe(40000)
    expect(niceRound(40026)).toBe(40050)
  })
  it('handles bad input', () => {
    expect(niceRound(0)).toBe(0)
    expect(niceRound(Number.NaN)).toBe(0)
    expect(roundStep(999)).toBe(10)
    expect(roundStep(20000)).toBe(50)
  })
})

describe('targetPrice', () => {
  it('scales the anchor by the rate move', () => {
    expect(targetPrice({ price_anchor_egp: 40000, price_anchor_rate: 57 }, 60.5)).toBe(42450) // 42456 -> 42450
  })
  it('is null without an anchor', () => {
    expect(targetPrice({ price_anchor_egp: null, price_anchor_rate: null }, 60)).toBeNull()
    expect(targetPrice({ price_anchor_egp: 100, price_anchor_rate: 0 }, 60)).toBeNull()
  })
})

describe('planReprice', () => {
  it('raises a price when the euro rises (the 3.5 EGP move)', () => {
    const plan = planReprice([p(1, 63000, 63000, 57)], 60.5, ON)
    expect(plan.changes).toHaveLength(1)
    expect(plan.changes[0]).toMatchObject({ id: 1, from: 63000, to: 66850, changePct: 6.1, capped: false })
  })
  it('ignores products that do not follow the euro', () => {
    expect(planReprice([p(1, 63000, 63000, 57, false)], 70, ON).changes).toHaveLength(0)
  })
  it('anchors a product that has no anchor yet, without touching its price', () => {
    const plan = planReprice([p(1, 40000, null, null)], 60.5, ON)
    expect(plan.anchors).toEqual([{ id: 1, price: 40000, rate: 60.5 }])
    expect(plan.changes).toHaveLength(0)
  })
  it('does nothing for a small move (under the threshold)', () => {
    const plan = planReprice([p(1, 40000, 40000, 57)], 57.5, ON) // +0.9%
    expect(plan.changes).toHaveLength(0)
    expect(plan.unchanged).toBe(1)
  })
  it('caps one run at the max change, the rest follows next run', () => {
    const plan = planReprice([p(1, 40000, 40000, 50)], 60, ON) // target +20%
    expect(plan.changes[0]).toMatchObject({ from: 40000, to: 44000, capped: true })
    const next = planReprice([p(1, 44000, 40000, 50)], 60, ON)
    expect(next.changes[0]).toMatchObject({ from: 44000, to: 48000 })
  })
  it('lowers prices when the euro falls, unless "never lower" is on', () => {
    expect(planReprice([p(1, 40000, 40000, 60)], 57, ON).changes[0]).toMatchObject({ to: 38000 })
    const up = planReprice([p(1, 40000, 40000, 60)], 57, { ...ON, allowLower: false })
    expect(up.changes).toHaveLength(0)
    expect(up.unchanged).toBe(1)
  })
  it('is stable: running again at the same rate changes nothing', () => {
    const first = planReprice([p(1, 40000, 40000, 57)], 61, ON)
    const newPrice = first.changes[0].to
    expect(planReprice([p(1, newPrice, 40000, 57)], 61, ON).changes).toHaveLength(0)
  })
  it('rounding never piles up: the target always comes from the anchor, not the last shown price', () => {
    const a = planReprice([p(1, 40000, 40000, 57)], 61, ON).changes[0].to // 42800
    const b = planReprice([p(1, a, 40000, 57)], 63, ON).changes[0].to
    expect(b).toBe(targetPrice({ price_anchor_egp: 40000, price_anchor_rate: 57 }, 63))
  })
  it('does nothing without a valid rate', () => {
    expect(planReprice([p(1, 40000, 40000, 57)], 0, ON)).toMatchObject({ changes: [], anchors: [] })
  })
  it('describes the move', () => {
    expect(describeMove(57, 60.5)).toBe('Rate 57.00 → 60.50 EGP per EUR (+6.1%)')
    expect(describeMove(null, 60.5)).toBe('Rate 60.50 EGP per EUR')
  })
})

describe('margin', () => {
  it('uses your cost first, then the store price x landed factor, then the fixed EGP cost', () => {
    expect(costEgp({ cost_eur: 500, original_price: 750, cost_egp: 1 }, 60, { landedFactor: 1.2 })).toBe(30000)
    expect(costEgp({ cost_eur: null, original_price: 750, cost_egp: 1 }, 60, { landedFactor: 1.2 })).toBe(54000)
    expect(costEgp({ cost_eur: null, original_price: null, cost_egp: 9000 }, 60, { landedFactor: 1 })).toBe(9000)
    expect(costEgp({ cost_eur: null, original_price: null, cost_egp: null }, 60, { landedFactor: 1 })).toBeNull()
  })
  it('margin is profit on the selling price', () => {
    expect(marginPct(10000, 8000)).toBe(20)
    expect(marginPct(10000, null)).toBeNull()
  })
  it('floor is the lowest clean price with the minimum margin', () => {
    expect(priceFloor(8500, 15)).toBe(10000) // 8500 / 0.85
    expect(priceFloor(8501, 15)).toBe(10050)
    expect(priceFloor(null, 15)).toBeNull()
    expect(niceCeil(20801)).toBe(20850)
  })
  const withCost = (price: number, costEur: number): RepriceProduct => ({ ...p(1, price, price, 60), cost_eur: costEur })
  it('raises a price that is below the minimum margin, even when the euro did not move', () => {
    const plan = planReprice([withCost(9000, 150)], 60, ON) // cost 9000 -> floor 10600
    expect(plan.changes[0]).toMatchObject({ from: 9000, to: 10600, marginRaise: true, marginFrom: 0 })
    expect(plan.changes[0].marginTo).toBeGreaterThanOrEqual(15)
  })
  it('never proposes a price below the margin floor when the euro falls', () => {
    const plan = planReprice([withCost(12000, 150)], 57, ON) // target 11400, cost 8550 -> floor 10050
    expect(plan.changes[0].to).toBeGreaterThanOrEqual(10050)
  })
  it('reports followed products under the target margin that were left alone', () => {
    const plan = planReprice([withCost(10650, 150)], 60, ON) // cost 9000 -> margin 15.5%
    expect(plan.changes).toHaveLength(0)
    expect(plan.lowMargin).toEqual([{ id: 1, title: 'P1', margin: 15.5 }])
  })
})

describe('planSetup', () => {
  const store = (id: number, price: number, eur: number | null, follows = false): RepriceProduct => ({ ...p(id, price, null, null, follows), original_price: eur })
  it('moves today\'s prices up by the rate move, rounded UP, only for items with a store EUR price', () => {
    const rows = planSetup([store(1, 63000, 750), store(2, 6000, null), store(3, 20000, 249, true)], 60.5, 57, ON)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 1, from: 63000, to: 66900, storeEur: 750 }) // 66868 -> 66900
  })
  it('never lowers a price and respects the margin floor', () => {
    expect(planSetup([store(1, 63000, 750)], 55, 57, ON)[0].to).toBe(63000)
    const costly = { ...store(1, 40000, 750), cost_eur: 600 } // cost 36000 -> floor 42400
    expect(planSetup([costly], 60, 60, ON)[0].to).toBe(42400)
  })
  it('returns nothing without valid rates', () => {
    expect(planSetup([store(1, 63000, 750)], 0, 57, ON)).toEqual([])
  })
})
