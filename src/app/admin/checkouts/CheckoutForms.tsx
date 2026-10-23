// src/app/admin/checkouts/CheckoutForms.tsx

'use client'

import { useActionState } from 'react'
import { approveCheckoutOrder, rejectCheckoutOrder, type CheckoutActionResult } from './actions'

function Msg({ r }: { r: CheckoutActionResult | null }) {
  if (!r) return null
  return <span role="status" className={`text-sm ${r.ok ? 'text-green-400' : 'text-red-400'}`}>{r.message}</span>
}

export function ApproveForm({ id }: { id: string }) {
  const [res, action, pending] = useActionState(approveCheckoutOrder, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="checkout_id" value={id} />
      <button disabled={pending} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg">{pending ? 'Approving…' : '✅ Customer confirmed, create the order'}</button>
      <Msg r={res} />
    </form>
  )
}

export function RejectForm({ id }: { id: string }) {
  const [res, action, pending] = useActionState(rejectCheckoutOrder, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="checkout_id" value={id} />
      <input name="reason" placeholder="Reason the customer sees (optional)" maxLength={300} autoComplete="off" className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white w-72" />
      <button disabled={pending} onClick={(e) => { if (!confirm('Reject this order and put the items back on sale?')) e.preventDefault() }}
        className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm">{pending ? 'Rejecting…' : 'Reject'}</button>
      <Msg r={res} />
    </form>
  )
}
