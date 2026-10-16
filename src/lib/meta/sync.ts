// src/lib/meta/sync.ts

import type { SupabaseClient } from '@supabase/supabase-js'
import { addDays, todayCairo } from '@/lib/finance/range'
import { buildFx, fetchInsights, mapInsightsToSpend, MetaApiError, readMetaConfig, type MetaConfig } from './insights'

export interface SyncSummary {
  configured: boolean
  ok: boolean
  from?: string
  to?: string
  rowsFromMeta?: number
  upserted?: number
  skipped?: { campaign: string; date: string; reason: string }[]
  message: string
}

export const DEFAULT_SYNC_DAYS = 7
export const MAX_SYNC_DAYS = 90

/**
 * Pulls the last `days` days of campaign spend and upserts it. Spend for recent days still changes
 * (Meta finalises numbers for a day or two), so each run overwrites those rows instead of adding new ones.
 */
export async function syncMetaSpend(
  db: SupabaseClient,
  opts: { days?: number; today?: string; config?: MetaConfig | null } = {}
): Promise<SyncSummary> {
  const cfg = opts.config === undefined ? readMetaConfig() : opts.config
  if (!cfg) return { configured: false, ok: true, message: 'Meta is not configured (META_AD_ACCOUNT_ID / META_ACCESS_TOKEN).' }

  const days = Math.min(Math.max(Math.round(opts.days ?? DEFAULT_SYNC_DAYS), 1), MAX_SYNC_DAYS)
  const to = opts.today ?? todayCairo()
  const from = addDays(to, -(days - 1))

  try {
    const insights = await fetchInsights(cfg, from, to)
    const fx = await buildFx(insights.map((r) => r.account_currency ?? 'EGP'), cfg)
    const { rows, skipped } = mapInsightsToSpend(insights, fx)

    let upserted = 0
    for (let i = 0; i < rows.length; i += 500) {
      const { data, error } = await db.from('marketing_spend').upsert(rows.slice(i, i + 500), { onConflict: 'source_hash' }).select('id')
      if (error) throw new Error(error.message)
      upserted += data?.length ?? 0
    }

    const parts = [`${upserted} spend row(s) saved for ${from} to ${to}`]
    if (skipped.length > 0) parts.push(`${skipped.length} skipped (${[...new Set(skipped.map((s) => s.reason))].join(', ')})`)
    return { configured: true, ok: true, from, to, rowsFromMeta: insights.length, upserted, skipped, message: parts.join(' · ') }
  } catch (err) {
    const message = err instanceof MetaApiError ? err.message : 'Could not save Meta spend (see server logs).'
    if (!(err instanceof MetaApiError)) console.error('[meta-sync]', err instanceof Error ? err.message : err)
    return { configured: true, ok: false, from, to, message }
  }
}
