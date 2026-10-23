// src/lib/pricing-service.ts
// Server-side parts of the automatic EUR pricing. Every function takes the database client, so it can be tested.
// The rules themselves (rounding, margin, what to change) are in repricing.ts.
//
// Prices are only ever changed by applyChanges(), which writes a row to price_changes for every product it touches,
// so a whole run can be undone with undoBatch().

import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { escapeTelegramHtml } from '@/lib/telegram'
import { getEgpPerEur } from '@/lib/finance/fx'
import { DEFAULT_PRICING, describeMove, planReprice, type Plan, type PricingSettings, type RepriceProduct } from '@/lib/repricing'

type Db = SupabaseClient

const missing = (e: { code?: string; message?: string } | null) => !!e && (e.code === 'PGRST205' || e.code === '42P01' || e.code === '42703' || /pricing_settings|price_changes|follows_eur|column/.test(e.message ?? ''))

export type SettingsState = {
  ready: boolean
  settings: PricingSettings
  manualRate: number | null
  lastRate: number | null
  lastRunAt: string | null
  lastProposalSig: string | null
}

const n = (v: unknown, fallback: number) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? fallback : Number(v))
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Turns anything typed in the form into safe settings. */
export function cleanSettings(raw: Partial<Record<keyof PricingSettings, unknown>>): PricingSettings {
  const min = clamp(n(raw.minMarginPct, DEFAULT_PRICING.minMarginPct), 0, 60)
  return {
    autoApply: raw.autoApply === true,
    thresholdPct: clamp(n(raw.thresholdPct, DEFAULT_PRICING.thresholdPct), 0, 20),
    maxChangePct: clamp(n(raw.maxChangePct, DEFAULT_PRICING.maxChangePct), 1, 30),
    allowLower: raw.allowLower === true,
    minMarginPct: min,
    targetMarginPct: clamp(n(raw.targetMarginPct, DEFAULT_PRICING.targetMarginPct), min, 80),
    landedFactor: clamp(n(raw.landedFactor, DEFAULT_PRICING.landedFactor), 0.5, 3),
  }
}

export async function loadSettings(db: Db): Promise<SettingsState> {
  const { data, error } = await db.from('pricing_settings').select('*').eq('id', 1).maybeSingle()
  if (error || !data) {
    return { ready: !missing(error) && !error, settings: DEFAULT_PRICING, manualRate: null, lastRate: null, lastRunAt: null, lastProposalSig: null }
  }
  const r = data as Record<string, unknown>
  return {
    ready: true,
    settings: cleanSettings({
      autoApply: r.auto_apply, thresholdPct: r.threshold_pct, maxChangePct: r.max_change_pct, allowLower: r.allow_lower,
      minMarginPct: r.min_margin_pct, targetMarginPct: r.target_margin_pct, landedFactor: r.landed_factor,
    }),
    manualRate: r.manual_rate === null || r.manual_rate === undefined ? null : Number(r.manual_rate),
    lastRate: r.last_rate === null || r.last_rate === undefined ? null : Number(r.last_rate),
    lastRunAt: (r.last_run_at as string) ?? null,
    lastProposalSig: (r.last_proposal_sig as string) ?? null,
  }
}

export async function saveSettings(db: Db, s: PricingSettings, manualRate: number | null): Promise<{ ok: boolean; message: string }> {
  const row = {
    auto_apply: s.autoApply, threshold_pct: s.thresholdPct, max_change_pct: s.maxChangePct, allow_lower: s.allowLower,
    min_margin_pct: s.minMarginPct, target_margin_pct: s.targetMarginPct, landed_factor: s.landedFactor,
    manual_rate: manualRate !== null && manualRate > 0 ? manualRate : null, updated_at: new Date().toISOString(),
  }
  const { data, error } = await db.from('pricing_settings').update(row).eq('id', 1).select('id')
  if (error) return { ok: false, message: error.message }
  if (!data || (data as unknown[]).length === 0) {
    const ins = await db.from('pricing_settings').insert({ id: 1, ...row })
    if (ins.error) return { ok: false, message: ins.error.message }
  }
  return { ok: true, message: 'Settings saved.' }
}

