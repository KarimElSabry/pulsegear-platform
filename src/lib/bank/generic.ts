// src/lib/bank/generic.ts
// Bank statements as CSV, and a best-effort PDF reader for banks whose layout we have not seen yet (for example QNB).
// Both only trust what they can PROVE: when the balance column is there, every line must follow from the line before it.

import { parseCsv } from '@/lib/tax/revolut'
import { normalizeEgPhone, parseAmount, parseBankDate } from './dates'
import type { PdfLine } from './pdf-lines'
import type { BankId, ParsedStatement, ParsedTx, StatementInfo } from './types'

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, ' ').trim()

const SYN = {
  date: ['date', 'transaction date', 'trans date', 'posting date', 'booking date', 'value date', 'التاريخ', 'تاريخ', 'تاريخ العملية', 'تاريخ المعاملة'],
  description: ['description', 'details', 'narrative', 'narration', 'transaction details', 'particulars', 'remarks', 'البيان', 'الوصف', 'التفاصيل'],
  debit: ['debit', 'debits', 'withdrawal', 'withdrawals', 'dr', 'paid out', 'money out', 'مدين', 'سحب', 'مسحوبات'],
  credit: ['credit', 'credits', 'deposit', 'deposits', 'cr', 'paid in', 'money in', 'دائن', 'ايداع', 'إيداع', 'مودع'],
  amount: ['amount', 'transaction amount', 'القيمة', 'المبلغ'],
  balance: ['balance', 'running balance', 'available balance', 'الرصيد'],
  reference: ['reference', 'ref', 'reference no', 'ref no', 'transaction id', 'transaction reference', 'المرجع', 'رقم المرجع'],
  type: ['type', 'dr cr', 'dr/cr', 'cr/dr', 'indicator'],
}
type Field = keyof typeof SYN
const fieldOf = (cell: string): Field | null => {
  const n = norm(cell)
  for (const f of Object.keys(SYN) as Field[]) if (SYN[f].some((s) => norm(s) === n)) return f
  return null
}

function kindOf(desc: string): ParsedTx['kind'] {
  if (/ipn.*(inward|received)|instapay.*(in|received)/i.test(desc)) return 'ipn_in'
  if (/ipn|instapay/i.test(desc)) return 'ipn_out'
  if (/pos|atm|purchase|card/i.test(desc)) return 'card'
  if (/fee|charge/i.test(desc)) return 'fee'
  if (/transfer/i.test(desc)) return 'transfer'
  return 'other'
}

const finish = (bank: BankId, account: string, currency: string, txs: ParsedTx[], note?: string): ParsedStatement => {
  const out: ParsedStatement = { transactions: txs, statements: [], problems: [] }
  if (txs.length === 0) { out.problems.push('No transactions found in this file.'); return out }
  const dates = txs.map((t) => t.date).sort()
  const debits = txs.filter((t) => t.amount < 0), credits = txs.filter((t) => t.amount > 0)
  const withBal = txs.filter((t) => t.balance !== null)
  // the balance column proves the file: each balance must equal the previous balance plus this line
  let breaks = 0
  for (let i = 1; i < withBal.length; i++) {
    if (Math.abs(r2((withBal[i - 1].balance as number) + withBal[i].amount - (withBal[i].balance as number))) > 0.011) breaks++
  }
  const chained = withBal.length === txs.length && txs.length > 1
  const verified = chained && breaks === 0
  const first = withBal[0], last = withBal[withBal.length - 1]
  const info: StatementInfo = {
    bank, account, currency, from: dates[0], to: dates[dates.length - 1],
    opening: first ? r2((first.balance as number) - first.amount) : null, closing: last ? (last.balance as number) : null,
    debitCount: null, debitTotal: null, creditCount: null, creditTotal: null,
    readDebitCount: debits.length, readDebitTotal: r2(-debits.reduce((s, t) => s + t.amount, 0)),
    readCreditCount: credits.length, readCreditTotal: r2(credits.reduce((s, t) => s + t.amount, 0)),
    verified,
    note: verified ? 'Every balance follows from the line before it, so no line is missing.'
      : withBal.length === 0 ? `${note ?? 'The file has no balance column'}, so completeness could not be proven. Compare the totals with your bank statement.`
        : breaks > 0 ? `${breaks} line(s) where the balance does not follow from the previous line. A line may be missing or misread.`
          : 'Some lines have no balance, so completeness could not be proven.',
  }
  out.statements.push(info)
  if (!verified) out.problems.push(info.note)
  return out
}

