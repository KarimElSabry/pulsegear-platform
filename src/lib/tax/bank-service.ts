// src/lib/tax/bank-service.ts
// Server only. Importing CIB / QNB / Revolut statements, remembering the proof that each was read completely, and finding matches.

import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isRevolutCsv, parseBankCsvAuto, parseBankPdfLines } from '@/lib/bank'
import { matchExchanges, matchPayments, type MatchTx, type OrderRef } from '@/lib/bank/match'
import { pdfToLines } from '@/lib/bank/pdf-text'
import type { BankId, ParsedStatement, ParsedTx, StatementInfo } from '@/lib/bank/types'
import { normalizeEgPhone } from '@/lib/bank/dates'
import { depositFor } from '@/lib/payment-details'
import { ruleKey } from './revolut'
import { importRevolut, loadLedger, loadRules, loadSettings, type ImportResult } from './service'
import type { LedgerTx, Treatment } from './types'

type Row = Record<string, unknown>
const CHUNK = 200
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

/** Name used to group the same person or shop: the payer/payee if the bank shows one, else the phone, else the first words. */
export function bankLabel(t: ParsedTx): string {
  if (t.counterpartyName) return t.counterpartyName
  if (t.counterpartyPhone) return t.counterpartyPhone
  return t.description.replace(/\bFT[0-9A-Z]{8,12}(\\[A-Z0-9]+)?/g, '').replace(/[-–]\s*\d{10,}/g, '').split(/\s+/).slice(0, 4).join(' ')
}

export function bankTxHashes(txs: ParsedTx[]): string[] {
  const seen = new Map<string, number>()
  return txs.map((t) => {
    const base = [t.bank, t.account, t.date, t.reference ?? '', t.amount, t.description.slice(0, 60)].join('|')
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return createHash('sha1').update(`${base}|${n}`).digest('hex')
  })
}

export type StatementImport =
  | { kind: 'revolut'; result: ImportResult }
  | { kind: 'bank'; ok: boolean; message: string; bank: string; added: number; alreadyThere: number; statements: StatementInfo[]; problems: string[] }

const failBank = (message: string, bank = 'other', problems: string[] = []): StatementImport =>
  ({ kind: 'bank', ok: false, message, bank, added: 0, alreadyThere: 0, statements: [], problems })

export async function importStatement(db: SupabaseClient, file: { name: string; bytes: Uint8Array }, hint: BankId | 'auto'): Promise<StatementImport> {
  const isPdf = /\.pdf$/i.test(file.name) || (file.bytes[0] === 0x25 && file.bytes[1] === 0x50 && file.bytes[2] === 0x44 && file.bytes[3] === 0x46)
  let source: string
  let parsed: ParsedStatement
  if (isPdf) {
    let lines
    try { lines = await pdfToLines(file.bytes) } catch { return failBank('This PDF could not be opened. Download the statement again, or export it as CSV.') }
    if (lines.length === 0) return failBank('This PDF has no readable text (it may be a scan). Export the statement as CSV or Excel from online banking.')
    const r = parseBankPdfLines(lines, hint)
    source = r.source; parsed = r.result
  } else {
    const text = new TextDecoder('utf-8').decode(file.bytes)
    if (isRevolutCsv(text)) return { kind: 'revolut', result: await importRevolut(db, text) }
    const r = parseBankCsvAuto(text, hint)
    if (!r.result) return failBank('Could not read this file.')
    source = r.source; parsed = r.result
  }
  if (parsed.transactions.length === 0) return failBank(parsed.problems[0] ?? 'No transactions found in this file.', source, parsed.problems)

  const { ready, settings } = await loadSettings(db)
  if (!ready) return failBank('Run supabase/migrations/20261101_01_tax_tracker.sql, then 20261105_01_bank_matching.sql in the Supabase SQL editor first.', source)
  const rules = await loadRules(db)

  const txs = parsed.transactions
  const hashes = bankTxHashes(txs)
  const existing = new Set<string>()
  for (let i = 0; i < hashes.length; i += CHUNK) {
    const { data, error } = await db.from('bank_transactions').select('tx_hash').in('tx_hash', hashes.slice(i, i + CHUNK))
    if (error) return failBank(`Could not check existing transactions: ${error.message}`, source)
    for (const r of (data ?? []) as Row[]) existing.add(String(r.tx_hash))
  }
  const rows = txs.map((t, i) => ({ t, hash: hashes[i] })).filter((x) => !existing.has(x.hash)).map(({ t, hash }) => {
    const key = ruleKey(bankLabel(t), t.amount)
    const owner = settings.ownerName.trim().toLowerCase()
    const internal = !!owner && !!t.counterpartyName && t.counterpartyName.toLowerCase() === owner
    return {
      tx_hash: hash, source: t.bank, bank: t.bank, account: t.account, tx_date: t.date, amount: t.amount, fee: 0, currency: t.currency,
      description: t.description.slice(0, 500), merchant_key: key, tx_type: t.kind, reference: t.reference, counterparty_name: t.counterpartyName,
      counterparty_phone: t.counterpartyPhone, balance: t.balance, line_kind: t.kind,
      treatment: internal ? 'internal' : rules.get(key) ?? 'unreviewed',
    }
  })
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await db.from('bank_transactions').upsert(rows.slice(i, i + CHUNK), { onConflict: 'tx_hash', ignoreDuplicates: true })
    if (error) return failBank(`Could not save the transactions: ${error.message}. If it mentions a column, run 20261105_01_bank_matching.sql.`, source)
  }
  for (const s of parsed.statements) {
    await db.from('statement_imports').upsert({
      bank: s.bank, account: s.account, currency: s.currency, period_from: s.from, period_to: s.to, opening: s.opening, closing: s.closing,
      bank_debit_count: s.debitCount, bank_debit_total: s.debitTotal, bank_credit_count: s.creditCount, bank_credit_total: s.creditTotal,
      read_debit_count: s.readDebitCount, read_debit_total: s.readDebitTotal, read_credit_count: s.readCreditCount, read_credit_total: s.readCreditTotal,
      verified: s.verified, note: s.note, file_name: file.name.slice(0, 200),
    }, { onConflict: 'bank,account,period_from,period_to' })
  }
  return { kind: 'bank', ok: true, message: '', bank: source, added: rows.length, alreadyThere: existing.size, statements: parsed.statements, problems: parsed.problems }
}

