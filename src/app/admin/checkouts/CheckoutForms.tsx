// src/app/admin/checkouts/CheckoutForms.tsx

'use client'

import { useActionState, useState } from 'react'
import { approveCheckoutOrder, cancelCheckoutOrder, rejectReceiptAction, verifyReceiptAction, type CheckoutActionResult } from './actions'

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

const REASONS = ['No reply from the customer', 'Customer changed their mind', 'Item no longer available']

export function CancelForm({ id, approved }: { id: string; approved: boolean }) {
  const [res, action, pending] = useActionState(cancelCheckoutOrder, null)
  const [reason, setReason] = useState('')
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="checkout_id" value={id} />
      <div className="flex flex-wrap items-center gap-2">
        {REASONS.map((r) => (
          <button key={r} type="button" onClick={() => setReason(r)} className="text-xs rounded-full border border-zinc-600 px-3 py-1 text-zinc-300 hover:bg-zinc-800">{r}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input name="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason the customer sees (optional)" maxLength={300} autoComplete="off" className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white w-72" />
        <button disabled={pending}
          onClick={(e) => { if (!confirm(approved ? 'Cancel this confirmed order, cancel its orders on the Deals page and put the items back on sale?' : 'Cancel this order and put the items back on sale?')) e.preventDefault() }}
          className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm">{pending ? 'Cancelling…' : 'Cancel order'}</button>
        <Msg r={res} />
      </div>
    </form>
  )
}

export function ReceiptForms({ receiptId, depositDue }: { receiptId: string; depositDue: number }) {
  const [vres, vaction, vpending] = useActionState(verifyReceiptAction, null)
  const [rres, raction, rpending] = useActionState(rejectReceiptAction, null)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={vaction}>
        <input type="hidden" name="receipt_id" value={receiptId} />
        <button disabled={vpending}
          onClick={(e) => { if (!confirm(`Did the ${depositDue.toLocaleString('en-US')} EGP arrive in your account? This confirms the order and marks the deposit as paid.`)) e.preventDefault() }}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm">{vpending ? 'Verifying…' : '✅ Money received, verify'}</button>
      </form>
      <form action={raction} className="flex items-center gap-2">
        <input type="hidden" name="receipt_id" value={receiptId} />
        <input name="note" placeholder="Why (the customer sees it)" maxLength={300} autoComplete="off" className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white w-56" />
        <button disabled={rpending} className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg text-sm">{rpending ? '…' : 'Reject'}</button>
      </form>
      <Msg r={vres} /><Msg r={rres} />
    </div>
  )
}