/** A bank's CSV export: finds the header row, the columns (English or Arabic names), debit/credit or signed amounts. */
export function parseBankCsv(text: string, bank: BankId, account = bank.toUpperCase(), currency = 'EGP'): ParsedStatement {
  const rows = parseCsv(text.replace(/^﻿/, ''))
  let headerAt = -1
  let cols: Partial<Record<Field, number>> = {}
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const found: Partial<Record<Field, number>> = {}
    rows[i].forEach((c, k) => { const f = fieldOf(c); if (f && found[f] === undefined) found[f] = k })
    if (found.date !== undefined && (found.amount !== undefined || found.debit !== undefined || found.credit !== undefined)) { headerAt = i; cols = found; break }
  }
  if (headerAt < 0) return { transactions: [], statements: [], problems: ['Could not find the table header (date, description and amount or debit/credit columns). Send me the file and I will teach the importer this format.'] }

  const txs: ParsedTx[] = []
  const problems: string[] = []
  for (const r of rows.slice(headerAt + 1)) {
    const get = (f: Field) => (cols[f] === undefined ? '' : (r[cols[f] as number] ?? '').trim())
    const date = parseBankDate(get('date'))
    if (!date) continue // blank, total and footer lines
    let amount: number | null = null
    if (cols.debit !== undefined || cols.credit !== undefined) {
      const d = parseAmount(get('debit')), c = parseAmount(get('credit'))
      amount = (c ?? 0) - Math.abs(d ?? 0)
      if (d === null && c === null) amount = null
    } else {
      amount = parseAmount(get('amount'))
      const t = get('type')
      if (amount !== null && /^(dr|debit|d)$/i.test(t)) amount = -Math.abs(amount)
      else if (amount !== null && /^(cr|credit|c)$/i.test(t)) amount = Math.abs(amount)
    }
    if (amount === null || amount === 0) { if (amount === null) problems.push(`Could not read the amount on ${get('date')}.`); continue }
    const description = get('description').replace(/\s+/g, ' ')
    txs.push({
      bank, account, date, amount: r2(amount), currency, description, reference: get('reference') || /\b(FT[0-9A-Z]{8,12})\b/.exec(description)?.[1] || null,
      counterpartyName: /(?:payer|payee|name|from|to)\s*(?:name)?:\s*([A-Z][A-Z .'-]{3,})/i.exec(description)?.[1]?.trim() ?? null,
      counterpartyPhone: normalizeEgPhone(/(?:mob(?:ile)?(?:no)?|phone)\s*:?\s*([0-9+]{10,15})/i.exec(description)?.[1] ?? /\b(0?1[0125]\d{8})\b/.exec(description)?.[1]),
      balance: cols.balance !== undefined ? parseAmount(get('balance')) : null, kind: kindOf(description),
    })
  }
  const res = finish(bank, account, currency, txs)
  res.problems.unshift(...problems.slice(0, 5))
  return res
}

const HEAD_WORDS: Record<'debit' | 'credit' | 'balance', string[]> = {
  debit: ['debit', 'withdrawal', 'dr', 'مدين', 'سحب'], credit: ['credit', 'deposit', 'cr', 'دائن', 'ايداع', 'إيداع'], balance: ['balance', 'الرصيد'],
}

/** Best effort for a PDF we have no sample of: rows that start with a date, amounts placed by the Debit/Credit/Balance headings. */
export function parseGenericPdfLines(lines: PdfLine[], bank: BankId, account = bank.toUpperCase(), currency = 'EGP'): ParsedStatement {
  let anchors: { debit?: number; credit?: number; balance?: number } = {}
  for (const l of lines) {
    const found: typeof anchors = {}
    for (const t of l) {
      for (const k of Object.keys(HEAD_WORDS) as (keyof typeof HEAD_WORDS)[]) if (HEAD_WORDS[k].includes(norm(t.text))) found[k] = (t.x + t.xEnd) / 2
    }
    if (found.balance !== undefined && (found.debit !== undefined || found.credit !== undefined)) { anchors = found; break }
  }
  if (anchors.balance === undefined) return { transactions: [], statements: [], problems: ['Could not find the Debit / Credit / Balance headings in this PDF. Send me the file (or a CSV export) and I will teach the importer this format.'] }

  const AMT = /^-?[\d,]+\.\d{2}$/
  const txs: ParsedTx[] = []
  let cur: ParsedTx | null = null
  const near = (x: number) => (Object.entries(anchors) as [keyof typeof anchors, number][]).sort((a, b) => Math.abs(a[1] - x) - Math.abs(b[1] - x))[0][0]
  for (const l of lines) {
    const date = l[0] ? parseBankDate(l[0].text) : null
    if (date) {
      const amts = l.filter((t) => AMT.test(t.text) && t.x > (l[0].xEnd + 20))
      const desc = l.slice(1).filter((t) => !amts.includes(t)).map((t) => t.text).join(' ')
      let signed: number | null = null, balance: number | null = null
      for (const a of amts) {
        const col = near((a.x + a.xEnd) / 2), v = parseAmount(a.text)
        if (v === null) continue
        if (col === 'balance') balance = v
        else signed = col === 'debit' ? -Math.abs(v) : Math.abs(v)
      }
      if (signed === null) { cur = null; continue }
      cur = { bank, account, date, amount: signed, currency, description: desc, reference: null, counterpartyName: null, counterpartyPhone: normalizeEgPhone(/\b(0?1[0125]\d{8})\b/.exec(desc)?.[1]), balance, kind: kindOf(desc) }
      txs.push(cur)
    } else if (cur && l.length && !l.some((t) => AMT.test(t.text))) {
      cur.description = `${cur.description} ${l.map((t) => t.text).join(' ')}`.trim()
      cur.counterpartyPhone ??= normalizeEgPhone(/\b(0?1[0125]\d{8})\b/.exec(cur.description)?.[1])
    }
  }
  return finish(bank, account, currency, txs)
}
