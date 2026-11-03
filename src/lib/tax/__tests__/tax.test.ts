import { describe, expect, it } from 'vitest'
import { parseCsv, parseRevolut, merchantKey, ruleKey, displayName } from '../revolut'
import { initialTreatment, isInternal, suggest } from '../classify'
import { estimateTax, incomeTax } from '../estimate'
import { reviewQueue, steuerberaterCsv, summarize } from '../report'
import type { LedgerTx } from '../types'

const HEAD = 'Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance'
const csv = (...lines: string[]) => [HEAD, ...lines].join('\n')

describe('parseCsv', () => {
  it('handles quotes, commas inside quotes and CRLF', () => {
    expect(parseCsv('a,"b,c","d ""x"""\r\n1,2,3\r\n')).toEqual([['a', 'b,c', 'd "x"'], ['1', '2', '3']])
  })
})

describe('parseRevolut', () => {
  const file = csv(
    'Card Payment,Current,2026-08-01 10:00:00,2026-08-01 10:00:00,Amazon,-50.00,0.00,EUR,COMPLETED,950.00',
    'Card Payment,Current,2026-08-02 10:00:00,2026-08-02 10:00:00,Amazon,-20.00,0.00,EUR,REVERTED,950.00',
    'Card Payment,Current,2026-08-03 10:00:00,2026-08-03 10:00:00,eBay,-10.00,0.00,EUR,PENDING,940.00',
    'Transfer,Savings,2026-08-04 10:00:00,2026-08-04 10:00:00,To pocket EUR Travel from EUR,50.00,0.00,EUR,COMPLETED,50.00',
    'Transfer,Current,2026-08-05 10:00:00,2026-08-05 10:00:00,Transfer from ALI HASSAN,500.00,0.00,EUR,COMPLETED,1450.00',
    'Card Payment,Current,2026-08-06 10:00:00,2026-08-06 10:00:00,Vinted,-5.00,0.00,EUR,COMPLETED,1445.00',
    'Card Payment,Current,2026-08-06 10:00:00,2026-08-06 10:00:00,Vinted,-5.00,0.00,EUR,COMPLETED,1440.00',
  )
  const r = parseRevolut(file)

  it('keeps only completed current-account rows and counts what it skipped', () => {
    expect(r.transactions.map((t) => t.description)).toEqual(['Amazon', 'Transfer from ALI HASSAN', 'Vinted', 'Vinted'])
    expect(r.skipped).toEqual({ notCompleted: 2, savingsMirror: 1 })
    expect(r.problems).toEqual([])
  })
  it('gives two identical payments two different hashes, and the same hash on re-import', () => {
    const [a, b] = r.transactions.slice(2)
    expect(a.txHash).not.toBe(b.txHash)
    expect(parseRevolut(file).transactions.map((t) => t.txHash)).toEqual(r.transactions.map((t) => t.txHash))
  })
  it('detects a gap in the running balance', () => {
    expect(r.balanceBreaks).toBe(0)
    const broken = csv(
      'Card Payment,Current,2026-08-01 10:00:00,x,Amazon,-50.00,0.00,EUR,COMPLETED,950.00',
      'Card Payment,Current,2026-08-02 10:00:00,x,Amazon,-10.00,0.00,EUR,COMPLETED,700.00',
    )
    expect(parseRevolut(broken).balanceBreaks).toBe(1)
  })
  it('rejects a file that is not a Revolut statement', () => {
    expect(parseRevolut('a,b\n1,2').problems[0]).toMatch(/Revolut/)
  })
  it('normalises merchant and person names', () => {
    expect(merchantKey('Transfer from ALI  HASSAN')).toBe('ali hassan')
    expect(merchantKey('Payment from ALI HASSAN')).toBe('ali hassan')
    expect(merchantKey('Amazon')).toBe('amazon')
  })
  it('keeps money in and money out for the same name apart', () => {
    expect(ruleKey('Payment from RANA', 10)).toBe('in:rana')
    expect(ruleKey('To Rana', -10)).toBe('out:rana')
    expect(displayName('out:rana')).toBe('rana')
  })
})

describe('classify', () => {
  const tx = (description: string, amount: number, txType = 'Transfer') =>
    ({ txHash: description, source: 'revolut', date: '2026-08-01', amount, fee: 0, currency: 'EUR', description, merchantKey: ruleKey(description, amount), txType }) as const
  it('treats pockets, spare change and top-ups as internal', () => {
    for (const d of ['To pocket EUR Travel Fund from EUR', 'Pocket Withdrawal', 'Revpoints Spare change', 'Top-up by *4464']) {
      expect(isInternal(tx(d, 1), '')).toBe(true)
    }
  })
  it('treats transfers to the owner as internal, only when the owner name is set', () => {
    expect(isInternal(tx('To Karim Sabry', -5), 'Karim Sabry')).toBe(true)
    expect(isInternal(tx('To Karim Sabry', -5), '')).toBe(false)
    expect(isInternal(tx('To Someone Else', -5), 'Karim Sabry')).toBe(false)
  })
  it('suggests business for incoming person payments and known shops, personal otherwise', () => {
    expect(suggest(tx('Transfer from ALI HASSAN', 400)).treatment).toBe('business')
    expect(suggest(tx('Amazon', -30, 'Card Payment')).treatment).toBe('business')
    expect(suggest(tx('REWE.de', -30, 'Card Payment')).treatment).toBe('personal')
  })
  it('applies a saved merchant rule at import but leaves unknown ones unreviewed', () => {
    const rules = new Map<string, 'business' | 'personal' | 'internal'>([['out:amazon', 'business']])
    expect(initialTreatment(tx('Amazon', -3, 'Card Payment'), '', rules)).toBe('business')
    expect(initialTreatment(tx('Nike', -3, 'Card Payment'), '', rules)).toBe('unreviewed')
  })
})

