// src/app/admin/tax/page.tsx
// Tax tracker: import the bank statement, decide business or private once per shop/person, see profit and the estimated tax.

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { estimateTax } from '@/lib/tax/estimate'
import { displayName } from '@/lib/tax/revolut'
import { inYear, reviewQueue, summarize } from '@/lib/tax/report'
import { loadLedger, loadSettings } from '@/lib/tax/service'
import { loadMatches, loadStatements } from '@/lib/tax/bank-service'
import type { LedgerTx } from '@/lib/tax/types'
import { changeDecisionAction, confirmAllMatchesAction, decideMatchAction, decideMerchant, toggleReceipt } from './actions'
import { FindMatchesForm, ImportForm, SettingsForm } from './TaxForms'

export const dynamic = 'force-dynamic'

const money = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const th = 'text-left text-xs font-semibold text-zinc-400 px-3 py-2 whitespace-nowrap'
const td = 'px-3 py-2 text-sm text-zinc-200'
const card = 'rounded-2xl border border-zinc-800 bg-zinc-900 p-5'

const eur2 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const BADGE = { ok: 'bg-green-900/40 text-green-200', warn: 'bg-amber-900/40 text-amber-200' }

const QUESTIONS = [
  'Do I need to register a Gewerbe (trade) for buying and reselling goods to Egypt? (usually yes once it is regular and for profit)',
  'Can I use the small-business VAT rule (Kleinunternehmer), and what do I show on invoices?',
  'Sales to customers in Egypt: what proof of export do you need from me?',
  'The money exchange through WhatsApp: how should I record it? Which date and which rate count?',
  'Is the 50% deposit taxable income when I receive it in Egypt, or only when the order is delivered?',
  'Which of my Revolut and CIB accounts may stay mixed with private money, or do I need a separate business account?',
  'Which receipts and chats must I keep, and for how long? (usually 8 years)',
  'Do I need advance tax payments (Vorauszahlungen) next year?',
]