export interface StatementRow { id: string; bank: string; account: string; currency: string; from: string | null; to: string | null; opening: number | null; closing: number | null; bankDebit: [number | null, number | null]; bankCredit: [number | null, number | null]; readDebit: [number, number]; readCredit: [number, number]; verified: boolean; note: string; fileName: string | null }

export async function loadStatements(db: SupabaseClient): Promise<StatementRow[]> {
  const { data, error } = await db.from('statement_imports').select('*').order('period_to', { ascending: true })
  if (error) return []
  return ((data ?? []) as Row[]).map((r) => ({
    id: String(r.id), bank: String(r.bank), account: String(r.account), currency: String(r.currency),
    from: (r.period_from as string) ?? null, to: (r.period_to as string) ?? null,
    opening: r.opening === null ? null : num(r.opening), closing: r.closing === null ? null : num(r.closing),
    bankDebit: [r.bank_debit_count === null ? null : num(r.bank_debit_count), r.bank_debit_total === null ? null : num(r.bank_debit_total)],
    bankCredit: [r.bank_credit_count === null ? null : num(r.bank_credit_count), r.bank_credit_total === null ? null : num(r.bank_credit_total)],
    readDebit: [num(r.read_debit_count), num(r.read_debit_total)], readCredit: [num(r.read_credit_count), num(r.read_credit_total)],
    verified: r.verified === true, note: String(r.note ?? ''), fileName: (r.file_name as string) ?? null,
  }))
}

// ── matches ───────────────────────────────────────────────────────────────────────────

export interface MatchRow {
  id: string; kind: 'exchange' | 'payment'; status: 'suggested' | 'confirmed' | 'rejected'; auto: boolean; score: number
  egpTxId: string; eurTxId: string | null; checkoutId: string | null; dealId: string | null; expected: string | null; rate: number | null
}

export async function loadMatches(db: SupabaseClient): Promise<MatchRow[]> {
  const { data, error } = await db.from('tx_matches').select('*').order('created_at', { ascending: true })
  if (error) return []
  return ((data ?? []) as Row[]).map((r) => ({
    id: String(r.id), kind: r.kind as MatchRow['kind'], status: r.status as MatchRow['status'], auto: r.auto === true, score: num(r.score),
    egpTxId: String(r.egp_tx_id), eurTxId: (r.eur_tx_id as string) ?? null, checkoutId: (r.checkout_id as string) ?? null, dealId: (r.deal_id as string) ?? null,
    expected: (r.expected as string) ?? null, rate: r.rate === null || r.rate === undefined ? null : num(r.rate),
  }))
}

