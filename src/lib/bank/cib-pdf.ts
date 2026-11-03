// src/lib/bank/cib-pdf.ts
// CIB (Commercial International Bank) account statement, as a PDF.
//
// The statement is a list of months. Each month ends with a control row: opening balance, number and sum of debits, number and
// sum of credits, closing balance. We use it to PROVE that every line was read: if the counts and sums do not match, the
// statement is marked "not verified" and you are told, instead of silently losing a payment.
//
// A line has the date at the far left, the description in the middle and the amount in the debit column (left) or the credit
// column (right). Whether an amount is a debit or a credit is decided from where it sits on the page, and confirmed by the totals.

import { normalizeEgPhone, parseAmount, parseBankDate } from './dates'
import type { PdfLine, PdfToken } from './pdf-lines'
import type { ParsedStatement, ParsedTx, StatementInfo } from './types'

const DATE = /^\d{2}[A-Z]{3}\d{2}$/
const AMOUNT = /^[\d,]+\.\d{2}$/
const CONTROL_FIRST = /^[\d,]+\.\d{2}\s?(CR|DR)$/
const HEADER_LABELS = new Set(['Account Name', 'Account Number', 'IBAN', 'Customer ID', 'Currency', 'Name:', 'Address:', 'Branch:'])
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

const signedCr = (t: string) => { const n = parseAmount(t); return n === null ? null : n }

interface RawTx { date: string; text: string[]; first: PdfToken[]; amounts: PdfToken[] }

export function looksLikeCib(lines: PdfLine[]): boolean {
  const head = lines.slice(0, 60).map((l) => l.map((t) => t.text).join(' ')).join('\n')
  return /C\.?I\.?B/i.test(head) || /OPENING BALANCE/.test(head) && /Account Number/.test(head) && /EGP/.test(head)
}

/** Group lines into months (a control row ends a month) and collect the raw transaction blocks. */
function blocks(lines: PdfLine[]) {
  const months: { raws: RawTx[]; control: PdfToken[] | null; opening: number | null; closing: number | null; account: string; currency: string }[] = []
  let account = '', currency = 'EGP'
  let cur = { raws: [] as RawTx[], control: null as PdfToken[] | null, opening: null as number | null, closing: null as number | null, account, currency }
  let tx: RawTx | null = null
  let descX = 150

  const pushMonth = () => { cur.account = account; cur.currency = currency; months.push(cur); cur = { raws: [], control: null, opening: null, closing: null, account, currency }; tx = null }

  for (const line of lines) {
    if (line.length === 0) continue
    const texts = line.map((t) => t.text)
    if (texts.some((t) => HEADER_LABELS.has(t))) {
      const i = texts.indexOf('Account Number')
      if (i >= 0 && texts[i + 1]) account = texts[i + 1].replace(/\D/g, '') || account
      const c = texts.indexOf('Currency')
      if (c >= 0) { const code = /^[A-Z]{3}/.exec(texts.find((t, k) => k > c && /^[A-Z]{3}\b/.test(t)) ?? ''); if (code) currency = code[0] }
      tx = null
      continue
    }
    if (texts[0].startsWith('*') || /^(Post value|Unless an active|the date of this|Please advice)/i.test(texts[0])) { tx = null; continue }

    // control row: "9,805.36 CR | 14 | 28,225.86 | 5 | 21,225.50 | 2,805.00 CR"
    if (CONTROL_FIRST.test(texts[0]) && texts.length >= 6) { cur.control = line; pushMonth(); continue }

    const opening = line.findIndex((t) => /OPENING BALANCE/.test(t.text))
    if (opening >= 0) { const a = line.slice(opening + 1).find((t) => AMOUNT.test(t.text)); cur.opening = a ? parseAmount(a.text) : null; descX = line[opening].x; tx = null; continue }
    const closing = line.findIndex((t) => /CLOSING BALANCE/.test(t.text))
    if (closing >= 0) { const a = line.slice(closing + 1).find((t) => AMOUNT.test(t.text)); cur.closing = a ? parseAmount(a.text) : null; tx = null; continue }

    if (DATE.test(texts[0])) {
      // trailing amount tokens: [amount] or [amount, balance]
      let k = line.length
      while (k > 1 && AMOUNT.test(line[k - 1].text) && line.length - k < 2) k--
      const amounts = line.slice(k)
      const desc = line.slice(1, k).map((t) => t.text).join(' ')
      tx = { date: texts[0], text: [desc], first: line, amounts }
      cur.raws.push(tx)
      continue
    }
    // continuation of the description (second line of a payment)
    if (tx && line[0].x >= descX - 6) tx.text.push(texts.join(' '))
  }
  if (cur.raws.length) pushMonth()
  return months
}

