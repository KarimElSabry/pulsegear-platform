import { describe, expect, it } from 'vitest'
import { normalizeEgPhone, parseAmount, parseBankDate } from '../dates'
import { linesFromLayoutText } from '../pdf-lines'
import { parseCibLines } from '../cib-pdf'
import { parseBankCsv, parseGenericPdfLines } from '../generic'
import { matchExchanges, type MatchTx } from '../match'
import { parseBankCsvAuto, parseBankPdfLines } from '../index'

describe('dates and numbers', () => {
  it('reads the date styles of Egyptian banks, day first', () => {
    expect(parseBankDate('30JUN26')).toBe('2026-06-30')
    expect(parseBankDate('30-Jun-2026')).toBe('2026-06-30')
    expect(parseBankDate('03/04/2026')).toBe('2026-04-03')
    expect(parseBankDate('2026-06-30 10:00:00')).toBe('2026-06-30')
    expect(parseBankDate('31/02/2026')).toBeNull()
    expect(parseBankDate('hello')).toBeNull()
  })
  it('reads amounts with commas, brackets, signs and CR/DR', () => {
    expect(parseAmount('1,234.50')).toBe(1234.5)
    expect(parseAmount('1.234,50')).toBe(1234.5)
    expect(parseAmount('(50.00)')).toBe(-50)
    expect(parseAmount('-50.00')).toBe(-50)
    expect(parseAmount('50.00 DR')).toBe(-50)
    expect(parseAmount('2,805.00 CR')).toBe(2805)
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('')).toBeNull()
  })
  it('normalises Egyptian mobile numbers however the bank writes them', () => {
    for (const p of ['00201060074276', '+201060074276', '201060074276', '01060074276', '1060074276']) expect(normalizeEgPhone(p)).toBe('01060074276')
    expect(normalizeEgPhone('0020100102')).toBeNull()
    expect(normalizeEgPhone('12345')).toBeNull()
    expect(normalizeEgPhone(null)).toBeNull()
  })
})

// A CIB-like page built with the same columns as the real statement: date | description | debit | credit | balance.
const row = (date: string, desc: string, debit = '', credit = '', balance = '') =>
  '   ' + date.padEnd(33) + desc.padEnd(60) + debit.padStart(11).padEnd(20) + credit.padStart(11).padEnd(26) + balance
const cont = (t: string) => ' '.repeat(36) + t
const header = ['   Name:          X', '   Date                   30JUN26                       Customer ID      1402622568', '   Account Name           TEST USER                     Account Number   100036489628', '   Currency               EGP - Egyptian Pound          IBAN             EG17001000120000010003648962', '']
const footer = ['* Post value dated amounts must not be utilized prior to their maturity dates.', '']
const control = (o: string, dc: number, ds: string, cc: number, cs: string, c: string) =>
  `       ${o} CR${' '.repeat(18)}${dc}${' '.repeat(28)}${ds}${' '.repeat(10)}${cc}${' '.repeat(17)}${cs}${' '.repeat(16)}${c} CR`

const month = (over: { debits?: string; credits?: string } = {}) => [
  ...header,
  row('31MAY26', 'OPENING BALANCE', '', '', '1,000.00'),
  row('01JUN26', 'Online Transfer FT26152GZFR8\\BNK -', '200.00', '', ''), cont('living expenses'),
  row('04JUN26', 'IPN Inward FT26155KK6HY\\BNK', '', '630.00', '1,430.00'), cont('PayerMobNo:00201060074276 Payer'), cont('Name: RANA AHMED IBRAHIM ALY'), cont('Living Expe'),
  row('05JUN26', 'IPN Fund Transfer CIB Online', '20,020.00', '', '1,000.00'), cont('FT26156ABCDE\\BNK PayeeName: SAMIR H....'),
  ...footer, ...header,
  row('09JUN26', 'POS PURCHASE FT26160XXXXX\\BNK My', '30.00', '', '970.00'), cont('fawry Cairo EG'),
  '', cont('CLOSING BALANCE').padEnd(130) + '970.00', '',
  control('1,000.00', 3, over.debits ?? '20,250.00', 1, over.credits ?? '630.00', '970.00').replace('970.00 CR', '970.00 CR'),
  ...footer,
].join('\n')

