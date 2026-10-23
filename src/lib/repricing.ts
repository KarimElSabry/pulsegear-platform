// src/lib/repricing.ts
// Automatic EUR-based pricing. PURE rules, no database.
//
// Every product that "follows the euro" remembers an ANCHOR: the EGP price you set and the EGP-per-EUR rate of that day.
// When the rate moves, the target price is   anchor price x (rate today / anchor rate)   rounded to a clean number (steps of 50).
// Because the target is always worked out from the anchor, rounding never piles up from one run to the next.
// A price only changes when the target differs from the shown price by at least the threshold (default 2%), and never
// by more than the max change (default 10%) in one run. Typing a new price by hand sets a new anchor.
//
// MARGIN is profit on the selling price: (price - cost) / price. A price is never proposed below cost + the minimum margin.

export type PricingSettings = {
  /** apply changes by itself every day; false = only propose them and wait for your approval */
  autoApply: boolean
  /** do nothing for moves smaller than this percent */
  thresholdPct: number
  /** never move a price by more than this percent in one run */
  maxChangePct: number
  /** true = prices follow the euro up AND down; false = they only ever go up */
  allowLower: boolean
  /** a price is never proposed below cost / (1 - this) */
  minMarginPct: number
  /** the margin you aim for; shown as a warning when a price is below it */
  targetMarginPct: number
  /** store EUR price x this = what an item really costs you in EUR (shipping, customs). 1 = store price only */
  landedFactor: number
}

export const DEFAULT_PRICING: PricingSettings = {
  autoApply: false, thresholdPct: 2, maxChangePct: 10, allowLower: true, minMarginPct: 15, targetMarginPct: 20, landedFactor: 1,
}

/** Round steps: 10 under 1,000, otherwise 50 (20,833 becomes 20,850, never odd numbers like 21,823). */
export function roundStep(price: number): number {
  return price < 1000 ? 10 : 50
}

/** Nearest clean number (up or down, whichever is closer). */
export function niceRound(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0
  const step = roundStep(price)
  return Math.round(price / step) * step
}

/** Clean number at or above the given price. */
export function niceCeil(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0
  const step = roundStep(price)
  return Math.ceil(price / step - 1e-9) * step
}

export type RepriceProduct = {
  id: number
  title: string
  price_egp: number
  follows_eur: boolean
  price_anchor_egp: number | null
  price_anchor_rate: number | null
  /** the official store's price in EUR (the "original price" field) */
  original_price?: number | null
  /** what the item costs you in EUR, when you know it */
  cost_eur?: number | null
  /** fixed cost in EGP (does not move with the euro) */
  cost_egp?: number | null
  status?: string | null
}

const pos = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0
const num = (n: unknown): number | null => (n === null || n === undefined || n === '' ? null : Number.isFinite(Number(n)) ? Number(n) : null)

/** What the item costs you in EGP at `rate`, or null when unknown. Your own cost wins over the store-price estimate. */
export function costEgp(p: Pick<RepriceProduct, 'cost_eur' | 'original_price' | 'cost_egp'>, rate: number, s: Pick<PricingSettings, 'landedFactor'>): number | null {
  const own = num(p.cost_eur)
  if (pos(own) && rate > 0) return own * rate
  const store = num(p.original_price)
  if (pos(store) && rate > 0) return store * (pos(s.landedFactor) ? s.landedFactor : 1) * rate
  const fixed = num(p.cost_egp)
  return pos(fixed) ? fixed : null
}

/** Profit on the selling price, in percent (one decimal). Null when the cost is unknown. */
export function marginPct(price: number, cost: number | null): number | null {
  if (cost === null || !(price > 0)) return null
  return Math.round(((price - cost) / price) * 1000) / 10
}

/** The lowest clean price that still gives `minMarginPct`. Null when the cost is unknown. */
export function priceFloor(cost: number | null, minMarginPct: number): number | null {
  if (cost === null || !(cost > 0) || minMarginPct >= 100) return null
  return niceCeil(cost / (1 - minMarginPct / 100))
}

export type PlannedChange = {
  id: number
  title: string
  from: number
  to: number
  changePct: number
  capped: boolean
  /** raised only because the margin would be too low */
  marginRaise: boolean
  marginFrom: number | null
  marginTo: number | null
}
export type PlannedAnchor = { id: number; price: number; rate: number }
export type Plan = {
  rate: number
  changes: PlannedChange[]
  /** products that follow the euro but had no anchor yet: anchored now, price untouched */
  anchors: PlannedAnchor[]
  /** followed products left alone (move too small, would go down while "only up", already at target) */
  unchanged: number
  /** followed products whose price is below the target margin and could not be fixed by this run */
  lowMargin: { id: number; title: string; margin: number }[]
}

