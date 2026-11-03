// src/lib/tax/types.ts
// Bank-ledger model for the tax tracker. Amounts are signed (money in is positive), dates are 'YYYY-MM-DD'.

export type Treatment = 'unreviewed' | 'business' | 'personal' | 'internal'

export interface BankTx {
  txHash: string
  source: string
  date: string
  amount: number
  fee: number
  currency: string
  description: string
  merchantKey: string
  txType: string
  /** bank statements only */
  bank?: string | null
  account?: string | null
  reference?: string | null
  counterpartyName?: string | null
  counterpartyPhone?: string | null
  lineKind?: string | null
}

/** A stored transaction (BankTx plus what the owner decided). */
export interface LedgerTx extends BankTx {
  id: string
  treatment: Treatment
  hasReceipt: boolean
  note: string | null
}

export interface TaxSettings {
  ownerName: string
  salaryTaxableEur: number
  hebesatzPct: number
  priorYearTurnover: number
}

export const DEFAULT_TAX_SETTINGS: TaxSettings = { ownerName: '', salaryTaxableEur: 0, hebesatzPct: 450, priorYearTurnover: 0 }
