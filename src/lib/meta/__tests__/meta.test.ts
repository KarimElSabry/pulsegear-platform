import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { buildFx, fetchInsights, mapInsightsToSpend, metaSpendHash, readMetaConfig, type MetaConfig } from '../insights'
import { syncMetaSpend } from '../sync'

const cfg: MetaConfig = { accountId: '123456789', token: 't'.repeat(30), version: 'v25.0', fallbackFxToEgp: null }
const resp = (body: unknown, ok = true, status = 200) => ({ ok, status, json: async () => body })

describe('readMetaConfig', () => {
  it('requires both values and strips act_', () => {
    expect(readMetaConfig({})).toBeNull()
    expect(readMetaConfig({ META_AD_ACCOUNT_ID: 'act_123456789', META_ACCESS_TOKEN: 'x'.repeat(30) })?.accountId).toBe('123456789')
    expect(readMetaConfig({ META_AD_ACCOUNT_ID: 'abc', META_ACCESS_TOKEN: 'x'.repeat(30) })).toBeNull()
  })
})

describe('mapInsightsToSpend', () => {
  const fx = (c: string) => (c === 'USD' ? 50 : null)
  it('maps EGP rows with a stable hash that ignores the amount', () => {
    const a = mapInsightsToSpend([{ campaign_id: '1', campaign_name: 'Oct', spend: '100.5', account_currency: 'EGP', date_start: '2026-10-01' }], fx)
    const b = mapInsightsToSpend([{ campaign_id: '1', campaign_name: 'Oct', spend: '140', account_currency: 'EGP', date_start: '2026-10-01' }], fx)
    expect(a.rows[0]).toMatchObject({ platform: 'meta', amount_egp: 100.5, source: 'meta_api' })
    expect(a.rows[0].source_hash).toBe(b.rows[0].source_hash)
    expect(a.rows[0].source_hash).toBe(metaSpendHash('1', '2026-10-01'))
  })
  it('converts currency and skips unknown ones and bad rows', () => {
    const r = mapInsightsToSpend([
      { campaign_id: '1', campaign_name: 'A', spend: '2', account_currency: 'USD', date_start: '2026-10-01' },
      { campaign_id: '2', campaign_name: 'B', spend: '2', account_currency: 'EUR', date_start: '2026-10-01' },
      { campaign_id: '3', campaign_name: 'C', spend: 'x', date_start: '2026-10-01' },
      { campaign_id: '4', campaign_name: 'D', spend: '1', date_start: '2026-02-30' },
      { campaign_id: '5', campaign_name: '', spend: '1', date_start: '2026-10-01' },
    ], fx)
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0].amount_egp).toBe(100)
    expect(r.skipped).toHaveLength(4)
  })
})

describe('fetchInsights', () => {
  it('follows pagination, sends token in header only', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(resp({ data: [{ campaign_id: '1' }], paging: { next: 'https://graph.facebook.com/next' } }))
      .mockResolvedValueOnce(resp({ data: [{ campaign_id: '2' }] }))
    const rows = await fetchInsights(cfg, '2026-10-01', '2026-10-07', f)
    expect(rows).toHaveLength(2)
    expect(f.mock.calls[0][0]).not.toContain(cfg.token)
    expect(f.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${cfg.token}`)
  })
  it('refuses to follow off-domain paging links', async () => {
    const f = vi.fn().mockResolvedValue(resp({ data: [], paging: { next: 'https://evil.example/x' } }))
    await fetchInsights(cfg, '2026-10-01', '2026-10-07', f)
    expect(f).toHaveBeenCalledTimes(1)
  })
  it('gives clear errors without leaking the token', async () => {
    const f = vi.fn().mockResolvedValue(resp({ error: { code: 190, message: `bad ${cfg.token}` } }, false, 400))
    await expect(fetchInsights(cfg, '2026-10-01', '2026-10-07', f)).rejects.toThrow(/expired or revoked/)
  })
})

describe('buildFx', () => {
  it('uses live rate, then fallback', async () => {
    const live = await buildFx(['USD'], cfg, (async () => resp({ rates: { EGP: 48 } })) as never)
    expect(live('USD')).toBe(48)
    const fb = await buildFx(['USD'], { ...cfg, fallbackFxToEgp: 47 }, (async () => { throw new Error('down') }) as never)
    expect(fb('USD')).toBe(47)
    expect(fb('EGP')).toBe(1)
  })
})

describe('syncMetaSpend', () => {
  it('is a no-op when unconfigured', async () => {
    const r = await syncMetaSpend({} as SupabaseClient, { config: null })
    expect(r).toMatchObject({ configured: false, ok: true })
  })
  it('upserts on source_hash so re-runs update, not duplicate', async () => {
    const store = new Map<string, Record<string, unknown>>()
    const db = { from: () => ({ upsert: (rows: Record<string, unknown>[]) => { rows.forEach((x) => store.set(x.source_hash as string, x)); return { select: async () => ({ data: rows.map(() => ({ id: 1 })), error: null }) } } }) } as unknown as SupabaseClient
    const g = (spend: string) => vi.spyOn(globalThis, 'fetch').mockResolvedValue(resp({ data: [{ campaign_id: '1', campaign_name: 'Oct', spend, account_currency: 'EGP', date_start: '2026-10-14' }] }) as never)
    g('100'); await syncMetaSpend(db, { config: cfg, today: '2026-10-15' })
    g('130'); const r = await syncMetaSpend(db, { config: cfg, today: '2026-10-15' })
    expect(r.ok).toBe(true)
    expect(store.size).toBe(1)
    expect([...store.values()][0].amount_egp).toBe(130)
    vi.restoreAllMocks()
  })
})
