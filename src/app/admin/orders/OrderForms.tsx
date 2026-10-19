// src/app/admin/orders/OrderForms.tsx

'use client'

import { useActionState } from 'react'
import { assignDealToAccount, saveOrderTracking, type OrderActionResult } from './actions'

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

export function TrackingForm({ dealId, tracking, carrier, message }: { dealId: string; tracking: string; carrier: string; message: string }) {
  const [res, action, pending] = useActionState(saveOrderTracking, null)
  const input = 'bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white'
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="deal_id" value={dealId} />
      <input name="carrier" defaultValue={carrier} placeholder="Carrier (DHL…)" className={`${input} w-28`} />
      <input name="tracking_number" defaultValue={tracking} placeholder="Tracking number" className={`${input} w-44`} />
      <input name="customer_message" defaultValue={message} placeholder="Note the customer sees" className={`${input} w-64`} />
      <button disabled={pending} className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{pending ? 'Saving…' : 'Save'}</button>
      <Msg r={res} />
    </form>
  )
}
