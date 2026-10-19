// src/lib/finance/summary.ts
// "Net result so far": always a number, built only from costs that have actually been recorded, plus a plain list
// of what is still missing. Unlike netProfit (which is blank until the data is complete) this never hides a figure.

import { round2 } from './money'
import type { Totals } from './engine'

export interface NetResult {
  /** Revenue minus product cost, order costs, ad spend and the monthly expenses/tax entered so far. */
  value: number
  /** True only when nothing known is missing, i.e. it equals the official Net Profit. */
  complete: boolean
  missing: string[]
}

export function netSoFar(t: Totals): NetResult {
  const value = round2(t.contributionAfterAds - (t.operatingExpenses ?? 0) - (t.taxAndInterest ?? 0))
  const missing: string[] = []
  if (t.completedOrders > 0 && t.orderCostsTotal === 0) missing.push('no shipping or other order costs entered')
  if (t.operatingExpenses !== null && t.operatingExpenses === 0) missing.push('no monthly expenses entered')
  if (t.missingCostRecords > 0) missing.push(`${t.missingCostRecords} sale(s) have no product cost, so their profit is overstated`)
  return { value, complete: missing.length === 0 && t.netProfit !== null, missing }
}