export type LiveProduct = RepriceProduct & { slug: string | null; stock_quantity: number | null }

const COLUMNS = 'id, title, slug, price_egp, status, stock_quantity, follows_eur, price_anchor_egp, price_anchor_rate, original_price, cost_eur, cost_egp'

/** Products for sale (available or on hold). Sold items are never repriced. */
export async function loadProducts(db: Db): Promise<{ ok: boolean; products: LiveProduct[]; message?: string }> {
  const { data, error } = await db.from('products').select(COLUMNS).in('status', ['available', 'reserved']).order('price_egp', { ascending: false })
  if (error) return { ok: false, products: [], message: error.message }
  const products = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id), title: String(r.title ?? ''), slug: (r.slug as string) ?? null, status: (r.status as string) ?? null,
    price_egp: Number(r.price_egp), stock_quantity: r.stock_quantity === null || r.stock_quantity === undefined ? null : Number(r.stock_quantity),
    follows_eur: r.follows_eur === true,
    price_anchor_egp: r.price_anchor_egp === null || r.price_anchor_egp === undefined ? null : Number(r.price_anchor_egp),
    price_anchor_rate: r.price_anchor_rate === null || r.price_anchor_rate === undefined ? null : Number(r.price_anchor_rate),
    original_price: r.original_price === null || r.original_price === undefined ? null : Number(r.original_price),
    cost_eur: r.cost_eur === null || r.cost_eur === undefined ? null : Number(r.cost_eur),
    cost_egp: r.cost_egp === null || r.cost_egp === undefined ? null : Number(r.cost_egp),
  }))
  return { ok: true, products }
}

export type ApplyItem = { id: number; from: number; to: number }
export type ApplyResult = { batchId: string; applied: ApplyItem[]; skipped: { id: number; reason: string }[] }

/**
 * Writes new prices. A product is only changed if its price is still `from` (so what you approved is what is applied).
 * `startFollowing` is the first-time setup: the new price becomes the anchor at today's rate.
 */
export async function applyChanges(db: Db, items: ApplyItem[], rate: number, reason: string, opts: { startFollowing?: boolean } = {}): Promise<ApplyResult> {
  const batchId = randomUUID()
  const result: ApplyResult = { batchId, applied: [], skipped: [] }
  for (const it of items) {
    if (!(it.to > 0) || !Number.isFinite(it.to)) { result.skipped.push({ id: it.id, reason: 'invalid price' }); continue }
    const { data: cur, error: readErr } = await db.from('products').select('id, title, price_egp, follows_eur, price_anchor_egp, price_anchor_rate').eq('id', it.id).maybeSingle()
    if (readErr || !cur) { result.skipped.push({ id: it.id, reason: 'not found' }); continue }
    const row = cur as Record<string, unknown>
    if (Number(row.price_egp) !== it.from) { result.skipped.push({ id: it.id, reason: 'price changed since you looked' }); continue }

    const patch: Record<string, unknown> = { price_egp: it.to }
    if (opts.startFollowing) { patch.follows_eur = true; patch.price_anchor_egp = it.to; patch.price_anchor_rate = rate }
    const { data: hit, error } = await db.from('products').update(patch).eq('id', it.id).eq('price_egp', it.from).select('id')
    if (error || !hit || (hit as unknown[]).length === 0) { result.skipped.push({ id: it.id, reason: error?.message ?? 'price changed since you looked' }); continue }

    await db.from('price_changes').insert({
      batch_id: batchId, product_id: it.id, title: row.title ?? null, old_price: it.from, new_price: it.to,
      old_anchor_egp: row.price_anchor_egp ?? null, old_anchor_rate: row.price_anchor_rate ?? null, old_follows: row.follows_eur === true,
      rate, reason,
    })
    result.applied.push(it)
  }
  return result
}