/** Split sorted edges into groups wherever the gap is larger than `gap`. */
function cluster(edges: number[], gap: number): number[][] {
  const s = [...edges].sort((a, b) => a - b)
  const out: number[][] = []
  for (const e of s) { const g = out[out.length - 1]; if (g && e - g[g.length - 1] <= gap) g.push(e); else out.push([e]) }
  return out
}
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length

function kindOf(desc: string): ParsedTx['kind'] {
  if (/^IPN Inward/i.test(desc)) return 'ipn_in'
  if (/^IPN Fund Transfer/i.test(desc)) return 'ipn_out'
  if (/POS PURCHASE|ATM/i.test(desc)) return 'card'
  if (/^Fees/i.test(desc)) return 'fee'
  if (/^ACH/i.test(desc)) return 'ach'
  if (/Transfer/i.test(desc)) return 'transfer'
  return 'other'
}

const REF = /\b(FT[0-9A-Z]{8,12})\b/
function counterparty(desc: string): { name: string | null; phone: string | null } {
  const phone = normalizeEgPhone(/PayerMobNo:\s*([0-9+]+)/i.exec(desc)?.[1])
  // "Payer Name: RANA AHMED IBRAHIM ALY Living Expe" -> the capital-letter words after "Name:"
  let name: string | null = null
  const n = /(?:Payer\s+)?Name:\s*(.+)$/i.exec(desc)
  const p = /PayeeName:\s*(.+?)(?:\s+BenefAcct.*)?$/i.exec(desc)
  const raw = (p ? p[1] : n ? n[1] : '').trim()
  if (raw) {
    const words: string[] = []
    for (const w of raw.split(/\s+/)) { if (/^[A-Z.]+$/.test(w) || /^[؀-ۿ]+$/.test(w)) words.push(w); else break }
    name = words.join(' ') || null
  }
  return { name, phone }
}

