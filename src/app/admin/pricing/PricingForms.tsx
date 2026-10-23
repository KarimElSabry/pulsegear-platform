// src/app/admin/pricing/PricingForms.tsx

'use client'

import { useActionState, useState, type ReactNode } from 'react'
import { approvePriceChanges, approveSetup, savePricingSettings, saveProductPricing, undoPriceBatch, type PricingActionResult } from './actions'
import type { PricingSettings } from '@/lib/repricing'

function Msg({ r }: { r: PricingActionResult | null }) {
  if (!r) return null
  return <p role="status" className={`text-sm ${r.ok ? 'text-green-400' : 'text-red-400'}`}>{r.message}</p>
}

const field = 'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white w-28 text-sm'

function Num({ name, label, value, hint }: { name: string; label: string; value: number | null; hint: string }) {
  return (
    <label className="block text-sm text-zinc-300"><span className="font-semibold text-white">{label}</span>
      <input name={name} type="text" inputMode="decimal" defaultValue={value ?? ''} autoComplete="off" className={`${field} block mt-1`} />
      <span className="text-xs text-zinc-500">{hint}</span></label>
  )
}

export function SettingsForm({ s, manualRate }: { s: PricingSettings; manualRate: number | null }) {
  const [res, action, pending] = useActionState(savePricingSettings, null)
  return (
    <form action={action} className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Num name="minMarginPct" label="Lowest profit margin %" value={s.minMarginPct} hint="A price is never proposed below cost + this." />
        <Num name="targetMarginPct" label="Target profit margin %" value={s.targetMarginPct} hint="Items below this are flagged." />
        <Num name="landedFactor" label="Real cost ÷ store price" value={s.landedFactor} hint="1 = store price only. 1.2 = shipping and customs add 20%." />
        <Num name="thresholdPct" label="Ignore moves under %" value={s.thresholdPct} hint="Avoids tiny price changes." />
        <Num name="maxChangePct" label="Max change per run %" value={s.maxChangePct} hint="A big euro jump is spread over several days." />
        <Num name="manualRate" label="Fixed EUR rate (optional)" value={manualRate} hint="Empty = live market rate." />
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="allowLower" defaultChecked={s.allowLower} /> Also lower prices when the euro falls</label>
      <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="autoApply" defaultChecked={s.autoApply} /> Apply changes automatically every week (otherwise they wait for your approval here)</label>
      <button disabled={pending} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm">{pending ? 'Saving…' : 'Save settings'}</button>
      <Msg r={res} />
    </form>
  )
}

/** A table with a checkbox per row; `children` are the rows, each with <input name="change" value="id:from:to">. */
export function ApprovalForm({ kind, baseline, children, count }: { kind: 'setup' | 'changes'; baseline?: number; children: ReactNode; count: number }) {
  const [res, action, pending] = useActionState(kind === 'setup' ? approveSetup : approvePriceChanges, null)
  const [all, setAll] = useState(true)
  return (
    <form action={action} className="space-y-3">
      {baseline ? <input type="hidden" name="baseline" value={baseline} /> : null}
      <div className="overflow-x-auto">{children}</div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={(ev) => {
          const form = (ev.target as HTMLElement).closest('form')!
          const next = !all
          form.querySelectorAll<HTMLInputElement>('input[name="change"]').forEach((c) => { c.checked = next })
          setAll(next)
        }} className="text-sm text-zinc-300 underline">{all ? 'Untick all' : 'Tick all'}</button>
        <button disabled={pending || count === 0} onClick={(e) => { if (!confirm(kind === 'setup' ? 'Update the ticked prices and start following the euro?' : 'Update the ticked prices on the website now?')) e.preventDefault() }}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg">
          {pending ? 'Updating…' : kind === 'setup' ? '✅ Approve the ticked prices' : '✅ Approve the ticked changes'}
        </button>
      </div>
      <Msg r={res} />
    </form>
  )
}

export function ProductsForm({ ids, children }: { ids: number[]; children: ReactNode }) {
  const [res, action, pending] = useActionState(saveProductPricing, null)
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ids" value={ids.join(',')} />
      <div className="overflow-x-auto">{children}</div>
      <button disabled={pending} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm">{pending ? 'Saving…' : 'Save'}</button>
      <Msg r={res} />
    </form>
  )
}

export function UndoForm({ batchId }: { batchId: string }) {
  const [res, action, pending] = useActionState(undoPriceBatch, null)
  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="batch_id" value={batchId} />
      <button disabled={pending} onClick={(e) => { if (!confirm('Put these prices back?')) e.preventDefault() }} className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-lg">{pending ? 'Undoing…' : 'Undo'}</button>
      <Msg r={res} />
    </form>
  )
}
