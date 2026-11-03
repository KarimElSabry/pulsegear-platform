// src/lib/bank/types.ts
// What every bank importer returns. Money is signed (money in is positive). Dates are 'YYYY-MM-DD'.

export type BankId = 'cib' | 'qnb' | 'other'

export interface ParsedTx {
  bank: BankId
  /** account number or label, so two accounts never mix */
  account: string
  date: string
  amount: number
  currency: string
  description: string
  /** the bank's own reference (e.g. FT26152GZFR8) when there is one */
  reference: string | null
  counterpartyName: string | null
  /** normalised Egyptian mobile number (01xxxxxxxxx) of the payer/payee when the bank shows it */
  counterpartyPhone: string | null
  balance: number | null
  kind: 'ipn_in' | 'ipn_out' | 'transfer' | 'card' | 'fee' | 'ach' | 'other'
}

/** The bank's own totals for a statement, used to PROVE that every line was read. */
export interface StatementInfo {
  bank: BankId
  account: string
  currency: string
  from: string | null
  to: string | null
  opening: number | null
  closing: number | null
  /** what the bank says */
  debitCount: number | null
  debitTotal: number | null
  creditCount: number | null
  creditTotal: number | null
  /** what we read */
  readDebitCount: number
  readDebitTotal: number
  readCreditCount: number
  readCreditTotal: number
  /** true only when opening - debits + credits = closing AND the bank's counts/sums match what we read (or the balances chain) */
  verified: boolean
  /** how it was verified, or why not */
  note: string
}

export interface ParsedStatement {
  transactions: ParsedTx[]
  statements: StatementInfo[]
  problems: string[]
}