/** Anchors followed products that had none. Changes no price. */
export async function applyAnchors(db: Db, anchors: { id: number; price: number; rate: number }[]): Promise<number> {
  let done = 0
  for (const a of anchors) {
    const { error } = await db.from('products').update({ price_anchor_egp: a.price, price_anchor_rate: a.rate }).eq('id', a.id).is('price_anchor_rate', null)
    if (!error) done++
  }
  return done
}

/** Puts every price of a batch back, unless that product's price was changed again since. */
export async function undoBatch(db: Db, batchId: string): Promise<{ restored: number; skipped: number }> {
  const { data } = await db.from('price_changes').select('*').eq('batch_id', batchId).is('undone_at', null)
  let restored = 0
  let skipped = 0
  for (const c of (data ?? []) as Record<string, unknown>[]) {
    const { data: hit } = await db.from('products').update({
      price_egp: Number(c.old_price), price_anchor_egp: c.old_anchor_egp ?? null, price_anchor_rate: c.old_anchor_rate ?? null, follows_eur: c.old_follows === true,
    }).eq('id', Number(c.product_id)).eq('price_egp', Number(c.new_price)).select('id')
    if (hit && (hit as unknown[]).length > 0) {
      restored++
      await db.from('price_changes').update({ undone_at: new Date().toISOString() }).eq('id', c.id)
    } else skipped++
  }
  return { restored, skipped }
}

export type BatchSummary = { batchId: string; createdAt: string; rate: number | null; reason: string | null; count: number; undone: boolean; sample: { title: string; from: number; to: number }[] }

export async function recentBatches(db: Db, limit = 8): Promise<BatchSummary[]> {
  const { data, error } = await db.from('price_changes').select('*').order('created_at', { ascending: false }).limit(400)
  if (error || !data) return []
  const byBatch = new Map<string, BatchSummary>()
  for (const r of data as Record<string, unknown>[]) {
    const id = String(r.batch_id)
    let b = byBatch.get(id)
    if (!b) {
      b = { batchId: id, createdAt: String(r.created_at), rate: r.rate === null || r.rate === undefined ? null : Number(r.rate), reason: (r.reason as string) ?? null, count: 0, undone: true, sample: [] }
      byBatch.set(id, b)
    }
    b.count++
    if (!r.undone_at) b.undone = false
    if (b.sample.length < 3) b.sample.push({ title: String(r.title ?? ''), from: Number(r.old_price), to: Number(r.new_price) })
  }
  return [...byBatch.values()].slice(0, limit)
}

export async function saveProductFlags(db: Db, rows: { id: number; follows: boolean; costEur: number | null }[], rate: number | null): Promise<number> {
  let done = 0
  for (const r of rows) {
    const patch: Record<string, unknown> = { follows_eur: r.follows, cost_eur: r.costEur !== null && r.costEur > 0 ? r.costEur : null }
    const { error } = await db.from('products').update(patch).eq('id', r.id)
    if (error) continue
    done++
    // switching "follows the euro" on anchors the product at today's price and rate
    if (r.follows && rate) {
      const { data: p } = await db.from('products').select('price_egp, price_anchor_rate').eq('id', r.id).maybeSingle()
      const row = p as { price_egp?: number; price_anchor_rate?: number | null } | null
      if (row && (row.price_anchor_rate === null || row.price_anchor_rate === undefined)) {
        await db.from('products').update({ price_anchor_egp: row.price_egp, price_anchor_rate: rate }).eq('id', r.id)
      }
    }
  }
  return done
}

const egp = (v: number) => `${v.toLocaleString('en-US')} EGP`

export type DailySummary = {
  ok: boolean
  skipped?: string
  rate?: number
  followed?: number
  anchored?: number
  changed?: number
  proposed?: number
  lowMargin?: number
  error?: string
}