export function parseCibLines(lines: PdfLine[]): ParsedStatement {
  const out: ParsedStatement = { transactions: [], statements: [], problems: [] }
  const months = blocks(lines)
  if (months.length === 0) { out.problems.push('No CIB transactions found in this PDF.'); return out }

  // Where the debit, credit and balance columns are: the amount edges of all lines, in three groups left to right.
  const firstEdges: number[] = [], balEdges: number[] = []
  for (const m of months) for (const r of m.raws) {
    if (r.amounts.length >= 1) firstEdges.push(r.amounts[0].xEnd)
    if (r.amounts.length === 2) balEdges.push(r.amounts[1].xEnd)
  }
  const spread = Math.max(...firstEdges, ...balEdges, 1)
  const gap = spread * 0.04
  const amountColumns = cluster(firstEdges, gap).map(mean)

  for (const m of months) {
    const control = m.control
    const info: StatementInfo = {
      bank: 'cib', account: m.account, currency: m.currency, from: null, to: null,
      opening: m.opening ?? (control ? signedCr(control[0].text.replace(/\s?CR$/, '')) : null),
      closing: m.closing ?? (control ? signedCr(control[5].text.replace(/\s?CR$/, '')) : null),
      debitCount: control ? Number(control[1].text) : null, debitTotal: control ? parseAmount(control[2].text) : null,
      creditCount: control ? Number(control[3].text) : null, creditTotal: control ? parseAmount(control[4].text) : null,
      readDebitCount: 0, readDebitTotal: 0, readCreditCount: 0, readCreditTotal: 0, verified: false, note: '',
    }

    // Which column is "debit" for this month: try both readings and keep the one the bank's totals confirm.
    const assign = (debitIsLeft: boolean) => {
      const txs: { raw: RawTx; amount: number; sign: 1 | -1 }[] = []
      for (const r of m.raws) {
        const a = r.amounts[0] ? parseAmount(r.amounts[0].text) : null
        if (a === null) continue
        const col = amountColumns.findIndex((c) => Math.abs(c - r.amounts[0].xEnd) <= gap)
        const left = amountColumns.length <= 1 ? debitIsLeft : col === 0
        txs.push({ raw: r, amount: a, sign: left ? -1 : 1 })
      }
      return txs
    }
    const sums = (txs: { amount: number; sign: 1 | -1 }[]) => ({
      dc: txs.filter((t) => t.sign < 0).length, ds: r2(txs.filter((t) => t.sign < 0).reduce((s, t) => s + t.amount, 0)),
      cc: txs.filter((t) => t.sign > 0).length, cs: r2(txs.filter((t) => t.sign > 0).reduce((s, t) => s + t.amount, 0)),
    })
    const matches = (txs: { amount: number; sign: 1 | -1 }[]) => {
      const s = sums(txs)
      return info.debitTotal !== null && Math.abs(s.ds - info.debitTotal) < 0.011 && s.dc === info.debitCount
        && Math.abs(s.cs - (info.creditTotal ?? 0)) < 0.011 && s.cc === info.creditCount
    }
    let txs = assign(true)
    if (amountColumns.length <= 1 && !matches(txs)) { const alt = assign(false); if (matches(alt)) txs = alt }
    // Only credit-column or only debit-column amounts in a month with several columns elsewhere: the keyword is the tie-breaker
    for (const t of txs) {
      const desc = t.raw.text.join(' ')
      if (amountColumns.length > 1 && !matches(txs) && /^IPN Inward/i.test(desc)) t.sign = 1
    }

    const s = sums(txs)
    info.readDebitCount = s.dc; info.readDebitTotal = s.ds; info.readCreditCount = s.cc; info.readCreditTotal = s.cs

    const chain = info.opening !== null && info.closing !== null && Math.abs(r2(info.opening - s.ds + s.cs) - info.closing) < 0.011
    const totalsOk = control ? matches(txs) : false
    info.verified = chain && (totalsOk || !control)
    info.note = info.verified
      ? (control ? 'Counts and sums match the bank totals, and opening - debits + credits = closing.' : 'Opening - debits + credits = closing (the bank printed no totals row).')
      : !control ? 'No totals row found, so this month could not be checked.'
        : !chain ? `Opening ${info.opening} - debits ${s.ds} + credits ${s.cs} does not equal closing ${info.closing}. Something was missed or misread.`
          : `The bank says ${info.debitCount} debits (${info.debitTotal}) and ${info.creditCount} credits (${info.creditTotal}), but ${s.dc} (${s.ds}) and ${s.cc} (${s.cs}) were read.`

    for (const t of txs) {
      const desc = t.raw.text.join(' ').replace(/\s+/g, ' ').trim()
      const date = parseBankDate(t.raw.date)
      if (!date) { out.problems.push(`Could not read the date "${t.raw.date}".`); continue }
      const cp = counterparty(desc)
      out.transactions.push({
        bank: 'cib', account: m.account, date, amount: r2(t.sign * t.amount), currency: m.currency, description: desc,
        reference: REF.exec(desc)?.[1] ?? null, counterpartyName: cp.name, counterpartyPhone: cp.phone,
        balance: t.raw.amounts[1] ? parseAmount(t.raw.amounts[1].text) : null, kind: kindOf(desc),
      })
    }
    const dates = out.transactions.filter((x) => x.account === m.account).map((x) => x.date).sort()
    info.from = dates[0] ?? null; info.to = dates[dates.length - 1] ?? null
    out.statements.push(info)
    if (!info.verified) out.problems.push(`Statement ending ${info.to ?? '?'}: ${info.note}`)
  }
  return out
}
