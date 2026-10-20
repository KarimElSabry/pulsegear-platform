// src/app/admin/orders/OrderForms.tsx

'use client'

import { useActionState } from 'react'
import { assignDealToAccount, saveOrderTracking, setOrderStatus, type OrderActionResult } from './actions'
import { ADMIN_STATUS_OPTIONS, adminStatusValue } from '@/lib/orders'

export interface AccountOption { user_id: string; label: string }

function Msg({ r }: { r: OrderActionResult | null }) {
  if (!r) return null
  return <span className={`text-xs ${r.ok ? 'text-green-400' : 'text-red-400'}`}>{r.message}</span>
}

export function AssignForm({ dealId, current, accounts, suggestedId }: { dealId: string; current: string | null; accounts: AccountOption[]; suggestedId?: string }) {
  const [res, action, pending] = useActionState(assignDealToAccount, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="deal_id" value={dealId} />
      <select name="user_id" defaultValue={current ?? suggestedId ?? ''} className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white max-w-xs">
        <option value="">Not assigned</option>
        {accounts.map(a => <option key={a.user_id} value={a.user_id}>{a.label}</option>)}
      </select>
      <button disabled={pending} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{pending ? 'Saving…' : 'Save'}</button>
      <Msg r={res} />
    </form>
  )
}

export function TrackingForm({ dealId, tracking, carrier, message, expected }: { dealId: string; tracking: string; carrier: string; message: string; expected: string }) {
  const [res, action, pending] = useActionState(saveOrderTracking, null)
  const input = 'bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white'
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="deal_id" value={dealId} />
      <label className="flex items-center gap-1 text-xs text-zinc-400">Expected delivery
        <input name="expected_delivery_date" type="date" defaultValue={expected} className={`${input} w-40`} />
      </label>
      <input name="carrier" defaultValue={carrier} placeholder="Carrier (DHL…)" className={`${input} w-28`} />
      <input name="tracking_number" defaultValue={tracking} placeholder="Tracking number" className={`${input} w-44`} />
      <input name="customer_message" defaultValue={message} placeholder="Note the customer sees" className={`${input} w-64`} />
      <button disabled={pending} className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{pending ? 'Saving…' : 'Save'}</button>
      <Msg r={res} />
    </form>
  )
}

export function StatusForm({ dealId, status }: { dealId: string; status: string }) {
  const [res, action, pending] = useActionState(setOrderStatus, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="deal_id" value={dealId} />
      <select name="status" defaultValue={adminStatusValue(status)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white">
        {ADMIN_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <input name="comment" maxLength={500} placeholder="Comment the customer will see (optional)" className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white w-72" />
      <button disabled={pending} className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{pending ? 'Posting…' : 'Post update'}</button>
      <Msg r={res} />
    </form>
  )
}

/** One tap: opens WhatsApp with the status message already written (Arabic and English) and the tracking link. */
export function WhatsAppButton({ href, trackUrl }: { href: string | null; trackUrl: string }) {
  return (
    <span className="flex flex-wrap items-center gap-3 text-xs">
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg text-sm">Send update on WhatsApp</a>
        : <span className="text-zinc-600">no phone on this order</span>}
      <button type="button" onClick={() => navigator.clipboard?.writeText(trackUrl)} className="text-zinc-400 hover:text-white underline">Copy tracking link</button>
    </span>
  )
}
