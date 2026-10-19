// src/lib/milestones.ts
// Pure helpers for the milestone page.

import { netSoFar } from '@/lib/finance/summary'
import type { Totals } from '@/lib/finance/engine'

export type MilestoneMetric = 'net_revenue' | 'net_result'

export const METRIC_LABEL: Record<MilestoneMetric, string> = {
  net_revenue: 'Net sales revenue',
  net_result: 'Net result (after the costs entered)',
}

export interface Milestone {
  id: string
  title: string
  target_eur: number
  metric: MilestoneMetric
  start_date: string | null
  eur_rate_override: number | null
  achieved_at: string | null
  archived: boolean
  created_at: string
}

export function metricValueEgp(t: Totals, metric: MilestoneMetric): number {
  return metric === 'net_result' ? netSoFar(t).value : t.netSalesRevenue
}

/** Raw percentage, never negative. It can exceed 100 once the target is beaten. */
export function progressPct(valueEur: number, targetEur: number): number {
  if (!(targetEur > 0) || !(valueEur > 0)) return 0
  return Math.round((valueEur / targetEur) * 1000) / 10
}

export function stageMessage(pct: number): string {
  if (pct >= 100) return 'Milestone reached! 🎉'
  if (pct >= 75) return 'Almost there. The finish line is in sight!'
  if (pct >= 50) return 'Over halfway there.'
  if (pct >= 25) return 'Building momentum.'
  return 'Every order counts. Just getting started.'
}

/** Whole days to finish at the recent pace, or null when there is no positive pace. */
export function etaDays(remainingEur: number, perDayEur: number): number | null {
  if (!(remainingEur > 0)) return 0
  if (!(perDayEur > 0)) return null
  return Math.ceil(remainingEur / perDayEur)
}