const asMatchTx = (t: LedgerTx): MatchTx => ({
  id: t.id, date: t.date, amount: t.amount, currency: t.currency, description: t.description,
  counterpartyName: t.counterpartyName ?? null, counterpartyPhone: t.counterpartyPhone ?? null,
  kind: t.currency === 'EUR' ? (/^top-up by/i.test(t.description) ? 'topup' : t.txType) : (t.lineKind ?? t.txType), treatment: t.treatment,
})

export async function loadOrderRefs(db: SupabaseClient): Promise<OrderRef[]> {
  const refs: OrderRef[] = []
  const { data: orders } = await db.from('checkout_orders').select('id, code, customer_name, phone, total_egp, created_at, status').in('status', ['pending', 'approved'])
  const ids = ((orders ?? []) as Row[]).map((o) => String(o.id))
  const phonesBy = new Map<string, string[]>()
  if (ids.length) {
    const { data: receipts } = await db.from('payment_receipts').select('checkout_id, payer_phone').in('checkout_id', ids)
    for (const r of (receipts ?? []) as Row[]) { const p = normalizeEgPhone(r.payer_phone as string); if (p) phonesBy.set(String(r.checkout_id), [...(phonesBy.get(String(r.checkout_id)) ?? []), p]) }
  }
  for (const o of (orders ?? []) as Row[]) {
    const own = normalizeEgPhone(o.phone as string)
    refs.push({ kind: 'checkout', id: String(o.id), code: String(o.code), customer: String(o.customer_name), phones: [...(own ? [own] : []), ...(phonesBy.get(String(o.id)) ?? [])],
      total: num(o.total_egp), deposit: depositFor(num(o.total_egp)), createdAt: String(o.created_at) })
  }
  const { data: deals } = await db.from('deals').select('id, customer_name, phone, selling_price_egp, deposit_amount_egp, created_at, status, checkout_id, order_code').neq('status', 'cancelled')
  for (const d of (deals ?? []) as Row[]) {
    if (d.checkout_id) continue
    const p = normalizeEgPhone(d.phone as string)
    refs.push({ kind: 'deal', id: String(d.id), code: (d.order_code as string) ?? null, customer: String(d.customer_name ?? ''), phones: p ? [p] : [],
      total: num(d.selling_price_egp), deposit: num(d.deposit_amount_egp) || depositFor(num(d.selling_price_egp)), createdAt: String(d.created_at) })
  }
  return refs
}

/** Looks at everything not yet decided and (re)creates suggestions. Confirmed and rejected matches are never touched. */
export async function runMatching(db: SupabaseClient): Promise<{ ok: boolean; message: string; exchanges: number; payments: number; autoConfirmed: number }> {
  const ledger = await loadLedger(db)
  if (!ledger.ok) return { ok: false, message: 'The tax tables are not set up yet.', exchanges: 0, payments: 0, autoConfirmed: 0 }
  const existing = await loadMatches(db)
  const decided = existing.filter((m) => m.status !== 'suggested')
  const takenEgp = new Set(decided.map((m) => m.egpTxId))
  const takenEur = new Set(decided.map((m) => m.eurTxId).filter((x): x is string => !!x))
  const rejectedPairs = new Set(existing.filter((m) => m.status === 'rejected' && m.eurTxId).map((m) => `${m.egpTxId}|${m.eurTxId}`))

  const txs = ledger.txs.filter((t) => t.treatment !== 'internal' || t.currency === 'EGP')
  const egpOut = txs.filter((t) => t.currency === 'EGP' && t.amount < 0 && (t.lineKind === 'ipn_out' || t.lineKind === 'transfer') && !takenEgp.has(t.id)).map(asMatchTx)
  const eurIn = txs.filter((t) => t.currency === 'EUR' && t.amount > 0 && /^(Transfer from|Payment from|Top-up by)/i.test(t.description) && t.treatment !== 'personal' && !takenEur.has(t.id)).map(asMatchTx)
  const exchanges = matchExchanges(egpOut, eurIn).filter((m) => !rejectedPairs.has(`${m.egpId}|${m.eurId}`))

  const credits = ledger.txs.filter((t) => t.currency === 'EGP' && t.amount > 0 && !takenEgp.has(t.id)).map(asMatchTx)
  const payments = matchPayments(credits, await loadOrderRefs(db))

  await db.from('tx_matches').delete().eq('status', 'suggested')
  const rows = [
    ...exchanges.map((m) => ({ kind: 'exchange', egp_tx_id: m.egpId, eur_tx_id: m.eurId, rate: m.rate, score: m.score, status: m.confident ? 'confirmed' : 'suggested', auto: m.confident })),
    ...payments.map((m) => ({ kind: 'payment', egp_tx_id: m.txId, checkout_id: m.order.kind === 'checkout' ? m.order.id : null, deal_id: m.order.kind === 'deal' ? m.order.id : null, expected: m.expected, score: m.score, status: m.confident ? 'confirmed' : 'suggested', auto: m.confident })),
  ]
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await db.from('tx_matches').upsert(rows.slice(i, i + CHUNK), { onConflict: 'kind,egp_tx_id', ignoreDuplicates: true })
    if (error) return { ok: false, message: `Could not save matches: ${error.message}. Run 20261105_01_bank_matching.sql.`, exchanges: 0, payments: 0, autoConfirmed: 0 }
  }
  const auto = rows.filter((r) => r.status === 'confirmed')
  await applyConfirmedEffects(db, auto.map((r) => ({ kind: r.kind as 'exchange' | 'payment', egpTxId: r.egp_tx_id })))
  return { ok: true, message: '', exchanges: exchanges.length, payments: payments.length, autoConfirmed: auto.length }
}

