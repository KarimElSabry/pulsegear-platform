// src/app/admin/tax/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { normalizeDigits } from '@/lib/digits'
import { cleanSettings, saveSettings, setMerchantTreatment, setReceipt } from '@/lib/tax/service'
import { changeDecision, confirmAllSuggested, decideMatch, importStatement, runMatching } from '@/lib/tax/bank-service'

export interface TaxActionResult { ok: boolean; message: string }

const MAX_FILE_BYTES = 3_500_000

const BANKS = ['auto', 'cib', 'qnb', 'other'] as const

/** Revolut CSV, CIB or QNB statement (PDF or CSV). Finds out which it is, proves it was read completely and looks for matches. */
export async function importStatementFile(_prev: TaxActionResult | null, formData: FormData): Promise<TaxActionResult> {
  await assertAdmin()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'Choose a statement file first (PDF or CSV).' }
  if (file.size > MAX_FILE_BYTES) return { ok: false, message: 'The file is too large. Export a shorter period (for example one quarter).' }
  const hintRaw = String(formData.get('bank') ?? 'auto')
  const hint = (BANKS as readonly string[]).includes(hintRaw) ? (hintRaw as (typeof BANKS)[number]) : 'auto'
  const db = createAdminSupabaseClient()
  const r = await importStatement(db, { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }, hint)

  if (r.kind === 'revolut') {
    const x = r.result
    if (!x.ok) return { ok: false, message: x.message }
    const m = x.added > 0 ? await runMatching(db) : null
    revalidatePath('/admin/tax')
    const skipped = x.parse ? x.parse.skipped.notCompleted : 0
    return { ok: true, message: [
      `Revolut: ${x.added} new transaction${x.added === 1 ? '' : 's'} added`,
      x.alreadyThere ? `${x.alreadyThere} were already imported` : '',
      `${x.autoInternal} sorted automatically as moves between your own pockets`,
      x.autoByRule ? `${x.autoByRule} sorted by your earlier choices` : '',
      `${x.needReview} need your decision`,
      skipped ? `${skipped} cancelled/pending lines ignored` : '',
      m?.ok && m.autoConfirmed ? `${m.autoConfirmed} match(es) confirmed automatically` : '',
      x.parse && x.parse.balanceBreaks > 0 ? `WARNING: the balance does not add up in ${x.parse.balanceBreaks} place(s). The file may be incomplete, so check it.` : '',
    ].filter(Boolean).join('. ') + '.' }
  }

  if (!r.ok) return { ok: false, message: r.message }
  const m = r.added > 0 ? await runMatching(db) : null
  revalidatePath('/admin/tax')
  const bad = r.statements.filter((x) => !x.verified)
  const parts = [
    `${r.bank.toUpperCase()}: ${r.added} new transaction${r.added === 1 ? '' : 's'} added`,
    r.alreadyThere ? `${r.alreadyThere} were already imported` : '',
    `${r.statements.length - bad.length} of ${r.statements.length} statement(s) proven complete`,
    m?.ok ? `${m.exchanges} exchange match(es) and ${m.payments} customer payment match(es) found, ${m.autoConfirmed} confirmed automatically` : '',
    bad.length ? `WARNING: ${bad.length} statement(s) could NOT be proven complete (see the table below). Compare with your bank before relying on them.` : '',
  ].filter(Boolean)
  return { ok: bad.length === 0, message: parts.join('. ') + '.' }
}

export async function findMatchesAction(_prev: TaxActionResult | null, _formData: FormData): Promise<TaxActionResult> {
  await assertAdmin()
  const r = await runMatching(createAdminSupabaseClient())
  if (!r.ok) return { ok: false, message: r.message }
  revalidatePath('/admin/tax')
  return { ok: true, message: `${r.exchanges} exchange and ${r.payments} customer payment suggestion(s); ${r.autoConfirmed} confirmed automatically.` }
}

export async function decideMatchAction(formData: FormData): Promise<void> {
  await assertAdmin()
  const decision = formData.get('decision')
  if (decision !== 'confirmed' && decision !== 'rejected') return
  await decideMatch(createAdminSupabaseClient(), String(formData.get('match_id') ?? ''), decision)
  revalidatePath('/admin/tax')
  revalidatePath('/admin/orders')
}

export async function confirmAllMatchesAction(): Promise<void> {
  await assertAdmin()
  await confirmAllSuggested(createAdminSupabaseClient())
  revalidatePath('/admin/tax')
  revalidatePath('/admin/orders')
}

export async function changeDecisionAction(formData: FormData): Promise<void> {
  await assertAdmin()
  const treatment = formData.get('treatment')
  if (treatment !== 'business' && treatment !== 'personal' && treatment !== 'unreviewed') return
  await changeDecision(createAdminSupabaseClient(), String(formData.get('key') ?? ''), treatment)
  revalidatePath('/admin/tax')
}

export async function decideMerchant(formData: FormData): Promise<void> {
  await assertAdmin()
  const key = String(formData.get('key') ?? '')
  const treatment = formData.get('treatment')
  if (treatment !== 'business' && treatment !== 'personal') return
  await setMerchantTreatment(createAdminSupabaseClient(), key, treatment)
  revalidatePath('/admin/tax')
}

export async function toggleReceipt(formData: FormData): Promise<void> {
  await assertAdmin()
  const note = String(formData.get('note') ?? '').trim()
  await setReceipt(createAdminSupabaseClient(), String(formData.get('id') ?? ''), formData.get('has') === '1', note || null)
  revalidatePath('/admin/tax')
}

export async function saveTaxSettings(_prev: TaxActionResult | null, formData: FormData): Promise<TaxActionResult> {
  await assertAdmin()
  const n = (k: string) => normalizeDigits(String(formData.get(k) ?? '')).replace(/,/g, '')
  const r = await saveSettings(createAdminSupabaseClient(), cleanSettings({
    ownerName: formData.get('ownerName'),
    salaryTaxableEur: n('salaryTaxableEur'),
    hebesatzPct: n('hebesatzPct'),
    priorYearTurnover: n('priorYearTurnover'),
  }))
  if (r.ok) revalidatePath('/admin/tax')
  return r
}
