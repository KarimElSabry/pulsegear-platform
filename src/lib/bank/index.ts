// src/lib/bank/index.ts
// One entry point: any statement file in, a list of transactions plus proof of completeness out.

import { parseRevolut } from '@/lib/tax/revolut'
import { looksLikeCib, parseCibLines } from './cib-pdf'
import { parseBankCsv, parseGenericPdfLines } from './generic'
import type { PdfLine } from './pdf-lines'
import type { BankId, ParsedStatement } from './types'

export type SourceKind = 'revolut' | 'cib' | 'qnb' | 'other'

export const isRevolutCsv = (text: string) => /^﻿?Type,Product,Started Date,/.test(text.trimStart())

export function parseBankCsvAuto(text: string, hint: BankId | 'auto'): { source: SourceKind; result: ParsedStatement | null } {
  if (isRevolutCsv(text)) return { source: 'revolut', result: null }
  const bank: BankId = hint === 'auto' ? (/qnb|qatar national/i.test(text.slice(0, 2000)) ? 'qnb' : /c\.?i\.?b|commercial international/i.test(text.slice(0, 2000)) ? 'cib' : 'other') : hint
  return { source: bank, result: parseBankCsv(text, bank) }
}

export function parseBankPdfLines(lines: PdfLine[], hint: BankId | 'auto'): { source: SourceKind; result: ParsedStatement } {
  if (hint === 'cib' || (hint === 'auto' && looksLikeCib(lines))) {
    const cib = parseCibLines(lines)
    if (cib.transactions.length > 0 || hint === 'cib') return { source: 'cib', result: cib }
  }
  const bank: BankId = hint === 'auto' ? (/qnb|qatar national/i.test(lines.slice(0, 40).map((l) => l.map((t) => t.text).join(' ')).join('\n')) ? 'qnb' : 'other') : hint
  return { source: bank, result: parseGenericPdfLines(lines, bank) }
}

export { parseRevolut }
