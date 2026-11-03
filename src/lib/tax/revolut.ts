// src/lib/tax/revolut.ts
// Parses a Revolut "account statement" CSV (Type, Product, Started Date, Completed Date, Description, Amount, Fee,
// Currency, State, Balance). Only COMPLETED rows count. Savings rows only mirror pocket moves, so they are dropped.

import { createHash } from 'crypto'
import type { BankTx } from './types'

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((x) => x !== '')) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x !== '')) rows.push(row)
  return rows
}

/** Name used to group "the same merchant" (Amazon, eBay ...) or "the same person" across transactions. */
export function merchantKey(description: string): string {
  return description
    .toLowerCase()
    .replace(/^(payment from|transfer from|transfer to|to|from)\s+/, '')
    .replace(/\s+\d{5,}$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Rules are per direction: paying a person is not the same decision as being paid by them. */
export function ruleKey(description: string, amount: number): string {
  return `${amount > 0 ? 'in' : 'out'}:${merchantKey(description)}`
}

/** Name to show for a stored key such as 'out:amazon'. */
export const displayName = (key: string) => key.replace(/^(in|out):/, '')

export interface RevolutParse {
  transactions: BankTx[]
  skipped: { notCompleted: number; savingsMirror: number }
  /** Rows whose running balance does not follow from the previous row, i.e. a gap or a damaged file. */
  balanceBreaks: number
  problems: string[]
}

const REQUIRED = ['Type', 'Product', 'Started Date', 'Description', 'Amount', 'Fee', 'Currency', 'State', 'Balance']

export function parseRevolut(text: string): RevolutParse {
  const out: RevolutParse = { transactions: [], skipped: { notCompleted: 0, savingsMirror: 0 }, balanceBreaks: 0, problems: [] }
  const rows = parseCsv(text)
  const header = rows[0] ?? []
  const missing = REQUIRED.filter((h) => !header.includes(h))
  if (missing.length) {
    out.problems.push(`This does not look like a Revolut statement CSV (missing column: ${missing.join(', ')}).`)
    return out
  }
  const col = (r: string[], name: string) => r[header.indexOf(name)] ?? ''
  const seen = new Map<string, number>()
  let prevBalance: number | null = null

  rows.slice(1).forEach((r, i) => {
    if (col(r, 'State') !== 'COMPLETED') { out.skipped.notCompleted++; return }
    if (col(r, 'Product') === 'Savings') { out.skipped.savingsMirror++; return }
    const date = col(r, 'Started Date').slice(0, 10)
    const amount = Number(col(r, 'Amount'))
    const fee = Number(col(r, 'Fee') || 0)
    const balance = Number(col(r, 'Balance'))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(amount)) {
      out.problems.push(`Line ${i + 2}: could not read the date or amount.`)
      return
    }
    if (prevBalance !== null && Number.isFinite(balance) && Math.abs(prevBalance + amount - fee - balance) > 0.011) out.balanceBreaks++
    if (Number.isFinite(balance)) prevBalance = balance

    const description = col(r, 'Description').trim()
    const base = [date, col(r, 'Started Date'), description, amount, fee, col(r, 'Currency'), col(r, 'Balance')].join('|')
    // an identical line twice in one file is real (two equal payments); number them so both survive
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    out.transactions.push({
      txHash: createHash('sha1').update(`revolut|${base}|${n}`).digest('hex'),
      source: 'revolut',
      date,
      amount,
      fee,
      currency: col(r, 'Currency') || 'EUR',
      description,
      merchantKey: ruleKey(description, amount),
      txType: col(r, 'Type'),
    })
  })
  return out
}