export default async function TaxPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  await assertAdmin()
  const db = createAdminSupabaseClient()
  const { ready, settings } = await loadSettings(db)
  const ledger = ready ? await loadLedger(db) : { ok: false as const }

  if (!ready || !ledger.ok) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-3">Tax tracker</h1>
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-4 text-sm">
          Run supabase/migrations/20261101_01_tax_tracker.sql in the Supabase SQL editor, then reload this page.
        </p>
      </div>
    )
  }

  const txs = ledger.txs
  const params = await searchParams
  const thisYear = new Date().getFullYear()
  const years = [...new Set([thisYear, ...txs.map((t) => Number(t.date.slice(0, 4)))])].sort((a, b) => b - a)
  const typed = Number(params.year)
  const year = years.includes(typed) ? typed : years[0]

  const statements = await loadStatements(db)
  const matches = await loadMatches(db)
  const byId = new Map<string, LedgerTx>(txs.map((t) => [t.id, t]))
  const exchanges = matches.filter((m) => m.kind === 'exchange' && m.status !== 'rejected')
  const payments = matches.filter((m) => m.kind === 'payment' && m.status !== 'rejected')
  const suggested = matches.filter((m) => m.status === 'suggested')
  const confirmedEx = exchanges.filter((m) => m.status === 'confirmed')
  const exEgp = confirmedEx.reduce((sum, m) => sum + Math.abs(byId.get(m.egpTxId)?.amount ?? 0), 0)
  const exEur = confirmedEx.reduce((sum, m) => sum + (m.eurTxId ? byId.get(m.eurTxId)?.amount ?? 0 : 0), 0)
  const decided = [...txs.filter((t) => inYear(t, year) && (t.treatment === 'business' || t.treatment === 'personal')).reduce((map, t) => {
    const k = `${t.currency}|${t.merchantKey}`
    const g = map.get(k) ?? { key: t.merchantKey, currency: t.currency, treatment: t.treatment, count: 0, total: 0 }
    g.count++; g.total += Math.abs(t.amount)
    return map.set(k, g)
  }, new Map<string, { key: string; currency: string; treatment: string; count: number; total: number }>()).values()].sort((a, b) => b.total - a.total).slice(0, 80)
  const s = summarize(txs, year)
  const est = estimateTax({ profit: s.profit, turnover: s.income, priorYearTurnover: settings.priorYearTurnover, salaryTaxable: settings.salaryTaxableEur, hebesatzPct: settings.hebesatzPct })
  const queue = reviewQueue(txs, year)
  const bizOut = txs.filter((t) => inYear(t, year) && t.treatment === 'business' && t.currency === 'EUR' && t.amount < 0).sort((a, b) => b.date.localeCompare(a.date))
  const bizIn = txs.filter((t) => inYear(t, year) && t.treatment === 'business' && t.currency === 'EUR' && t.amount > 0).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">🧾 Tax tracker</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Upload your Revolut, CIB and QNB statements. Each one is checked against the bank&apos;s own totals, moves between your own pockets are sorted automatically, and payments are matched to each other and to your orders. You only say once per shop or person whether it is business or private.
          Profit = business money in minus business money out, counted when the money moves (the German EÜR method).
        </p>
        <nav className="mt-3 flex gap-2 text-sm" aria-label="Year">
          {years.map((y) => (
            <a key={y} href={`/admin/tax?year=${y}`} className={`px-3 py-1 rounded-lg ${y === year ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>{y}</a>
          ))}
        </nav>
      </header>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-bold text-white">1. Import a statement</h2>
        <p className="text-sm text-zinc-400">
          <b>Revolut:</b> Accounts, Statement, Excel/CSV, EUR. <b>CIB / QNB:</b> the PDF statement or the CSV/Excel export from online banking (CSV is the most reliable).
          Importing the same period twice is safe, duplicates are skipped.
        </p>
        <ImportForm />
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-bold text-white">Statements we have read</h2>
        <p className="text-sm text-zinc-400">
          This is your proof for the Steuerberater that nothing is missing: the bank&apos;s own totals next to what we read. Anything marked <b>not proven</b> needs a look.
        </p>
        {statements.length === 0 ? <p className="text-sm text-zinc-500">No CIB or QNB statement imported yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead><tr><th className={th}>Bank</th><th className={th}>Period</th><th className={th}>Opening → closing</th><th className={th}>Debits (bank / read)</th><th className={th}>Credits (bank / read)</th><th className={th}>Check</th></tr></thead>
              <tbody className="divide-y divide-zinc-800">
                {statements.map((st) => (
                  <tr key={st.id} title={st.note}>
                    <td className={td}>{st.bank.toUpperCase()} <span className="text-xs text-zinc-500">{st.account.slice(-4)}</span></td>
                    <td className={td}>{st.from} to {st.to}</td>
                    <td className={td}>{st.opening !== null ? eur2(st.opening) : '?'} → {st.closing !== null ? eur2(st.closing) : '?'} {st.currency}</td>
                    <td className={td}>{st.bankDebit[0] !== null ? `${st.bankDebit[0]} / ${eur2(st.bankDebit[1] ?? 0)}` : 'not printed'} · {st.readDebit[0]} / {eur2(st.readDebit[1])}</td>
                    <td className={td}>{st.bankCredit[0] !== null ? `${st.bankCredit[0]} / ${eur2(st.bankCredit[1] ?? 0)}` : 'not printed'} · {st.readCredit[0]} / {eur2(st.readCredit[1])}</td>
                    <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.verified ? BADGE.ok : BADGE.warn}`}>{st.verified ? '✓ proven complete' : 'not proven'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`${card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">Matches: exchanges and customer payments</h2>
          <FindMatchesForm />
        </div>
        <p className="text-sm text-zinc-400">
          <b>Exchanges:</b> the EGP you sent out of CIB/QNB paired with the euros that reached Revolut a few days before or after, with the real rate you got.
          <b> Customer payments:</b> money that reached your account paired with the order it pays for (by the payer&apos;s phone number and the amount).
          Clear matches are confirmed for you; unclear ones wait here for one click.
        </p>
        {confirmedEx.length > 0 && <p className="text-sm text-zinc-300">Confirmed exchanges: {confirmedEx.length} · {eur2(exEgp)} EGP became {eur2(exEur)} EUR · average rate <b className="text-white">{exEur > 0 ? (exEgp / exEur).toFixed(2) : '-'}</b></p>}
        {suggested.length > 0 && (
          <form action={confirmAllMatchesAction}>
            <button className="bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">Confirm all {suggested.length} suggestion(s)</button>
          </form>
        )}
        {[...exchanges, ...payments].length === 0 ? <p className="text-sm text-zinc-500">No matches yet. Import a CIB/QNB statement and a Revolut statement that overlap.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead><tr><th className={th}>Type</th><th className={th}>Bank line (EGP)</th><th className={th}>Matched with</th><th className={th}>Rate / amount</th><th className={th}>Status</th><th className={th}></th></tr></thead>
              <tbody className="divide-y divide-zinc-800">
                {[...exchanges, ...payments].sort((a, b) => (byId.get(a.egpTxId)?.date ?? '').localeCompare(byId.get(b.egpTxId)?.date ?? '')).map((m) => {
                  const e = byId.get(m.egpTxId)
                  const u = m.eurTxId ? byId.get(m.eurTxId) : null
                  return (
                    <tr key={m.id}>
                      <td className={td}>{m.kind === 'exchange' ? 'Exchange' : 'Customer payment'}</td>
                      <td className={td}>{e?.date} · {e ? eur2(Math.abs(e.amount)) : '?'} {e?.amount && e.amount < 0 ? 'out' : 'in'}</td>
                      <td className={`${td} max-w-xs truncate`}>{m.kind === 'exchange' ? (u ? `${u.date} · €${eur2(u.amount)} · ${u.description}` : '?') : (m.expected === 'deposit' ? 'order deposit' : m.expected === 'full' ? 'order, paid in full' : 'order') + ' ' + (m.checkoutId ? 'online' : 'manual') + (e?.counterpartyPhone ? ` · from ${e.counterpartyPhone}` : '')}</td>
                      <td className={td}>{m.kind === 'exchange' ? `${m.rate?.toFixed(2)} EGP/EUR` : `${Math.round(m.score * 100)}%`}</td>
                      <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.status === 'confirmed' ? BADGE.ok : BADGE.warn}`}>{m.status === 'confirmed' ? (m.auto ? 'confirmed automatically' : 'confirmed') : 'please check'}</span></td>
                      <td className={`${td} whitespace-nowrap`}>
                        <form action={decideMatchAction} className="flex gap-2">
                          <input type="hidden" name="match_id" value={m.id} />
                          {m.status !== 'confirmed' && <button name="decision" value="confirmed" className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">Confirm</button>}
                          <button name="decision" value="rejected" className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">Wrong</button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-white mb-3">2. {year} so far</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Business income" value={`€${money(s.income)}`} sub={`${s.incomeCount} payments`} />
          <Stat label="Business expenses" value={`€${money(s.expenses)}`} />
          <Stat label="Profit" value={`€${money(s.profit)}`} />
          <Stat label="Estimated extra tax" value={`€${money(est.totalTax)}`} sub={est.reservePct !== null ? `put aside about ${est.reservePct}% of profit` : undefined} />
        </div>
        {s.unreviewedCount > 0 && (
          <p className="mt-4 text-sm text-amber-300">
            {s.unreviewedCount} transactions are not decided yet (€{money(s.unreviewedIn)} in, €{money(s.unreviewedOut)} out). The numbers above exclude them.
          </p>
        )}
        <ul className="mt-4 text-xs text-zinc-400 list-disc pl-5 space-y-1">
          <li>Income tax part €{money(est.incomeTaxExtra)} · solidarity €{money(est.soliExtra)} · trade tax €{money(est.tradeTax)} (credited against income tax: €{money(est.tradeTaxCredit)})</li>
          <li>{est.kleinunternehmer.reason}</li>
          {est.mustFile && <li>A tax return is required because the side income is above 410 EUR.</li>}
          {est.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </section>

      {queue.length > 0 && (
        <section className={`${card} space-y-3`}>
          <h2 className="text-lg font-bold text-white">Decide: business or private? ({queue.length})</h2>
          <p className="text-sm text-zinc-400">One click decides every line of that shop or person, and is remembered for future imports. Business money in is income, business money out is an expense.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr><th className={th}>Who</th><th className={th}>Direction</th><th className={th}>Lines</th><th className={th}>Total</th><th className={th}></th></tr></thead>
              <tbody className="divide-y divide-zinc-800">
                {queue.map((q) => {
                  const key = `${q.currency}|${q.direction}:${q.merchant.replace(/^(in|out):/, '')}`
                  return (
                    <tr key={key}>
                      <td className={`${td} max-w-xs truncate`} title={q.sample}>{displayName(q.merchant)}</td>
                      <td className={td}>{q.direction === 'in' ? 'money in' : 'money out'}</td>
                      <td className={td}>{q.count}</td>
                      <td className={td}>{q.currency === 'EUR' ? '€' : ''}{money(q.total)}{q.currency === 'EUR' ? '' : ` ${q.currency}`}</td>
                      <td className={`${td} whitespace-nowrap`}>
                        <form action={decideMerchant} className="flex gap-2">
                          <input type="hidden" name="key" value={q.merchant} />
                          <button name="treatment" value="business" className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">Business</button>
                          <button name="treatment" value="personal" className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">Private</button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={`${card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">Business expenses and receipts</h2>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/admin/tax/package?year=${year}`} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">Download the full package for the Steuerberater ({year}, ZIP)</a>
            <a href={`/api/admin/tax/export?year=${year}`} className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">Only the income/expense list (CSV)</a>
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          Every expense needs a receipt (Beleg): the order confirmation or invoice PDF. Mark it once you have saved it, and write where in the note.
          {s.expensesWithoutReceipt > 0 && <b className="text-amber-300"> {s.expensesWithoutReceipt} still without receipt.</b>}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead><tr><th className={th}>Date</th><th className={th}>Description</th><th className={th}>Amount</th><th className={th}>Receipt</th></tr></thead>
            <tbody className="divide-y divide-zinc-800">
              {bizOut.map((t) => (
                <tr key={t.id}>
                  <td className={td}>{t.date}</td>
                  <td className={`${td} max-w-xs truncate`} title={t.description}>{t.description}</td>
                  <td className={td}>€{money(-t.amount + t.fee)}</td>
                  <td className={td}>
                    <form action={toggleReceipt} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={t.id} />
                      <input name="note" defaultValue={t.note ?? ''} placeholder="where is it saved?" autoComplete="off" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white w-44" />
                      <button name="has" value={t.hasReceipt ? '0' : '1'} className={`px-3 py-1 rounded-lg text-xs font-semibold text-white ${t.hasReceipt ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}>{t.hasReceipt ? '✓ have it' : 'missing'}</button>
                    </form>
                  </td>
                </tr>
              ))}
              {bizOut.length === 0 && <tr><td className={td} colSpan={4}>No business expenses yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <details className="text-sm text-zinc-300">
          <summary className="cursor-pointer text-zinc-400">Business income lines ({bizIn.length})</summary>
          <table className="w-full mt-2"><tbody className="divide-y divide-zinc-800">
            {bizIn.map((t) => <tr key={t.id}><td className={td}>{t.date}</td><td className={td}>{t.description}</td><td className={td}>€{money(t.amount)}</td></tr>)}
          </tbody></table>
        </details>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-bold text-white">Your earlier decisions ({decided.length})</h2>
        <p className="text-sm text-zinc-400">Changed your mind about a shop or person? Switch it here: all its lines move. &quot;Ask again&quot; puts it back into the list above.</p>
        <details>
          <summary className="cursor-pointer text-sm text-zinc-300">Show the list</summary>
          <table className="w-full mt-2 min-w-[640px]">
            <thead><tr><th className={th}>Who</th><th className={th}>Now</th><th className={th}>Lines</th><th className={th}>Total</th><th className={th}></th></tr></thead>
            <tbody className="divide-y divide-zinc-800">
              {decided.map((d) => (
                <tr key={`${d.currency}|${d.key}`}>
                  <td className={`${td} max-w-xs truncate`}>{displayName(d.key)} <span className="text-xs text-zinc-500">{d.key.startsWith('in:') ? 'money in' : 'money out'}</span></td>
                  <td className={td}>{d.treatment === 'business' ? 'Business' : 'Private'}</td>
                  <td className={td}>{d.count}</td>
                  <td className={td}>{d.currency === 'EUR' ? '€' : ''}{money(d.total)}{d.currency === 'EUR' ? '' : ` ${d.currency}`}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    <form action={changeDecisionAction} className="flex gap-2">
                      <input type="hidden" name="key" value={d.key} />
                      <button name="treatment" value={d.treatment === 'business' ? 'personal' : 'business'} className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">Make it {d.treatment === 'business' ? 'Private' : 'Business'}</button>
                      <button name="treatment" value="unreviewed" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg text-xs">Ask again</button>
                    </form>
                  </td>
                </tr>
              ))}
              {decided.length === 0 && <tr><td className={td} colSpan={5}>Nothing decided yet.</td></tr>}
            </tbody>
          </table>
        </details>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-bold text-white">Settings for the estimate</h2>
        <SettingsForm s={settings} />
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-white mb-2">Questions to bring to the Steuerberater</h2>
        <ul className="text-sm text-zinc-300 list-disc pl-5 space-y-1">{QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ul>
        <p className="text-xs text-zinc-500 mt-3">Also bring: the downloaded CSV, your Revolut and CIB statements, the receipts, and the WhatsApp exchange chats.</p>
      </section>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-zinc-800/60 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}