/** The price a product would have at `rate`, from its anchor. Null when it has no usable anchor. */
export function targetPrice(p: Pick<RepriceProduct, 'price_anchor_egp' | 'price_anchor_rate'>, rate: number): number | null {
  const a = Number(p.price_anchor_egp)
  const r = Number(p.price_anchor_rate)
  if (!(a > 0) || !(r > 0) || !(rate > 0)) return null
  return niceRound(a * (rate / r))
}

const pct1 = (from: number, to: number) => Math.round(((to - from) / from) * 1000) / 10

export function planReprice(products: RepriceProduct[], rate: number, settings: PricingSettings): Plan {
  const plan: Plan = { rate, changes: [], anchors: [], unchanged: 0, lowMargin: [] }
  if (!(rate > 0)) return plan
  for (const p of products) {
    if (!p.follows_eur) continue
    const price = Number(p.price_egp)
    if (!(price > 0)) continue

    const cost = costEgp(p, rate, settings)
    const floor = priceFloor(cost, settings.minMarginPct)
    const target = targetPrice(p, rate)
    if (target === null) {
      plan.anchors.push({ id: p.id, price, rate })
      continue
    }

    const belowFloor = floor !== null && price < floor
    const wanted = floor !== null ? Math.max(target, floor) : target
    const diffPct = ((wanted - price) / price) * 100

    const small = Math.abs(diffPct) < settings.thresholdPct || wanted === price
    const lowerBlocked = diffPct < 0 && !settings.allowLower
    if ((small && !belowFloor) || lowerBlocked) {
      plan.unchanged++
      const m = marginPct(price, cost)
      if (m !== null && m < settings.targetMarginPct) plan.lowMargin.push({ id: p.id, title: p.title, margin: m })
      continue
    }

    // never more than maxChange in one run: the rest follows on the next run. A price below the margin floor is fixed at once.
    let to = wanted
    let capped = false
    if (Math.abs(diffPct) > settings.maxChangePct) {
      capped = true
      to = niceRound(price * (1 + (Math.sign(diffPct) * settings.maxChangePct) / 100))
      if ((diffPct > 0 && to > wanted) || (diffPct < 0 && to < wanted)) to = wanted
      if (floor !== null && to < floor && diffPct > 0) { to = floor; capped = false }
    }
    if (to === price) { plan.unchanged++; continue }
    plan.changes.push({
      id: p.id, title: p.title, from: price, to, changePct: pct1(price, to), capped,
      marginRaise: belowFloor && target <= price,
      marginFrom: marginPct(price, cost), marginTo: marginPct(to, cost),
    })
  }
  return plan
}

export type SetupRow = {
  id: number
  title: string
  from: number
  to: number
  changePct: number
  storeEur: number
  marginFrom: number | null
  marginTo: number | null
}

/**
 * First-time setup. Takes today's prices as the starting point and moves them up by the rate move since `baselineRate`
 * (the rate those prices were set at), rounded UP to a clean number. Only items with an official-store EUR price.
 */
export function planSetup(products: RepriceProduct[], rate: number, baselineRate: number, settings: PricingSettings): SetupRow[] {
  if (!(rate > 0) || !(baselineRate > 0)) return []
  const rows: SetupRow[] = []
  for (const p of products) {
    const store = num(p.original_price)
    const price = Number(p.price_egp)
    if (p.follows_eur || !pos(store) || !(price > 0)) continue
    const cost = costEgp(p, rate, settings)
    let to = niceCeil(price * (rate / baselineRate))
    const floor = priceFloor(cost, settings.minMarginPct)
    if (floor !== null && to < floor) to = floor
    if (to < price) to = price // setup never lowers a price
    rows.push({ id: p.id, title: p.title, from: price, to, changePct: pct1(price, to), storeEur: store, marginFrom: marginPct(price, cost), marginTo: marginPct(to, cost) })
  }
  return rows.sort((a, b) => b.from - a.from)
}

export function describeMove(fromRate: number | null, toRate: number): string {
  if (!fromRate) return `Rate ${toRate.toFixed(2)} EGP per EUR`
  const pct = ((toRate - fromRate) / fromRate) * 100
  return `Rate ${fromRate.toFixed(2)} → ${toRate.toFixed(2)} EGP per EUR (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`
}
