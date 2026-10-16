// src/lib/meta/insights.ts
// Meta (Facebook/Instagram) Marketing API: daily campaign spend. Read-only (needs only the ads_read permission).
// The access token is sent in an Authorization header, never in the URL, and never appears in error messages.

import { createHash } from 'crypto'
import { round2 } from '@/lib/finance/money'
import { isDateString } from '@/lib/finance/range'
import type { SpendRow } from '@/lib/finance/spend'

export interface MetaConfig {
  accountId: string
  token: string
  version: string
  /** Static EGP rate, used only when the ad account is not in EGP and the live rate cannot be fetched. */
  fallbackFxToEgp: number | null
}

export interface InsightRow {
  campaign_id?: string
  campaign_name?: string
  spend?: string
  account_currency?: string
  date_start?: string
}

export class MetaApiError extends Error {}

export function readMetaConfig(env: Record<string, string | undefined> = process.env): MetaConfig | null {
  const accountId = (env.META_AD_ACCOUNT_ID ?? '').trim().replace(/^act_/i, '')
  const token = (env.META_ACCESS_TOKEN ?? '').trim()
  if (!/^\d{5,20}$/.test(accountId) || token.length < 20) return null
  const fx = Number(env.META_FX_RATE_TO_EGP)
  return {
    accountId,
    token,
    version: /^v\d+\.\d+$/.test(env.META_GRAPH_VERSION ?? '') ? (env.META_GRAPH_VERSION as string) : 'v25.0',
    fallbackFxToEgp: Number.isFinite(fx) && fx > 0 ? fx : null,
  }
}

/** Stable per campaign and day, so a re-sync updates the same row instead of adding a second one. */
export function metaSpendHash(campaignId: string, date: string): string {
  return createHash('sha256').update(`meta_api|${campaignId}|${date}`).digest('hex')
}

type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

const MAX_PAGES = 40

export async function fetchInsights(cfg: MetaConfig, since: string, until: string, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<InsightRow[]> {
  if (!isDateString(since) || !isDateString(until)) throw new MetaApiError('Invalid date range')

  const params = new URLSearchParams({
    level: 'campaign',
    fields: 'campaign_id,campaign_name,spend,account_currency',
    time_increment: '1',
    time_range: JSON.stringify({ since, until }),
    limit: '500',
  })
  let url: string | null = `https://graph.facebook.com/${cfg.version}/act_${cfg.accountId}/insights?${params}`
  const rows: InsightRow[] = []

  for (let page = 0; url && page < MAX_PAGES; page++) {
    const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${cfg.token}` } })
    const body = (await res.json().catch(() => null)) as { data?: InsightRow[]; paging?: { next?: string }; error?: { message?: string; code?: number } } | null
    if (!res.ok || !body || body.error) {
      const code = body?.error?.code
      if (code === 190) throw new MetaApiError('Meta rejected the access token (expired or revoked). Generate a new system user token.')
      if (code === 4 || code === 17 || code === 32 || code === 613) throw new MetaApiError('Meta rate limit reached. It will retry on the next run.')
      if (code === 10 || code === 200 || code === 294) throw new MetaApiError('The token has no permission for this ad account (needs ads_read and the account assigned to the system user).')
      throw new MetaApiError(`Meta API error ${code ?? res.status}: ${body?.error?.message?.slice(0, 200) ?? 'no details'}`)
    }
    rows.push(...(body.data ?? []))
    // follow Meta's own paging link; it is always on graph.facebook.com
    const next: string | undefined = body.paging?.next
    url = next && next.startsWith('https://graph.facebook.com/') ? next : null
  }
  return rows
}

export interface MappedSpend { rows: SpendRow[]; skipped: { campaign: string; date: string; reason: string }[] }

/** Pure: turns Meta rows into marketing_spend rows. `fx(currency)` returns EGP per unit, or null if unknown. */
export function mapInsightsToSpend(rows: InsightRow[], fx: (currency: string) => number | null, platform = 'meta'): MappedSpend {
  const out: SpendRow[] = []
  const skipped: MappedSpend['skipped'] = []

  for (const r of rows) {
    const campaign = (r.campaign_name ?? '').trim()
    const date = r.date_start ?? ''
    const id = r.campaign_id ?? campaign
    const amount = Number(r.spend)
    const currency = (r.account_currency ?? 'EGP').toUpperCase()
    const skip = (reason: string) => skipped.push({ campaign: campaign || id || '(unknown)', date, reason })

    if (!campaign || !id) { skip('campaign has no name'); continue }
    if (!isDateString(date)) { skip('invalid date'); continue }
    if (!Number.isFinite(amount) || amount < 0) { skip('invalid spend'); continue }

    const rate = currency === 'EGP' ? 1 : fx(currency)
    if (rate === null || !(rate > 0)) { skip(`no exchange rate for ${currency}`); continue }

    out.push({
      platform,
      campaign,
      spend_date: date,
      currency,
      amount: round2(amount),
      fx_rate_to_egp: Number(rate.toFixed(6)),
      amount_egp: round2(amount * rate),
      source: 'meta_api',
      source_hash: metaSpendHash(id, date),
    })
  }
  return { rows: out, skipped }
}

/** Live EGP rate for a currency (cached per run); falls back to META_FX_RATE_TO_EGP. */
export async function buildFx(currencies: string[], cfg: MetaConfig, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<(c: string) => number | null> {
  const rates = new Map<string, number>()
  for (const c of new Set(currencies.map((x) => x.toUpperCase()))) {
    if (c === 'EGP') continue
    try {
      const res = await fetchImpl(`https://open.er-api.com/v6/latest/${c}`)
      const body = (await res.json()) as { rates?: Record<string, number> }
      const egp = body.rates?.EGP
      if (res.ok && typeof egp === 'number' && egp > 0) rates.set(c, egp)
    } catch { /* fall through to the static fallback */ }
  }
  return (c) => (c.toUpperCase() === 'EGP' ? 1 : rates.get(c.toUpperCase()) ?? cfg.fallbackFxToEgp)
}
