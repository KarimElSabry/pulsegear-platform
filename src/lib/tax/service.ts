// src/lib/tax/service.ts
// Server-only database access for the tax tracker. Tolerant of a missing migration (reports it instead of crashing).

import type { SupabaseClient } from '@supabase/supabase-js'
import { initialTreatment } from './classify'
import { parseRevolut, type RevolutParse } from './revolut'
import { DEFAULT_TAX_SETTINGS, type LedgerTx, type TaxSettings, type Treatment } from './types'

type Row = Record<string, unknown>
const CHUNK = 200

const num = (v: unknown, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback }

export function mapLedger(r: Row): LedgerTx {
  return {
    id: String(r.id),
    txHash: String(r.tx_hash),
    source: String(r.source ?? 'revolut'),
    date: String(r.tx_date).slice(0, 10),
    amount: num(r.amount),
    fee: num(r.fee),
    currency: String(r.currency ?? 'EUR'),
    description: String(r.description ?? ''),
    merchantKey: String(r.merchant_key ?? ''),
    txType: String(r.tx_type ?? ''),
    bank: (r.bank as string) ?? null,
    account: (r.account as string) ?? null,
    reference: (r.reference as string) ?? null,
    counterpartyName: (r.counterparty_name as string) ?? null,
    counterpartyPhone: (r.counterparty_phone as string) ?? null,
    lineKind: (r.line_kind as string) ?? null,
    treatment: (['unreviewed', 'business', 'personal', 'internal'].includes(String(r.treatment)) ? r.treatment : 'unreviewed') as Treatment,
    hasReceipt: r.has_receipt === true,
    note: typeof r.note === 'string' && r.note !== '' ? r.note : null,
  }
}

export async function loadSettings(db: SupabaseClient): Promise<{ ready: boolean; settings: TaxSettings }> {
  const { data, error } = await db.from('tax_settings').select('*').eq('id', 1).maybeSingle()
  if (error) return { ready: false, settings: DEFAULT_TAX_SETTINGS }
  const r = (data ?? {}) as Row
  return {
    ready: true,
    settings: {
      ownerName: typeof r.owner_name === 'string' ? r.owner_name : '',
      salaryTaxableEur: num(r.salary_taxable_eur),
      hebesatzPct: num(r.hebesatz_pct, DEFAULT_TAX_SETTINGS.hebesatzPct),
      priorYearTurnover: num(r.prior_year_turnover),
    },
  }
}

export function cleanSettings(raw: Partial<Record<keyof TaxSettings, unknown>>): TaxSettings {
  const nn = (v: unknown, max: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0 }
  const heb = Number(raw.hebesatzPct)
  return {
    ownerName: String(raw.ownerName ?? '').trim().slice(0, 120),
    salaryTaxableEur: nn(raw.salaryTaxableEur, 10_000_000),
    hebesatzPct: Number.isFinite(heb) && heb >= 200 && heb <= 1000 ? heb : DEFAULT_TAX_SETTINGS.hebesatzPct,
    priorYearTurnover: nn(raw.priorYearTurnover, 100_000_000),
  }
}

export async function saveSettings(db: SupabaseClient, s: TaxSettings): Promise<{ ok: boolean; message: string }> {
  const { error } = await db.from('tax_settings').upsert({
    id: 1, owner_name: s.ownerName, salary_taxable_eur: s.salaryTaxableEur, hebesatz_pct: s.hebesatzPct,
    prior_year_turnover: s.priorYearTurnover, updated_at: new Date().toISOString(),
  })
  return error ? { ok: false, message: `Could not save: ${error.message}` } : { ok: true, message: 'Saved.' }
}

export async function loadRules(db: SupabaseClient): Promise<Map<string, Exclude<Treatment, 'unreviewed'>>> {
  const { data } = await db.from('merchant_rules').select('merchant_key, treatment')
  const m = new Map<string, Exclude<Treatment, 'unreviewed'>>()
  for (const r of (data ?? []) as Row[]) m.set(String(r.merchant_key), r.treatment as Exclude<Treatment, 'unreviewed'>)
  return m
}

