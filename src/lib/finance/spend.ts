// src/lib/finance/spend.ts
// Advertising-spend normalisation, CSV parsing and the duplicate-protection hash.

import { createHash } from 'crypto'
import { isDateString } from './range'
import { round2 } from './money'

export interface SpendInput {
  platform: string
  campaign: string
  date: string
  currency: string
  amount: number
  /** Required unless currency is EGP. EGP per 1 unit of `currency`. */
  fxRateToEgp?: number | null
  /** Optional explicit EGP amount (wins over amount * fx when present). */
  amountEgp?: number | null
}

export interface SpendRow {
  platform: string
  campaign: string
  spend_date: string
  currency: string
  amount: number
  fx_rate_to_egp: number
  amount_egp: number
  source: 'manual' | 'csv' | 'meta_api'
  source_hash: string
}

export type SpendValidation = { ok: true; row: SpendRow } | { ok: false; error: string }

function clean(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/** Same spend (platform, campaign, day, currency, amount) always hashes the same, case-insensitively. */
export function spendHash(i: { platform: string; campaign: string; date: string; currency: string; amount: number }): string {
  const key = [
    clean(i.platform).toLowerCase(),
    clean(i.campaign).toLowerCase(),
    i.date,
    i.currency.trim().toUpperCase(),
    round2(i.amount).toFixed(2),
  ].join('|')
  return createHash('sha256').update(key).digest('hex')
}

export function validateSpend(input: SpendInput, source: 'manual' | 'csv'): SpendValidation {
  const platform = clean(input.platform ?? '')
  const campaign = clean(input.campaign ?? '')
  const currency = (input.currency ?? 'EGP').trim().toUpperCase()

  if (!platform) return { ok: false, error: 'platform is required' }
  if (!campaign) return { ok: false, error: 'campaign is required' }
  if (!isDateString(input.date)) return { ok: false, error: `invalid date "${input.date}" (use YYYY-MM-DD)` }
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, error: `invalid currency "${input.currency}"` }
  if (!Number.isFinite(input.amount) || input.amount < 0) return { ok: false, error: 'amount must be a number >= 0' }

  let fx = 1
  let amountEgp = round2(input.amount)
  if (currency !== 'EGP') {
    if (input.amountEgp != null && Number.isFinite(input.amountEgp) && input.amountEgp >= 0) {
      amountEgp = round2(input.amountEgp)
      fx = input.amount > 0 ? amountEgp / input.amount : 1
    } else if (input.fxRateToEgp != null && Number.isFinite(input.fxRateToEgp) && input.fxRateToEgp > 0) {
      fx = input.fxRateToEgp
      amountEgp = round2(input.amount * fx)
    } else {
      return { ok: false, error: `${currency} spend needs an EGP amount or an exchange rate` }
    }
  }

  return {
    ok: true,
    row: {
      platform,
      campaign,
      spend_date: input.date,
      currency,
      amount: round2(input.amount),
      fx_rate_to_egp: fx > 0 ? Number(fx.toFixed(6)) : 1,
      amount_egp: amountEgp,
      source,
      source_hash: spendHash({ platform, campaign, date: input.date, currency, amount: input.amount }),
    },
  }
}

/** Minimal RFC-4180 style CSV parser (quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const src = text.replace(/^﻿/, '')

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else field += ch
  }
  row.push(field)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

export interface SpendCsvResult {
  valid: SpendRow[]
  /** Rows repeated inside the same file (dropped before touching the database). */
  duplicatesInFile: number
  rejected: { line: number; error: string }[]
}

const HEADER_ALIASES: Record<string, string> = {
  platform: 'platform', source: 'platform',
  campaign: 'campaign', 'campaign name': 'campaign',
  date: 'date', day: 'date',
  currency: 'currency',
  amount: 'amount', spend: 'amount', cost: 'amount',
  amount_egp: 'amount_egp', 'amount egp': 'amount_egp',
  fx_rate: 'fx_rate', fx: 'fx_rate', 'exchange rate': 'fx_rate',
}

export function parseSpendCsv(text: string): SpendCsvResult {
  const table = parseCsv(text)
  const result: SpendCsvResult = { valid: [], duplicatesInFile: 0, rejected: [] }
  if (table.length === 0) return result

  const headers = table[0].map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? h.trim().toLowerCase())
  for (const required of ['platform', 'campaign', 'date', 'amount']) {
    if (!headers.includes(required)) {
      result.rejected.push({ line: 1, error: `missing column "${required}"` })
      return result
    }
  }

  const seen = new Set<string>()
  table.slice(1).forEach((cells, idx) => {
    const line = idx + 2
    const get = (name: string) => {
      const i = headers.indexOf(name)
      return i >= 0 ? (cells[i] ?? '').trim() : ''
    }
    const num = (name: string) => {
      const raw = get(name).replace(/,/g, '')
      return raw === '' ? null : Number(raw)
    }

    const v = validateSpend(
      {
        platform: get('platform'),
        campaign: get('campaign'),
        date: get('date'),
        currency: get('currency') || 'EGP',
        amount: num('amount') ?? NaN,
        amountEgp: num('amount_egp'),
        fxRateToEgp: num('fx_rate'),
      },
      'csv'
    )
    if (!v.ok) { result.rejected.push({ line, error: v.error }); return }
    if (seen.has(v.row.source_hash)) { result.duplicatesInFile += 1; return }
    seen.add(v.row.source_hash)
    result.valid.push(v.row)
  })
  return result
}