/** The weekly job: works out the plan, then either applies it (auto-apply on) or tells you it is waiting for approval. */
export async function runDaily(db: Db, deps: { notify: (html: string) => Promise<unknown>; fetchImpl?: Parameters<typeof getEgpPerEur>[1] } ): Promise<DailySummary> {
  const state = await loadSettings(db)
  if (!state.ready) return { ok: true, skipped: 'Run the pricing migration first (supabase/migrations/20261026_01_repricing.sql).' }
  const live = await loadProducts(db)
  if (!live.ok) return { ok: true, skipped: 'Run the pricing migration first (supabase/migrations/20261026_01_repricing.sql).' }

  const followed = live.products.filter((p) => p.follows_eur)
  if (followed.length === 0) return { ok: true, skipped: 'No product follows the euro yet.', followed: 0 }

  const { rate } = await getEgpPerEur(state.manualRate, deps.fetchImpl)
  if (!rate) return { ok: false, error: 'Could not read the EUR rate (set a manual rate on Admin > Pricing to keep prices moving).' }

  const plan = planReprice(live.products, rate, state.settings)
  const anchored = await applyAnchors(db, plan.anchors)
  const summary: DailySummary = { ok: true, rate, followed: followed.length, anchored, lowMargin: plan.lowMargin.length }
  const now = new Date().toISOString()
  const sig = plan.changes.map((c) => `${c.id}:${c.to}`).join(',')

  if (plan.changes.length > 0 && state.settings.autoApply) {
    const res = await applyChanges(db, plan.changes.map((c) => ({ id: c.id, from: c.from, to: c.to })), rate, 'weekly auto run')
    summary.changed = res.applied.length
    await db.from('pricing_settings').update({ last_rate: rate, last_run_at: now, last_proposal_sig: '' }).eq('id', 1)
    if (res.applied.length > 0) await deps.notify(changesMessage('Prices updated', state.lastRate, rate, plan, res.applied.length, false))
    return summary
  }

  summary.proposed = plan.changes.length
  await db.from('pricing_settings').update({ last_rate: rate, last_run_at: now, last_proposal_sig: sig }).eq('id', 1)
  // tell you once per distinct proposal, not every week
  if (plan.changes.length > 0 && sig !== (state.lastProposalSig ?? '')) await deps.notify(changesMessage('Price changes waiting for your approval', state.lastRate, rate, plan, plan.changes.length, true))
  return summary
}

function changesMessage(title: string, fromRate: number | null, rate: number, plan: Plan, count: number, needsApproval: boolean): string {
  const top = plan.changes.slice(0, 6).map((c) => `• ${escapeTelegramHtml(c.title.slice(0, 40))}: ${egp(c.from)} → ${egp(c.to)} (${c.changePct >= 0 ? '+' : ''}${c.changePct}%)`).join('\n')
  const more = plan.changes.length > 6 ? `\n…and ${plan.changes.length - 6} more` : ''
  const low = plan.lowMargin.length > 0 ? `\n⚠️ ${plan.lowMargin.length} item(s) are below your target margin.` : ''
  const tail = needsApproval ? '\nReview and approve: Admin > Pricing' : '\nUndo any time: Admin > Pricing > History'
  return `💶 <b>${escapeTelegramHtml(title)}</b> (${count})\n${escapeTelegramHtml(describeMove(fromRate, rate))}\n${top}${more}${low}${tail}`
}

/** "id:from:to" strings from the approval checkboxes. Anything malformed is dropped. */
export function parseApprovals(values: unknown[]): ApplyItem[] {
  const out: ApplyItem[] = []
  const seen = new Set<number>()
  for (const v of values) {
    if (typeof v !== 'string') continue
    const m = /^(\d+):(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(v)
    if (!m) continue
    const item = { id: Number(m[1]), from: Number(m[2]), to: Number(m[3]) }
    if (!(item.to > 0) || seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}

/** Keeps only what you approved AND what a fresh calculation still proposes (the rate may have moved since you looked). */
export function stillProposed(approved: ApplyItem[], fresh: ApplyItem[]): { ok: ApplyItem[]; stale: number } {
  const byId = new Map(fresh.map((f) => [f.id, f]))
  const ok = approved.filter((a) => { const f = byId.get(a.id); return !!f && f.from === a.from && f.to === a.to })
  return { ok, stale: approved.length - ok.length }
}
