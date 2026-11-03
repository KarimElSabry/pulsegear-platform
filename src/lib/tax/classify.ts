// src/lib/tax/classify.ts
// Decides what can be handled automatically: money moving between your own pockets/accounts is "internal".
// Everything else starts as "unreviewed" with a suggestion; one decision per merchant is remembered as a rule.

import type { BankTx, Treatment } from './types'

export interface Suggestion { treatment: 'business' | 'personal'; why: string }

const INTERNAL_PATTERNS = [
  /^to pocket /, /^pocket withdrawal/, /^revpoints spare change/, /^top-up by /,
  /^from pocket /, /^to savings/, /^from savings/,
]

// Shops where goods for resale are typically bought. Only a suggestion, you confirm once per shop.
const BUSINESS_SHOPS = ['amazon', 'ebay', 'vinted', 'kleinanzeigen', 'garmin', 'nike', 'galaxus', 'coolblue', 'klarna', 'wavytalk', 'adidas', 'asics', 'decathlon', 'sportscheck', 'zalando', 'aliexpress', 'alibaba']

export function isInternal(tx: BankTx, ownerName: string): boolean {
  const d = tx.description.toLowerCase()
  if (INTERNAL_PATTERNS.some((p) => p.test(d))) return true
  const owner = ownerName.trim().toLowerCase()
  if (owner && (d === `to ${owner}` || d === `transfer to ${owner}` || d === `transfer from ${owner}`)) return true
  return false
}

export function suggest(tx: BankTx): Suggestion {
  const key = tx.merchantKey
  if (tx.amount > 0) {
    if (tx.txType === 'Transfer' || tx.txType === 'Deposit') {
      return { treatment: 'business', why: 'Money in from a person. Probably euros from a currency exchange or a customer.' }
    }
    return { treatment: 'personal', why: 'Small refund or reward.' }
  }
  if (BUSINESS_SHOPS.some((s) => key.includes(s))) return { treatment: 'business', why: 'Online shop where you usually buy stock.' }
  return { treatment: 'personal', why: 'Looks like a private expense.' }
}

/** Treatment a freshly imported transaction starts with. */
export function initialTreatment(tx: BankTx, ownerName: string, rules: Map<string, Exclude<Treatment, 'unreviewed'>>): Treatment {
  if (isInternal(tx, ownerName)) return 'internal'
  return rules.get(tx.merchantKey) ?? 'unreviewed'
}