export async function loadLedger(db: SupabaseClient): Promise<{ ok: true; txs: LedgerTx[] } | { ok: false }> {
  const txs: LedgerTx[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('bank_transactions').select('*').order('tx_date', { ascending: true }).range(from, from + 999)
    if (error) return { ok: false }
    const rows = (data ?? []) as Row[]
    txs.push(...rows.map(mapLedger))
    if (rows.length < 1000) break
  }
  return { ok: true, txs }
}

export interface ImportResult {
  ok: boolean
  message: string
  added: number
  alreadyThere: number
  autoInternal: number
  autoByRule: number
  needReview: number
  parse: RevolutParse | null
}

const fail = (message: string, parse: RevolutParse | null = null): ImportResult =>
  ({ ok: false, message, added: 0, alreadyThere: 0, autoInternal: 0, autoByRule: 0, needReview: 0, parse })

export async function importRevolut(db: SupabaseClient, text: string): Promise<ImportResult> {
  const parse = parseRevolut(text)
  if (parse.problems.length) return fail(parse.problems[0], parse)
  if (parse.transactions.length === 0) return fail('The file has no completed transactions.', parse)

  const { ready, settings } = await loadSettings(db)
  if (!ready) return fail('Run supabase/migrations/20261101_01_tax_tracker.sql in the Supabase SQL editor first.', parse)
  const rules = await loadRules(db)

  const existing = new Set<string>()
  for (let i = 0; i < parse.transactions.length; i += CHUNK) {
    const hashes = parse.transactions.slice(i, i + CHUNK).map((t) => t.txHash)
    const { data, error } = await db.from('bank_transactions').select('tx_hash').in('tx_hash', hashes)
    if (error) return fail(`Could not check existing transactions: ${error.message}`, parse)
    for (const r of (data ?? []) as Row[]) existing.add(String(r.tx_hash))
  }

  const fresh = parse.transactions.filter((t) => !existing.has(t.txHash))
  const rows = fresh.map((t) => ({
    tx_hash: t.txHash, source: t.source, tx_date: t.date, amount: t.amount, fee: t.fee, currency: t.currency,
    description: t.description, merchant_key: t.merchantKey, tx_type: t.txType,
    treatment: initialTreatment(t, settings.ownerName, rules),
  }))
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await db.from('bank_transactions').upsert(rows.slice(i, i + CHUNK), { onConflict: 'tx_hash', ignoreDuplicates: true })
    if (error) return fail(`Could not save the transactions: ${error.message}`, parse)
  }

  const internal = rows.filter((r) => r.treatment === 'internal').length
  const byRule = rows.filter((r) => r.treatment === 'business' || r.treatment === 'personal').length
  return {
    ok: true,
    message: '',
    added: rows.length,
    alreadyThere: existing.size,
    autoInternal: internal,
    autoByRule: byRule,
    needReview: rows.length - internal - byRule,
    parse,
  }
}

/** One decision per merchant/person: remembered for the future and applied to every non-internal line with that key. */
export async function setMerchantTreatment(db: SupabaseClient, key: string, treatment: 'business' | 'personal'): Promise<{ ok: boolean; message: string }> {
  if (!/^(in|out):.+/.test(key) || key.length > 200) return { ok: false, message: 'Unknown merchant.' }
  const { error: e1 } = await db.from('merchant_rules').upsert({ merchant_key: key, treatment, updated_at: new Date().toISOString() })
  if (e1) return { ok: false, message: `Could not save: ${e1.message}` }
  const { error: e2 } = await db.from('bank_transactions').update({ treatment }).eq('merchant_key', key).neq('treatment', 'internal')
  return e2 ? { ok: false, message: `Could not update: ${e2.message}` } : { ok: true, message: 'Saved.' }
}

export async function setReceipt(db: SupabaseClient, id: string, hasReceipt: boolean, note: string | null): Promise<{ ok: boolean; message: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: 'Unknown transaction.' }
  const { error } = await db.from('bank_transactions').update({ has_receipt: hasReceipt, note: note ? note.slice(0, 300) : null }).eq('id', id)
  return error ? { ok: false, message: `Could not save: ${error.message}` } : { ok: true, message: 'Saved.' }
}
