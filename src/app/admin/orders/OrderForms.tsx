// src/app/admin/orders/OrderForms.tsx

'use client'

import { useActionState, useState } from 'react'
import { assignDealToAccount, saveExpectedDelivery, setOrderStatus, type OrderActionResult } from './actions'
import { ADMIN_STATUS_OPTIONS, adminStatusValue } from '@/lib/orders'

export interface AccountOption { user_id: string; label: string }

function Msg({ r }: { r: OrderActionResult | null }) {
  if (!r) return null
  return <span className={`text-xs ${r.ok ? 'text-green-400' : 'text-red-400'}`}>{r.message}</span>
}

export function AssignForm({ dealIds, current, accounts, suggestedId }: { dealIds: string[]; current: string | null; accounts: AccountOption[]; suggestedId?: string }) {
  const [res, action, pending] = useActionState(assignDealToAccount, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="deal_ids" value={dealIds.join(',')} />
      <select name="user_id" defaultValue={current ?? suggestedId ?? ''} className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white max-w-xs">
        <option value="">Not assigned</option>
        {accounts.map(a => <option key={a.user_id} value={a.user_id}>{a.label}</option>)}
      </select>
      <button disabled={pending} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{pending ? 'Saving…' : 'Save'}</button>
      <Msg r={res} />
    </form>
  )
}

export function ExpectedDeliveryForm({ dealIds, expected }: { dealIds: string[]; expected: string }) {
  const [res, action, pending] = useActionState(saveExpectedDelivery, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="deal_ids" value={dealIds.join(',')} />
      <label className="flex items-center gap-1 text-xs text-zinc-400">Expected delivery (optional)
        <input name="expected_delivery_date" type="date" defaultValue={expected} className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white w-40" />
      </label>
      <button disabled={pending} className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{pending ? 'Saving…' : 'Save'}</button>
      <Msg r={res} />
    </form>
  )
}

export function StatusForm({ dealIds, status, allowCancel = true }: { dealIds: string[]; status: string; allowCancel?: boolean }) {
  const [res, action, pending] = useActionState(setOrderStatus, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="deal_ids" value={dealIds.join(',')} />
      <select name="status" defaultValue={adminStatusValue(status)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white">
        {ADMIN_STATUS_OPTIONS.filter((s) => allowCancel || s.value !== 'cancelled').map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <input name="comment" maxLength={500} placeholder="Comment the customer will see (optional)" className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white w-72" />
      <button disabled={pending} className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{pending ? 'Posting…' : 'Post update'}</button>
      <Msg r={res} />
    </form>
  )
}

/** Copies the tracking link (with the order ID filled in) so you can paste it wherever you answer the customer. */
export function CopyLinkButton({ trackUrl }: { trackUrl: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(trackUrl); setDone(true); setTimeout(() => setDone(false), 2000) }}
      className="text-xs text-zinc-400 hover:text-white underline"
    >
      {done ? 'Copied ✓' : 'Copy tracking link'}
    </button>
  )
}
