import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'

vi.mock('@/lib/bank/pdf-text', () => ({ pdfToLines: async () => [] }))

import { changeDecision, confirmAllSuggested, decideMatch, importStatement, loadMatches, loadStatements, runMatching } from '../tax/bank-service'
import { loadLedger } from '../tax/service'

let db: FakeDb
const client = () => db as unknown as SupabaseClient
const bytes = (s: string) => new TextEncoder().encode(s)

const CIB_CSV = [
  'Date,Description,Debit,Credit,Balance',
  '16/08/2026,IPN Fund Transfer CIB Online FT262280WKHB PayeeName: SAMIR H....,"20,020.00",,"30,000.00"',
  '17/08/2026,IPN Inward FT26155KK6HY PayerMobNo:00201060074276 Payer Name: ALI HASSAN,,"15,750.00","45,750.00"',
].join('\n')

beforeEach(() => {
  db = new FakeDb()
  db.seed('tax_settings', [{ id: 1, owner_name: 'Karim Sabry' }])
})

describe('importStatement (bank CSV)', () => {
  it('saves the lines with their proof, sorts nothing it is unsure about, and ignores a second import', async () => {
    const r = await importStatement(client(), { name: 'cib.csv', bytes: bytes(CIB_CSV) }, 'cib')
    expect(r).toMatchObject({ kind: 'bank', ok: true, added: 2 })
    const rows = db.rows('bank_transactions')
    expect(rows.map((x) => [x.amount, x.currency, x.counterparty_phone, x.treatment])).toEqual([[-20020, 'EGP', null, 'unreviewed'], [15750, 'EGP', '01060074276', 'unreviewed']])
    const st = await loadStatements(client())
    expect(st).toHaveLength(1)
    expect(st[0]).toMatchObject({ bank: 'cib', verified: true, readDebit: [1, 20020], readCredit: [1, 15750] })

    const again = await importStatement(client(), { name: 'cib.csv', bytes: bytes(CIB_CSV) }, 'cib')
    expect(again).toMatchObject({ ok: true, added: 0, alreadyThere: 2 })
    expect(db.rows('bank_transactions')).toHaveLength(2)
    expect(db.rows('statement_imports')).toHaveLength(1)
  })

  it('applies an earlier business/private decision at import', async () => {
    db.seed('merchant_rules', [{ merchant_key: 'in:ali hassan', treatment: 'business' }])
    await importStatement(client(), { name: 'cib.csv', bytes: bytes(CIB_CSV) }, 'cib')
    expect(db.rows('bank_transactions').find((x) => x.amount === 15750)!.treatment).toBe('business')
  })

  it('refuses a file it cannot read and says why', async () => {
    const r = await importStatement(client(), { name: 'x.csv', bytes: bytes('a,b\n1,2') }, 'qnb')
    expect(r).toMatchObject({ kind: 'bank', ok: false })
    expect(r.kind === 'bank' && r.message).toMatch(/table header/)
    expect(db.rows('bank_transactions')).toHaveLength(0)
  })

  it('hands a Revolut CSV to the Revolut importer', async () => {
    const csv = 'Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance\nCard Payment,Current,2026-08-01 10:00:00,x,Amazon,-50.00,0.00,EUR,COMPLETED,950.00\n'
    const r = await importStatement(client(), { name: 'r.csv', bytes: bytes(csv) }, 'auto')
    expect(r.kind).toBe('revolut')
    expect(db.rows('bank_transactions')).toHaveLength(1)
  })

  it('tells you to run the migration when the tax tables are missing', async () => {
    db.failing.add('tax_settings')
    const r = await importStatement(client(), { name: 'cib.csv', bytes: bytes(CIB_CSV) }, 'cib')
    expect(r.kind === 'bank' && r.message).toMatch(/Supabase/)
  })
})

const ledgerTx = (over: Record<string, unknown>) => ({
  tx_hash: String(Math.random()), source: 'revolut', tx_date: '2026-08-16', amount: 0, fee: 0, currency: 'EUR', description: 'x', merchant_key: 'x', tx_type: 'Transfer',
  treatment: 'unreviewed', has_receipt: false, ...over,
})

