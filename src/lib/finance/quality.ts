// src/lib/finance/quality.ts
// Financial and data-quality alerts. Pure: takes already-computed sale results.

import { round2 } from './money'
import type { SaleResult } from './sale'
import type { Attribution, Dataset } from './types'

export type AlertSeverity = 'error' | 'warning' | 'info'

export interface QualityAlert {
  code: string
  severity: AlertSeverity
  message: string
  count: number
  /** Up to 10 record ids so the figure is traceable. */
  ids: string[]
}

function alert(code: string, severity: AlertSeverity, message: string, ids: string[]): QualityAlert | null {
  return ids.length === 0 ? null : { code, severity, message, count: ids.length, ids: ids.slice(0, 10) }
}

export function qualityAlerts(
  results: SaleResult[],
  ds: Pick<Dataset, 'missingTables' | 'attributions' | 'expenses' | 'spend'>,
  opts: { operatingScopeIsFull: boolean }
): QualityAlert[] {
  const out: (QualityAlert | null)[] = []
  const recognized = results.filter((r) => r.recognized)

  if (ds.missingTables.length > 0) {
    out.push({
      code: 'migration_not_applied',
      severity: 'warning',
      message: `Reporting tables not found: ${ds.missingTables.join(', ')}. Run 20261014_01_revenue_intelligence.sql. Until then costs, refunds and attribution are empty.`,
      count: ds.missingTables.length,
      ids: ds.missingTables,
    })
  }

  out.push(alert('missing_cost', 'error',
    'Completed sales with no recorded product cost: COGS is understated and profit overstated.',
    recognized.filter((r) => r.missingCostItems > 0).map((r) => r.sale.id)))

  out.push(alert('reconciliation_mismatch', 'error',
    'Sale rows whose stored price does not equal items minus discount.',
    results
      .filter((r) => Math.abs(r.sale.recordedNet - round2(r.sale.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0) - r.sale.discount)) > 0.01)
      .map((r) => r.sale.id)))

  out.push(alert('refund_exceeds_order', 'error',
    'Refunds larger than the order value (ignored above the order value).',
    results.filter((r) => r.refundExcess > 0).map((r) => r.sale.id)))

  out.push(alert('refund_on_unrecognized', 'warning',
    'Refunds recorded on orders that are not completed (not counted).',
    results.filter((r) => r.refundsOnUnrecognized > 0).map((r) => r.sale.id)))

  out.push(alert('unassigned_return', 'warning',
    'Restocked returns on multi-product orders without a product line (cost not restored).',
    results.filter((r) => r.unassignedReturns > 0).map((r) => r.sale.id)))

  out.push(alert('cod_pending', 'info',
    'Cash-on-delivery orders not yet marked delivered (not counted as revenue yet).',
    results.filter((r) => r.sale.paymentMethod === 'cod' && r.sale.status === 'completed' && !r.recognized).map((r) => r.sale.id)))

  out.push(alert('cash_assumed', 'info',
    'Older sales with no recorded cash collection (assumed fully collected).',
    recognized.filter((r) => r.cashAssumed).map((r) => r.sale.id)))

  out.push(alert('outstanding_cash', 'warning',
    'Completed orders with money still to collect.',
    recognized.filter((r) => r.outstanding > 0).map((r) => r.sale.id)))

  out.push(alert('discount_amount_unknown', 'warning',
    'Sales that used a discount code but have no recorded discount amount.',
    results.filter((r) => r.sale.discountCode && r.sale.discount === 0).map((r) => r.sale.id)))

  out.push(alert('negative_profit', 'warning',
    'Completed sales sold below cost.',
    recognized.filter((r) => r.grossProfit < 0).map((r) => r.sale.id)))

  const refs = new Map<string, string[]>()
  for (const r of results) {
    const ref = r.sale.orderRef?.trim()
    if (ref) refs.set(ref, [...(refs.get(ref) ?? []), r.sale.id])
  }
  out.push(alert('duplicate_order_ref', 'error',
    'The same order reference appears on more than one sale (possible double entry).',
    [...refs.values()].filter((ids) => ids.length > 1).flat()))

  const attributed = new Set(ds.attributions.filter((a: Attribution) => a.status === 'attributed').map((a) => a.saleId))
  out.push(alert('unknown_attribution', 'info',
    'Completed orders with unknown attribution (they are not assigned to any campaign).',
    recognized.filter((r) => !attributed.has(r.sale.id)).map((r) => r.sale.id)))

  if (opts.operatingScopeIsFull && ds.expenses.length === 0) {
    out.push({
      code: 'no_operating_expenses',
      severity: 'warning',
      message: 'No operating expenses recorded in this period: operating profit equals contribution after ads and net profit is not shown.',
      count: 0,
      ids: [],
    })
  }

  return out.filter((a): a is QualityAlert => a !== null)
}