describe('CIB PDF statement', () => {
  it('reads every payment, decides debit or credit from the column, and proves it with the bank totals', () => {
    const text = [
      ...header,
      row('31MAY26', 'OPENING BALANCE', '', '', '30,000.00'),
      row('01JUN26', 'Online Transfer FT26152GZFR8\\BNK -', '200.00'), cont('living expenses'),
      row('04JUN26', 'IPN Inward FT26155KK6HY\\BNK', '', '630.00', '30,430.00'), cont('PayerMobNo:00201060074276 Payer'), cont('Name: RANA AHMED IBRAHIM ALY'), cont('Living Expe'),
      row('05JUN26', 'IPN Fund Transfer CIB Online', '20,020.00', '', '10,410.00'), cont('FT26156ABCDE\\BNK PayeeName: SAMIR H....'),
      ...footer, ...header,
      row('09JUN26', 'POS PURCHASE FT26160XXXXX\\BNK My', '30.00', '', '10,380.00'), cont('fawry Cairo EG'),
      '', ' '.repeat(36) + 'CLOSING BALANCE'.padEnd(94) + '10,380.00', '',
      control('30,000.00', 3, '20,250.00', 1, '630.00', '10,380.00'),
      ...footer,
    ].join('\n')
    const r = parseCibLines(linesFromLayoutText(text))
    expect(r.problems).toEqual([])
    expect(r.transactions.map((t) => [t.date, t.amount])).toEqual([['2026-06-01', -200], ['2026-06-04', 630], ['2026-06-05', -20020], ['2026-06-09', -30]])
    const [t1, t2, t3] = r.transactions
    expect(t1).toMatchObject({ reference: 'FT26152GZFR8', kind: 'transfer', account: '100036489628', currency: 'EGP' })
    expect(t1.description).toContain('living expenses')
    expect(t2).toMatchObject({ kind: 'ipn_in', counterpartyPhone: '01060074276', counterpartyName: 'RANA AHMED IBRAHIM ALY', reference: 'FT26155KK6HY' })
    expect(t3).toMatchObject({ kind: 'ipn_out', counterpartyName: 'SAMIR H....' })
    expect(r.statements).toHaveLength(1)
    expect(r.statements[0]).toMatchObject({ verified: true, opening: 30000, closing: 10380, readDebitCount: 3, readDebitTotal: 20250, readCreditCount: 1, readCreditTotal: 630 })
  })

  it('says NOT verified when the bank totals do not match what was read (a missed line)', () => {
    const text = month({ debits: '21,000.00' })
    const r = parseCibLines(linesFromLayoutText(text))
    expect(r.statements[0].verified).toBe(false)
    expect(r.problems.join(' ')).toMatch(/does not equal closing|bank says/)
  })

  it('finds nothing and says so for a PDF that is not a CIB statement', () => {
    const r = parseCibLines(linesFromLayoutText('hello world\nnothing here'))
    expect(r.transactions).toHaveLength(0)
    expect(r.problems[0]).toMatch(/No CIB transactions/)
  })
})