describe('runMatching', () => {
  beforeEach(() => {
    db.seed('bank_transactions', [
      ledgerTx({ id: '00000000-0000-4000-8000-0000000000a1', source: 'cib', currency: 'EGP', amount: -29520, tx_date: '2026-08-19', description: 'IPN Fund Transfer', line_kind: 'ipn_out', counterparty_name: 'SAMIR H....' }),
      ledgerTx({ id: '00000000-0000-4000-8000-0000000000b1', currency: 'EUR', amount: 500, tx_date: '2026-08-19', description: 'Payment from AHMED SALAH', merchant_key: 'in:ahmed salah' }),
      ledgerTx({ id: '00000000-0000-4000-8000-0000000000c1', source: 'cib', currency: 'EGP', amount: 31500, tx_date: '2026-08-20', description: 'IPN Inward', line_kind: 'ipn_in', counterparty_phone: '01012345678' }),
    ])
    db.seed('checkout_orders', [{ id: 'order-1', code: 'PG-1', customer_name: 'Mona', phone: '+201012345678', total_egp: 63000, created_at: '2026-08-18T10:00:00Z', status: 'approved' }])
    db.seed('payment_receipts', [])
    db.seed('deals', [])
  })

  it('pairs the exchange and the customer payment, and applies the effects of the confident ones', async () => {
    const r = await runMatching(client())
    expect(r).toMatchObject({ ok: true, exchanges: 1, payments: 1 })
    const m = await loadMatches(client())
    expect(m.find((x) => x.kind === 'payment')).toMatchObject({ status: 'confirmed', expected: 'deposit', checkoutId: 'order-1' })
    expect(m.find((x) => x.kind === 'exchange')).toMatchObject({ rate: 59.04 })
    const t = (id: string) => db.rows('bank_transactions').find((x) => String(x.id).endsWith(id))!
    expect(t('c1').treatment).toBe('business')
    const ex = m.find((x) => x.kind === 'exchange')!
    if (ex.status === 'confirmed') expect(t('a1').treatment).toBe('internal')
  })

  it('never touches a decided match and does not suggest a rejected pair again', async () => {
    await runMatching(client())
    const ex = (await loadMatches(client())).find((x) => x.kind === 'exchange')!
    db.rows('tx_matches').find((x) => x.id === ex.id)!.status = 'rejected'
    await runMatching(client())
    const after = await loadMatches(client())
    expect(after.filter((x) => x.kind === 'exchange')).toHaveLength(1)
    expect(after.find((x) => x.id === ex.id)!.status).toBe('rejected')
  })

  it('a double click on Confirm acts once, and Confirm all confirms the suggestions', async () => {
    await runMatching(client())
    const ex = (await loadMatches(client())).find((x) => x.kind === 'exchange')!
    db.rows('tx_matches').find((x) => x.id === ex.id)!.status = 'suggested'
    expect((await decideMatch(client(), ex.id, 'confirmed')).ok).toBe(true)
    expect((await decideMatch(client(), ex.id, 'confirmed')).ok).toBe(false)
    db.rows('tx_matches').find((x) => x.id === ex.id)!.status = 'suggested'
    expect(await confirmAllSuggested(client())).toBe(1)
    expect((await decideMatch(client(), 'not-an-id', 'confirmed')).ok).toBe(false)
  })

  it('works from the ledger the Tax page loads', async () => {
    const l = await loadLedger(client())
    expect(l.ok && l.txs.find((t) => t.currency === 'EGP')).toMatchObject({ lineKind: expect.any(String) })
  })
})

describe('changeDecision', () => {
  it('moves every line of one shop and updates the rule, or forgets the decision', async () => {
    db.seed('bank_transactions', [ledgerTx({ merchant_key: 'out:amazon', treatment: 'business' }), ledgerTx({ merchant_key: 'out:amazon', treatment: 'business' }), ledgerTx({ merchant_key: 'out:amazon', treatment: 'internal' }), ledgerTx({ merchant_key: 'out:nike', treatment: 'business' })])
    db.seed('merchant_rules', [{ merchant_key: 'out:amazon', treatment: 'business' }])
    expect((await changeDecision(client(), 'out:amazon', 'personal')).ok).toBe(true)
    expect(db.rows('bank_transactions').map((x) => x.treatment)).toEqual(['personal', 'personal', 'internal', 'business'])
    expect(db.rows('merchant_rules')[0].treatment).toBe('personal')
    expect((await changeDecision(client(), 'out:amazon', 'unreviewed')).ok).toBe(true)
    expect(db.rows('merchant_rules')).toHaveLength(0)
    expect(db.rows('bank_transactions')[0].treatment).toBe('unreviewed')
    expect((await changeDecision(client(), 'bad key', 'personal')).ok).toBe(false)
  })
})
