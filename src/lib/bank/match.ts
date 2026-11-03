// src/lib/bank/match.ts
// Pure matching between bank lines. Nothing here touches the database.
//   1. Currency exchanges: EGP you sent out (CIB) <-> EUR that arrived in Revolut a day or three later, with a plausible rate.
//   2. Customer payments: EGP that arrived in your account <-> the order it pays for (phone, amount, date).
// Every match gets a score. Only unambiguous, high scores are confirmed automatically; the rest are suggestions you accept or reject.

export interface MatchTx {
  id: string
  date: string
  amount: number
  currency: string
  description: string
  counterpartyName: string | null
  counterpartyPhone: string | null
  /** 'ipn_out', 'ipn_in', ... for bank lines; Revolut type for Revolut */
  kind: string
  treatment: string
}

const DAY = 86_400_000
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY)
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const r4 = (n: number) => Math.round(n * 10_000) / 10_000

function tokens(name: string | null): Set<string> {
  return new Set((name ?? '').toLowerCase().split(/[^a-z؀-ۿ]+/).filter((t) => t.length >= 3))
}
/** Share of words two names have in common (masked words like "A........" count for nothing). 0 when either name is unknown. */
export function nameSimilarity(a: string | null, b: string | null): number {
  const x = tokens(a), y = tokens(b)
  if (x.size === 0 || y.size === 0) return 0
  let hit = 0
  for (const t of x) if (y.has(t)) hit++
  return hit / Math.min(x.size, y.size)
}

/** Name of the other side of a Revolut line: "Transfer from ALI HASSAN" -> "ALI HASSAN". */
export const revolutPartyName = (description: string): string => description.replace(/^(payment from|transfer from|transfer to|to|from)\s+/i, '').trim()

export interface ExchangeMatch {
  egpId: string
  eurId: string
  rate: number
  score: number
  /** true when it is clear enough to confirm without asking you */
  confident: boolean
  daysLater: number
  nameScore: number
}

export interface ExchangeOptions { minEgp?: number; minEur?: number; rateLo?: number; rateHi?: number; maxDaysLater?: number; maxDaysEarlier?: number }

const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

export function matchExchanges(egpOut: MatchTx[], eurIn: MatchTx[], o: ExchangeOptions = {}): ExchangeMatch[] {
  const minEgp = o.minEgp ?? 2000, minEur = o.minEur ?? 20, lo = o.rateLo ?? 45, hi = o.rateHi ?? 80, maxLater = o.maxDaysLater ?? 4, maxEarlier = o.maxDaysEarlier ?? 4
  const outs = egpOut.filter((t) => t.currency === 'EGP' && t.amount <= -minEgp)
  const ins = eurIn.filter((t) => t.currency === 'EUR' && t.amount >= minEur)

  type Cand = { egp: MatchTx; eur: MatchTx; rate: number; later: number }
  const cands: Cand[] = []
  for (const e of outs) for (const u of ins) {
    const later = days(e.date, u.date)
    const rate = -e.amount / u.amount
    if (later < -maxEarlier || later > maxLater || rate < lo || rate > hi) continue
    cands.push({ egp: e, eur: u, rate, later })
  }
  if (cands.length === 0) return []
  // the going rate: the typical rate of all plausible pairs, so one odd pair cannot drag a good one down
  const ref = median(cands.map((c) => c.rate))

  const scored = cands.map((c) => {
    // the other person may send the euros before or after you send the pounds
    const time = Math.max(0, 1 - Math.abs(c.later) / (Math.max(maxLater, maxEarlier) + 1))
    const rate = Math.max(0, 1 - Math.abs(c.rate - ref) / 6)
    const nameScore = nameSimilarity(c.egp.counterpartyName, revolutPartyName(c.eur.description))
    // a card top-up is usually your own money going in: possible, but never confirmed without you
    const cap = c.eur.kind === 'topup' ? 0.7 : 1
    return { ...c, nameScore, score: Math.min(cap, 0.45 * time + 0.45 * rate + 0.25 * nameScore) }
  }).sort((a, b) => b.score - a.score)

  const bestAlt = (id: string, side: 'egp' | 'eur', except: Cand) =>
    Math.max(0, ...scored.filter((s) => s[side].id === id && s !== except && s.score >= 0).map((s) => s.score))

  const usedEgp = new Set<string>(), usedEur = new Set<string>()
  const out: ExchangeMatch[] = []
  for (const s of scored) {
    if (s.score < 0.5 || usedEgp.has(s.egp.id) || usedEur.has(s.eur.id)) continue
    usedEgp.add(s.egp.id); usedEur.add(s.eur.id)
    const rivalry = Math.max(bestAlt(s.egp.id, 'egp', s), bestAlt(s.eur.id, 'eur', s))
    out.push({
      egpId: s.egp.id, eurId: s.eur.id, rate: r4(s.rate), score: r2(s.score), daysLater: s.later, nameScore: r2(s.nameScore),
      confident: s.eur.kind !== 'topup' && s.score >= 0.8 && s.score - rivalry >= 0.15,
    })
  }
  return out
}

// ── customer payments ────────────────────────────────────────────────────────────────

export interface OrderRef {
  kind: 'checkout' | 'deal'
  id: string
  code: string | null
  customer: string
  /** every phone number we know for this customer: order phone, the number on the receipt */
  phones: string[]
  total: number
  deposit: number
  createdAt: string
}

export interface PaymentMatch {
  txId: string
  order: { kind: 'checkout' | 'deal'; id: string }
  expected: 'deposit' | 'full' | 'other'
  phoneMatched: boolean
  score: number
  confident: boolean
}

export function matchPayments(credits: MatchTx[], orders: OrderRef[], o: { windowDays?: number } = {}): PaymentMatch[] {
  const window = o.windowDays ?? 30
  const out: PaymentMatch[] = []
  for (const tx of credits) {
    if (tx.currency !== 'EGP' || tx.amount <= 0) continue
    const cands = orders.map((ord) => {
      const after = days(ord.createdAt.slice(0, 10), tx.date)
      if (after < -1 || after > window) return null
      const phone = !!tx.counterpartyPhone && ord.phones.includes(tx.counterpartyPhone)
      const expected: PaymentMatch['expected'] = Math.abs(tx.amount - ord.deposit) <= 1 && ord.deposit > 0 ? 'deposit'
        : Math.abs(tx.amount - ord.total) <= 1 && ord.total > 0 ? 'full' : 'other'
      if (expected === 'other' && !phone) return null
      const score = (phone ? 0.55 : 0) + (expected !== 'other' ? 0.35 : 0.05) + Math.max(0, 0.1 * (1 - after / window))
      return { ord, phone, expected, score }
    }).filter((c): c is NonNullable<typeof c> => c !== null && c.score >= 0.4).sort((a, b) => b.score - a.score)
    if (cands.length === 0) continue
    const [best, second] = cands
    out.push({
      txId: tx.id, order: { kind: best.ord.kind, id: best.ord.id }, expected: best.expected, phoneMatched: best.phone, score: r2(best.score),
      confident: best.phone && best.expected !== 'other' && best.score - (second?.score ?? 0) >= 0.15,
    })
  }
  return out
}