describe('bank CSV (CIB or QNB export)', () => {
  it('reads debit/credit columns with a balance and proves the balance chain', () => {
    const csv = ['Account statement', 'Date,Description,Debit,Credit,Balance', '01/06/2026,Online Transfer,200.00,,9800.00', '04/06/2026,IPN Inward PayerMobNo:00201060074276 Payer Name: RANA AHMED,,630.00,"10,430.00"', 'Total,,200.00,630.00,'].join('\n')
    const r = parseBankCsv(csv, 'cib')
    expect(r.transactions.map((t) => [t.date, t.amount, t.balance])).toEqual([['2026-06-01', -200, 9800], ['2026-06-04', 630, 10430]])
    expect(r.transactions[1]).toMatchObject({ counterpartyPhone: '01060074276', kind: 'ipn_in' })
    expect(r.statements[0]).toMatchObject({ verified: true, opening: 10000, closing: 10430 })
  })
  it('reads a signed Amount column with Arabic headings (QNB style) and flags a broken balance chain', () => {
    const csv = ['التاريخ,البيان,المبلغ,الرصيد', '01-06-2026,تحويل,-500.00,9500.00', '02-06-2026,ايداع,1000.00,11000.00'].join('\n')
    const r = parseBankCsv(csv, 'qnb')
    expect(r.transactions.map((t) => t.amount)).toEqual([-500, 1000])
    expect(r.statements[0].verified).toBe(false)
    expect(r.problems[0]).toMatch(/balance does not follow/)
  })
  it('without a balance column it still imports but says completeness is not proven', () => {
    const r = parseBankCsv('Date,Details,Amount\n01/06/2026,Shop,-50.00\n02/06/2026,Refund,20.00', 'other')
    expect(r.transactions).toHaveLength(2)
    expect(r.statements[0].verified).toBe(false)
    expect(r.statements[0].note).toMatch(/not be proven/)
  })
  it('explains itself when it cannot find a table', () => {
    expect(parseBankCsv('a,b\n1,2', 'cib').problems[0]).toMatch(/Could not find the table header/)
  })
  it('recognises a Revolut file and leaves it to the Revolut importer', () => {
    expect(parseBankCsvAuto('Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance\n', 'auto').source).toBe('revolut')
  })
})

describe('generic PDF (a bank we have not seen)', () => {
  const text = [
    'QNB Statement',
    '  Date          Description                              Debit          Credit           Balance',
    '  01/06/2026    Transfer to Ali                          200.00                          9,800.00',
    '                Rent',
    '  04/06/2026    Deposit 01060074276                                     630.00           10,430.00',
  ].join('\n')
  it('places amounts under the Debit / Credit / Balance headings and proves them with the balances', () => {
    const r = parseBankPdfLines(linesFromLayoutText(text), 'auto')
    expect(r.source).toBe('qnb')
    expect(r.result.transactions.map((t) => [t.amount, t.balance])).toEqual([[-200, 9800], [630, 10430]])
    expect(r.result.transactions[0].description).toContain('Rent')
    expect(r.result.transactions[1].counterpartyPhone).toBe('01060074276')
    expect(r.result.statements[0].verified).toBe(true)
  })
  it('refuses to guess without the headings', () => {
    expect(parseGenericPdfLines(linesFromLayoutText('01/06/2026 Something 5.00'), 'other').problems[0]).toMatch(/Debit \/ Credit \/ Balance/)
  })
})

describe('matchExchanges confidence', () => {
  const egp = (id: string, date: string, amount: number): MatchTx => ({ id, date, amount, currency: 'EGP', description: 'Instapay', counterpartyName: 'SAMIR H', counterpartyPhone: null, kind: 'out', treatment: 'unreviewed' })
  const eur = (id: string, date: string, amount: number): MatchTx => ({ id, date, amount, currency: 'EUR', description: 'Transfer from SAMIR HASSAN', counterpartyName: null, counterpartyPhone: null, kind: 'TRANSFER', treatment: 'unreviewed' })

  it('a clean single pair is confident', () => {
    const r = matchExchanges([egp('g1', '2026-03-08', -50000)], [eur('e1', '2026-03-08', 1000)])
    expect(r).toHaveLength(1)
    expect(r[0].confident).toBe(true)
  })
  it('two look-alike candidates are matched but never confident', () => {
    const r = matchExchanges([egp('g1', '2026-03-08', -50000)], [eur('e1', '2026-03-08', 1000), eur('e2', '2026-03-08', 1001)])
    expect(r).toHaveLength(1)
    expect(r[0].confident).toBe(false)
  })
})
