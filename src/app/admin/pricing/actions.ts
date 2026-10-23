// src/app/admin/pricing/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { getEgpPerEur } from '@/lib/finance/fx'
import { normalizeDigits } from '@/lib/digits'
import { planReprice, planSetup } from '@/lib/repricing'
import {
  applyChanges, cleanSettings, loadProducts, loadSettings, parseApprovals, saveProductFlags, saveSettings, stillProposed, undoBatch,
} from '@/lib/pricing-service'

export interface PricingActionResult { ok: boolean; message: string }

function refresh() {
  for (const path of ['/', '/products', '/deals', '/admin/pricing', '/admin/products']) revalidatePath(path)
  revalidatePath('/products/[slug]', 'page')
}

const num = (v: FormDataEntryValue | null): number | null => {
  if (typeof v !== 'string' || v.trim() === '') return null
  const n = Number(normalizeDigits(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

export async function savePricingSettings(_prev: PricingActionResult | null, formData: FormData): Promise<PricingActionResult> {
  await assertAdmin()
  const settings = cleanSettings({
    autoApply: formData.get('autoApply') === 'on',
    thresholdPct: num(formData.get('thresholdPct')),
    maxChangePct: num(formData.get('maxChangePct')),
    allowLower: formData.get('allowLower') === 'on',
    minMarginPct: num(formData.get('minMarginPct')),
    targetMarginPct: num(formData.get('targetMarginPct')),
    landedFactor: num(formData.get('landedFactor')),
  })
  const r = await saveSettings(createAdminSupabaseClient(), settings, num(formData.get('manualRate')))
  if (r.ok) refresh()
  return r
}

/** Saves "follows the euro" and the cost (in EUR) of every product row of the table. */
export async function saveProductPricing(_prev: PricingActionResult | null, formData: FormData): Promise<PricingActionResult> {
  await assertAdmin()
  const ids = String(formData.get('ids') ?? '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0)
  if (ids.length === 0) return { ok: false, message: 'Nothing to save.' }
  const db = createAdminSupabaseClient()
  const state = await loadSettings(db)
  const { rate } = await getEgpPerEur(state.manualRate)
  const rows = ids.map((id) => ({ id, follows: formData.get(`follow_${id}`) === 'on', costEur: num(formData.get(`cost_${id}`)) }))
  const done = await saveProductFlags(db, rows, rate)
  refresh()
  return { ok: done === rows.length, message: done === rows.length ? `Saved ${done} products.` : `Saved ${done} of ${rows.length}. Did you run the pricing migration?` }
}

/** Applies the price changes you ticked. Only what a fresh calculation still proposes is applied. */
export async function approvePriceChanges(_prev: PricingActionResult | null, formData: FormData): Promise<PricingActionResult> {
  await assertAdmin()
  const approved = parseApprovals(formData.getAll('change'))
  if (approved.length === 0) return { ok: false, message: 'Tick at least one price change.' }
  const db = createAdminSupabaseClient()
  const state = await loadSettings(db)
  const { rate } = await getEgpPerEur(state.manualRate)
  if (!rate) return { ok: false, message: 'Could not read the EUR rate. Set a manual rate and try again.' }
  const live = await loadProducts(db)
  if (!live.ok) return { ok: false, message: live.message ?? 'Could not load products.' }
  const fresh = planReprice(live.products, rate, state.settings).changes.map((c) => ({ id: c.id, from: c.from, to: c.to }))
  const { ok, stale } = stillProposed(approved, fresh)
  const res = ok.length ? await applyChanges(db, ok, rate, 'approved by admin') : null
  refresh()
  const applied = res?.applied.length ?? 0
  const left = stale + (res?.skipped.length ?? 0)
  return { ok: applied > 0, message: `Updated ${applied} price${applied === 1 ? '' : 's'}.${left ? ` ${left} skipped because the rate or price moved. Reload to see the new proposal.` : ''} You can undo this under History.` }
}

/** First-time setup: the ticked products start following the euro at the proposed prices. */
export async function approveSetup(_prev: PricingActionResult | null, formData: FormData): Promise<PricingActionResult> {
  await assertAdmin()
  const approved = parseApprovals(formData.getAll('change'))
  const baseline = num(formData.get('baseline'))
  if (approved.length === 0) return { ok: false, message: 'Tick at least one product.' }
  if (!baseline || baseline <= 0) return { ok: false, message: 'Missing the starting rate.' }
  const db = createAdminSupabaseClient()
  const state = await loadSettings(db)
  const { rate } = await getEgpPerEur(state.manualRate)
  if (!rate) return { ok: false, message: 'Could not read the EUR rate. Set a manual rate and try again.' }
  const live = await loadProducts(db)
  if (!live.ok) return { ok: false, message: live.message ?? 'Could not load products.' }
  const fresh = planSetup(live.products, rate, baseline, state.settings).map((r) => ({ id: r.id, from: r.from, to: r.to }))
  const { ok, stale } = stillProposed(approved, fresh)
  const res = ok.length ? await applyChanges(db, ok, rate, 'first-time setup', { startFollowing: true }) : null
  refresh()
  const applied = res?.applied.length ?? 0
  const left = stale + (res?.skipped.length ?? 0)
  return { ok: applied > 0, message: `${applied} product${applied === 1 ? '' : 's'} now follow the euro.${left ? ` ${left} skipped because the rate or price moved. Reload to see the new table.` : ''} You can undo this under History.` }
}

export async function undoPriceBatch(_prev: PricingActionResult | null, formData: FormData): Promise<PricingActionResult> {
  await assertAdmin()
  const id = formData.get('batch_id')
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: 'Missing batch.' }
  const r = await undoBatch(createAdminSupabaseClient(), id)
  refresh()
  return { ok: r.restored > 0, message: `Restored ${r.restored} price${r.restored === 1 ? '' : 's'}.${r.skipped ? ` ${r.skipped} left alone because they were changed again since.` : ''}` }
}