describe('incomeTax (2026 tariff)', () => {
  it('is 0 up to the basic allowance and continuous across zone borders', () => {
    expect(incomeTax(12_348)).toBe(0)
    expect(Math.abs(incomeTax(17_800) - incomeTax(17_799))).toBeLessThanOrEqual(2)
    expect(Math.abs(incomeTax(69_879) - incomeTax(69_878))).toBeLessThanOrEqual(2)
    expect(Math.abs(incomeTax(277_826) - incomeTax(277_825))).toBeLessThanOrEqual(8)
  })
  it('matches the known level of about 20% to 25% at 50,000 EUR', () => {
    const t = incomeTax(50_000)
    expect(t).toBeGreaterThan(9_500)
    expect(t).toBeLessThan(11_500)
  })
})

describe('estimateTax', () => {
  const base = { turnover: 20_000, priorYearTurnover: 0, salaryTaxable: 45_000, hebesatzPct: 450 }
  it('charges nothing on zero profit', () => {
    const e = estimateTax({ ...base, profit: 0 })
    expect(e.totalTax).toBe(0)
    expect(e.reservePct).toBeNull()
  })
  it('has no trade tax under the 24,500 allowance and taxes the profit at the top slice of the salary', () => {
    const e = estimateTax({ ...base, profit: 5_000 })
    expect(e.tradeTax).toBe(0)
    expect(e.incomeTaxExtra).toBe(incomeTax(50_000) - incomeTax(45_000))
    expect(e.mustFile).toBe(true)
  })
  it('credits trade tax against income tax so a large profit is not taxed twice', () => {
    const e = estimateTax({ ...base, turnover: 80_000, profit: 40_000 })
    expect(e.tradeTax).toBeGreaterThan(0)
    expect(e.tradeTaxCredit).toBeGreaterThan(0)
    expect(e.tradeTaxCredit).toBeLessThanOrEqual(incomeTax(85_000) - incomeTax(45_000))
  })
  it('flags the small-business limits', () => {
    expect(estimateTax({ ...base, profit: 1 }).kleinunternehmer.eligible).toBe(true)
    expect(estimateTax({ ...base, priorYearTurnover: 30_000, profit: 1 }).kleinunternehmer.eligible).toBe(false)
    expect(estimateTax({ ...base, turnover: 120_000, profit: 1 }).kleinunternehmer.eligible).toBe(false)
  })
})

describe('report', () => {
  const mk = (over: Partial<LedgerTx>): LedgerTx => ({
    id: 'i', txHash: 'h', source: 'revolut', date: '2026-08-01', amount: 0, fee: 0, currency: 'EUR',
    description: 'x', merchantKey: 'x', txType: 'Card Payment', treatment: 'business', hasReceipt: false, note: null, ...over,
  })
  const data = [
    mk({ id: '1', amount: 500, description: 'Transfer from ALI', merchantKey: 'ali', txType: 'Transfer' }),
    mk({ id: '2', amount: -100, description: 'Amazon', merchantKey: 'amazon', hasReceipt: true }),
    mk({ id: '3', amount: -40, description: 'Amazon', merchantKey: 'amazon' }),
    mk({ id: '4', amount: -30, description: 'REWE', merchantKey: 'rewe', treatment: 'personal' }),
    mk({ id: '5', amount: -999, description: 'To pocket', merchantKey: 'pocket', treatment: 'internal' }),
    mk({ id: '6', amount: -25, description: 'Nike', merchantKey: 'nike', treatment: 'unreviewed' }),
    mk({ id: '7', amount: -77, description: 'Old', merchantKey: 'old', date: '2025-12-31' }),
  ]
  it('counts only business lines of the chosen year', () => {
    const s = summarize(data, 2026)
    expect(s.income).toBe(500)
    expect(s.expenses).toBe(140)
    expect(s.profit).toBe(360)
    expect(s.expensesWithoutReceipt).toBe(1)
    expect(s.unreviewedCount).toBe(1)
    expect(s.unreviewedOut).toBe(25)
    expect(s.expenseGroups[0]).toMatchObject({ merchant: 'amazon', total: 140, count: 2, withoutReceipt: 1 })
  })
  it('adds the fee to the expense', () => {
    expect(summarize([mk({ amount: -10, fee: 1 })], 2026).expenses).toBe(11)
  })
  it('builds the review queue per merchant and direction', () => {
    expect(reviewQueue(data, 2026)).toEqual([{ merchant: 'nike', count: 1, total: 25, sample: 'Nike', direction: 'out', currency: 'EUR' }])
  })
  it('exports a German Excel CSV with BOM, decimal commas, missing receipts marked, and the totals', () => {
    const out = steuerberaterCsv(data, 2026)
    expect(out.startsWith('﻿Datum;')).toBe(true)
    expect(out).toContain('2026-08-01;Transfer from ALI;500,00;;EUR;;')
    expect(out).toContain(';;40,00;EUR;NEIN;')
    expect(out).toContain('Gewinn (Einnahmen minus Ausgaben);;360,00')
    expect(out).not.toContain('REWE')
    expect(out).not.toContain('Old')
  })
})
