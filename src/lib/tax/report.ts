// src/lib/tax/report.ts
// Turns reviewed bank transactions into the cash-basis profit statement (EÜR) and the files for the Steuerberater.

import type { LedgerTx } from './types'

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export interface ExpenseGroup { merchant: string; total: number; count: number; withoutReceipt: number }

export interface YearSummary {
  year: number
  income: number
  expenses: number
  profit: number
  incomeCount: number
  expenseGroups: ExpenseGroup[]
  unreviewedCount: number
  unreviewedIn: number
  unreviewedOut: number
  expensesWithoutReceipt: number
  nonEur: number
}

export const inYear = (tx: { date: string }, year: number) => tx.date.startsWith(`${year}-`)

export function summarize(all: LedgerTx[], year: number): YearSummary {
  const txs = all.filter((t) => inYear(t, year))
  const biz = txs.filter((t) => t.treatment === 'business' && t.currency === 'EUR')
  const income = r2(biz.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0))
  const outs = biz.filter((t) => t.amount < 0)
  const expenses = r2(outs.reduce((s, t) => s - t.amount + t.fee, 0))

  const groups = new Map<string, ExpenseGroup>()
  for (const t of outs) {
    const g = groups.get(t.merchantKey) ?? { merchant: t.merchantKey, total: 0, count: 0, withoutReceipt: 0 }
    g.total = r2(g.total - t.amount + t.fee)
    g.count++
    if (!t.hasReceipt) g.withoutReceipt++
    groups.set(t.merchantKey, g)
  }
  const un = txs.filter((t) => t.treatment === 'unreviewed')
  return {
    year,
    income,
    expenses,
    profit: r2(income - expenses),
    incomeCount: biz.filter((t) => t.amount > 0).length,
    expenseGroups: [...groups.values()].sort((a, b) => b.total - a.total),
    unreviewedCount: un.length,
    unreviewedIn: r2(un.filter((t) => t.amount > 0 && t.currency === 'EUR').reduce((s, t) => s + t.amount, 0)),
    unreviewedOut: r2(un.filter((t) => t.amount < 0 && t.currency === 'EUR').reduce((s, t) => s - t.amount, 0)),
    expensesWithoutReceipt: outs.filter((t) => !t.hasReceipt).length,
    nonEur: txs.filter((t) => t.treatment === 'business' && t.currency !== 'EUR').length,
  }
}

export interface MerchantQueueItem { merchant: string; count: number; total: number; sample: string; direction: 'in' | 'out'; currency: string }

/** Unreviewed transactions grouped per merchant/person so one click decides many lines. */
export function reviewQueue(all: LedgerTx[], year: number): MerchantQueueItem[] {
  const map = new Map<string, MerchantQueueItem>()
  for (const t of all) {
    if (!inYear(t, year) || t.treatment !== 'unreviewed') continue
    const direction = t.amount > 0 ? 'in' : 'out'
    const k = `${direction}|${t.currency}|${t.merchantKey}`
    const g = map.get(k) ?? { merchant: t.merchantKey, count: 0, total: 0, sample: t.description, direction, currency: t.currency }
    g.count++
    g.total = r2(g.total + Math.abs(t.amount))
    map.set(k, g)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

const de = (n: number) => n.toFixed(2).replace('.', ',')
const cell = (s: string) => (/[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)

/** Semicolon CSV with decimal commas and a BOM, so it opens correctly in German Excel. */
export function steuerberaterCsv(all: LedgerTx[], year: number): string {
  const rows = all
    .filter((t) => inYear(t, year) && t.treatment === 'business')
    .sort((a, b) => a.date.localeCompare(b.date))
  const head = ['Datum', 'Beschreibung', 'Einnahme EUR', 'Ausgabe EUR', 'Waehrung', 'Beleg vorhanden', 'Notiz']
  const lines = rows.map((t) => [
    t.date,
    t.description,
    t.amount > 0 ? de(t.amount) : '',
    t.amount < 0 ? de(-t.amount + t.fee) : '',
    t.currency,
    t.amount < 0 ? (t.hasReceipt ? 'ja' : 'NEIN') : '',
    t.note ?? '',
  ].map(cell).join(';'))
  const s = summarize(all, year)
  const foot = [
    '',
    `Summe Einnahmen;;${de(s.income)}`,
    `Summe Ausgaben;;;${de(s.expenses)}`,
    `Gewinn (Einnahmen minus Ausgaben);;${de(s.profit)}`,
  ]
  return '﻿' + [head.join(';'), ...lines, ...foot].join('\r\n') + '\r\n'
}
