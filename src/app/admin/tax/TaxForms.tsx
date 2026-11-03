// src/app/admin/tax/TaxForms.tsx

'use client'

import { useActionState } from 'react'
import { findMatchesAction, importStatementFile, saveTaxSettings, type TaxActionResult } from './actions'
import type { TaxSettings } from '@/lib/tax/types'

function Msg({ r }: { r: TaxActionResult | null }) {
  if (!r) return null
  return <p role="status" className={`text-sm ${r.ok ? 'text-green-400' : 'text-red-400'}`}>{r.message}</p>
}

export function ImportForm() {
  const [res, action, pending] = useActionState(importStatementFile, null)
  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept=".csv,.pdf,text/csv,application/pdf" className="block text-sm text-zinc-300" />
        <label className="text-sm text-zinc-300">Bank{' '}
          <select name="bank" defaultValue="auto" className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white">
            <option value="auto">Detect automatically</option>
            <option value="cib">CIB</option>
            <option value="qnb">QNB</option>
            <option value="other">Other bank</option>
          </select>
        </label>
      </div>
      <button disabled={pending} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm">{pending ? 'Reading the statement…' : 'Import statement'}</button>
      <Msg r={res} />
    </form>
  )
}

export function FindMatchesForm() {
  const [res, action, pending] = useActionState(findMatchesAction, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <button disabled={pending} className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm">{pending ? 'Looking…' : 'Find matches again'}</button>
      <Msg r={res} />
    </form>
  )
}

const field = 'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm'

export function SettingsForm({ s }: { s: TaxSettings }) {
  const [res, action, pending] = useActionState(saveTaxSettings, null)
  return (
    <form action={action} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm text-zinc-300"><span className="font-semibold text-white">Your full name as Revolut shows it</span>
          <input name="ownerName" defaultValue={s.ownerName} autoComplete="off" className={`${field} block mt-1 w-full`} />
          <span className="text-xs text-zinc-500">Transfers to yourself are then treated as internal.</span></label>
        <label className="block text-sm text-zinc-300"><span className="font-semibold text-white">Yearly taxable salary (EUR)</span>
          <input name="salaryTaxableEur" inputMode="decimal" defaultValue={s.salaryTaxableEur || ''} autoComplete="off" className={`${field} block mt-1 w-40`} />
          <span className="text-xs text-zinc-500">Roughly your gross salary minus about 20%. See your Lohnsteuerbescheinigung (line 3 &quot;Bruttoarbeitslohn&quot;).</span></label>
        <label className="block text-sm text-zinc-300"><span className="font-semibold text-white">Trade-tax Hebesatz of your city (%)</span>
          <input name="hebesatzPct" inputMode="decimal" defaultValue={s.hebesatzPct} autoComplete="off" className={`${field} block mt-1 w-28`} />
          <span className="text-xs text-zinc-500">Düsseldorf 440, Essen 480, Köln 475. Only matters above 24,500 EUR profit.</span></label>
        <label className="block text-sm text-zinc-300"><span className="font-semibold text-white">Business income last year (EUR)</span>
          <input name="priorYearTurnover" inputMode="decimal" defaultValue={s.priorYearTurnover || ''} autoComplete="off" className={`${field} block mt-1 w-40`} />
          <span className="text-xs text-zinc-500">Used for the small-business VAT limit.</span></label>
      </div>
      <button disabled={pending} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm">{pending ? 'Saving…' : 'Save settings'}</button>
      <Msg r={res} />
    </form>
  )
}
