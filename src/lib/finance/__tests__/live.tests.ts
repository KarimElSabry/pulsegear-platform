// Read-only check against the real database. Skipped unless LIVE_SUPABASE=1 (it only runs SELECTs).
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { analyze } from '../engine'
import { loadDataset } from '../load'
import { reconciliation } from '../reports'

function env(name: string): string {
  const line = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='))
  return (line ?? '').slice(name.length + 1).trim().replace(/^["']|["']$/g, '')
}

describe.skipIf(!process.env.LIVE_SUPABASE)('live data (read-only)', () => {
  it('loads the real sales table and every reconciliation check passes', async () => {
    const db = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
    const range = { from: '2025-01-01', to: '2026-12-31' }
    const ds = await loadDataset(db, range)
    const a = analyze(ds, range, { comparePrevious: false })

    const { data: raw } = await db.from('sales').select('selling_price_egp, profit_egp, cost_egp, commission_egp')
    const rawRevenue = (raw ?? []).reduce((s, r) => s + Number(r.selling_price_egp), 0)
    const rawProfit = (raw ?? []).reduce((s, r) => s + Number(r.profit_egp), 0)

    const summary = JSON.stringify({
      sales: ds.sales.length, missingTables: ds.missingTables,
      completedOrders: a.totals.completedOrders, netSalesRevenue: a.totals.netSalesRevenue, legacyColumnRevenue: rawRevenue,
      cogs: a.totals.cogs, grossProfit: a.totals.grossProfit, legacyColumnProfit: Math.round(rawProfit * 100) / 100,
      commission: a.totals.costsByCategory.commission, contributionBeforeAds: a.totals.contributionBeforeAds,
      missingCostRecords: a.totals.missingCostRecords, alerts: a.alerts.map((x) => `${x.code}:${x.count}`),
    }, null, 1)
    if (process.env.LIVE_OUT) (await import('node:fs')).writeFileSync(process.env.LIVE_OUT, summary)

    expect(ds.sales.length).toBe((raw ?? []).length)
    expect(reconciliation(a).filter((c) => c.status !== 'ok')).toEqual([])
    // the new layer must reproduce the stored revenue of the old ledger exactly
    expect(a.totals.netSalesRevenue).toBe(Math.round(rawRevenue * 100) / 100)
  })
})