/** A confirmed exchange is a conversion, not a cost (EGP line becomes "internal"); a confirmed customer payment is business income. */
export async function applyConfirmedEffects(db: SupabaseClient, items: { kind: 'exchange' | 'payment'; egpTxId: string }[]) {
  const ex = items.filter((i) => i.kind === 'exchange').map((i) => i.egpTxId)
  const pay = items.filter((i) => i.kind === 'payment').map((i) => i.egpTxId)
  if (ex.length) await db.from('bank_transactions').update({ treatment: 'internal' }).in('id', ex).eq('treatment', 'unreviewed')
  if (pay.length) await db.from('bank_transactions').update({ treatment: 'business' }).in('id', pay).eq('treatment', 'unreviewed')
}

export async function decideMatch(db: SupabaseClient, id: string, status: 'confirmed' | 'rejected'): Promise<{ ok: boolean; message: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: 'Unknown match.' }
  const { data } = await db.from('tx_matches').update({ status, auto: false }).eq('id', id).neq('status', status).select('kind, egp_tx_id')
  if (!data || data.length !== 1) return { ok: false, message: 'This match was already decided.' }
  if (status === 'confirmed') await applyConfirmedEffects(db, [{ kind: (data[0] as Row).kind as 'exchange' | 'payment', egpTxId: String((data[0] as Row).egp_tx_id) }])
  return { ok: true, message: 'Saved.' }
}

export async function confirmAllSuggested(db: SupabaseClient): Promise<number> {
  const { data } = await db.from('tx_matches').update({ status: 'confirmed' }).eq('status', 'suggested').select('kind, egp_tx_id')
  const rows = (data ?? []) as Row[]
  await applyConfirmedEffects(db, rows.map((r) => ({ kind: r.kind as 'exchange' | 'payment', egpTxId: String(r.egp_tx_id) })))
  return rows.length
}

/** Change an earlier business/private decision for one shop or person: all its lines move and the rule is updated. */
export async function changeDecision(db: SupabaseClient, key: string, treatment: Exclude<Treatment, 'unreviewed' | 'internal'> | 'unreviewed'): Promise<{ ok: boolean; message: string }> {
  if (!/^(in|out):.+/.test(key) || key.length > 200) return { ok: false, message: 'Unknown merchant.' }
  if (treatment === 'unreviewed') {
    await db.from('merchant_rules').delete().eq('merchant_key', key)
  } else {
    const { error } = await db.from('merchant_rules').upsert({ merchant_key: key, treatment, updated_at: new Date().toISOString() })
    if (error) return { ok: false, message: `Could not save: ${error.message}` }
  }
  const { error } = await db.from('bank_transactions').update({ treatment }).eq('merchant_key', key).neq('treatment', 'internal')
  return error ? { ok: false, message: `Could not update: ${error.message}` } : { ok: true, message: 'Saved.' }
}
