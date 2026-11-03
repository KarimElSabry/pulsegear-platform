import { describe, expect, it } from 'vitest'
import { buildPackage, type MatchLite, type PackageInput, type SaleLite, type StatementLite } from '../package'
import type { LedgerTx } from '../types'

const tx = (o: Partial<LedgerTx> & { id: string; date: string; amount: number }): LedgerTx => ({
  bank: 'revolut', currency: 'EUR', description: 'x', merchantKey: 'out:amazon', reference: null, counterpartyName: null, counterpartyPhone: null,
  treatment: 'business', hasReceipt: true, note: null, ...o,
} as unknown as LedgerTx)

const txs: LedgerTx[] = [
  tx({ id: 'e1', date: '2026-03-10', amount: 1000, merchantKey: 'in:ali' }),
  tx({ id: 'e2', date: '2026-03-12', amount: -200, hasReceipt: false }),
  tx({ id: 'g1', date: '2026-03-08', amount: -50000, currency: 'EGP', bank: 'cib', treatment: 'internal', counterpartyName: 'SAMIR', description: 'Instapay' }),
  tx({ id: 'g2', date: '2026-03-01', amount: 20000, currency: 'EGP', bank: 'cib', treatment: 'business', counterpartyPhone: '0100' }),
  tx({ id: 'g3', date: '2026-03-02', amount: 500, currency: 'EGP', bank: 'qnb', treatment: 'unreviewed' }),
  tx({ id: 'old', date: '2025-12-30', amount: 99, treatment: 'business' }),
]
const matches: MatchLite[] = [
  { id: 'm1', kind: 'exchange', status: 'confirmed', auto: true, egpTxId: 'g1', eurTxId: 'e1', checkoutId: null, dealId: null, expected: null, rate: 50 },
  { id: 'm2', kind: 'payment', status: 'confirmed', auto: false, egpTxId: 'g2', eurTxId: null, checkoutId: 'c1', dealId: null, expected: 'deposit', rate: null },
  { id: 'm3', kind: 'payment', status: 'suggested', auto: false, egpTxId: 'g3', eurTxId: null, checkoutId: null, dealId: null, expected: 'full', rate: null },
]
const statements: StatementLite[] = [
  { bank: 'cib', account: '9628', currency: 'EGP', from: '2026-03-01', to: '2026-03-31', opening: 0, closing: 1, bankDebit: [1, 50000], bankCredit: [1, 20000], readDebit: [1, 50000], readCredit: [1, 20000], verified: true, note: '' },
  { bank: 'qnb', account: '1111', currency: 'EGP', from: null, to: null, opening: null, closing: null, bankDebit: [null, null], bankCredit: [null, null], readDebit: [0, 0], readCredit: [0, 0], verified: false, note: 'no control totals' },
]
const sales: SaleLite[] = [
  { source: 'website', code: 'PG-1', date: '2026-03-01', customer: 'Ali', items: 'Watch x1', totalEgp: 40000, depositEgp: 20000, depositStatus: 'Bankeingang bestaetigt', bankDate: '2026-03-01', bankAmount: 20000, status: 'active', deliveredAt: null, checkoutId: 'c1', dealId: null },
  { source: 'manual', code: 'PG-0', date: '2025-01-01', customer: 'Old', items: 'x', totalEgp: 1, depositEgp: 1, depositStatus: '', bankDate: null, bankAmount: null, status: 'completed', deliveredAt: null, checkoutId: null, dealId: 'd0' },
]
const input: PackageInput = { year: 2026, generatedOn: '2026-11-03', txs, statements, matches, sales, settings: { ownerName: 'X', salaryTaxableEur: 40000, hebesatzPct: 440, priorYearTurnover: 0 } }
const files = buildPackage(input)
const get = (n: string) => files.find((f) => f.name === n)!.data as string

describe('buildPackage', () => {
  it('creates all nine files', () => {
    expect(files.map((f) => f.name)).toEqual(['00-README.txt', '01-zusammenfassung.txt', '02-einnahmen-ausgaben.csv', '03-waehrungsumtausch.csv', '04-kundenzahlungen-egp.csv', '05-verkaeufe.csv', '06-kontoauszuege-pruefung.csv', '07-offene-punkte.csv', '08-bankumsaetze-egp.csv'])
  })
  it('shows the realized exchange rate and both income views', () => {
    const s = get('01-zusammenfassung.txt')
    expect(s).toContain('50,00 EGP je EUR')
    expect(s).toContain('20000,00 EGP')
    expect(s).toContain('400,00 EUR')
  })
  it('exchange file pairs EGP and EUR with the rate', () => {
    expect(get('03-waehrungsumtausch.csv')).toContain('2026-03-08;50000,00;2026-03-10;1000,00;50,0000')
  })
  it('links customer payment to its order and leaves out other years', () => {
    expect(get('04-kundenzahlungen-egp.csv')).toContain('PG-1;Anzahlung;geschaeftlich')
    expect(get('05-verkaeufe.csv')).toContain('PG-1')
    expect(get('05-verkaeufe.csv')).not.toContain('PG-0')
  })
  it('lists open points: missing receipt, undecided line, unconfirmed match, unproven statement', () => {
    const o = get('07-offene-punkte.csv')
    expect(o).toContain('Beleg fehlt')
    expect(o).toContain('Buchung nicht zugeordnet')
    expect(o).toContain('Kundenzahlung-Zuordnung unbestaetigt')
    expect(o).toContain('Kontoauszug nicht nachgewiesen')
  })
  it('statement proof table marks verified and unverified', () => {
    const p = get('06-kontoauszuege-pruefung.csv')
    expect(p).toContain(';ja;')
    expect(p).toContain('NEIN')
  })
})
