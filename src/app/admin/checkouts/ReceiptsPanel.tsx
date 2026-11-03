// src/app/admin/checkouts/ReceiptsPanel.tsx
// The deposit receipts of one order: open the file, compare with what is due, verify or reject.

import { egp } from '@/lib/checkout-core'
import { depositFor } from '@/lib/payment-details'
import type { ReceiptView } from '@/lib/receipt-service'
import { ReceiptForms } from './CheckoutForms'

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const TAG: Record<ReceiptView['status'], string> = {
  submitted: 'bg-amber-900/40 text-amber-200', verified: 'bg-green-900/40 text-green-200', rejected: 'bg-red-900/40 text-red-200',
}

export default function ReceiptsPanel({ receipts, total }: { receipts: ReceiptView[]; total: number }) {
  const due = depositFor(total)
  if (receipts.length === 0) return <p className="text-xs text-zinc-500">No receipt yet. Deposit due: {egp(due)}.</p>
  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400">Deposit due: <b className="text-white">{egp(due)}</b></p>
      {receipts.map((r) => {
        const off = r.amountEgp !== null && Math.round(r.amountEgp) !== due
        return (
          <div key={r.id} className="rounded-xl border border-zinc-800 p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-300">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TAG[r.status]}`}>{r.status}</span>
              <span>{when(r.createdAt)}</span>
              <span>{r.method === 'bank' ? 'Bank transfer' : 'Instapay'}</span>
              {r.amountEgp !== null && <span className={off ? 'text-amber-300' : ''}>says {egp(r.amountEgp)}{off ? ' (differs from the deposit)' : ''}</span>}
              {r.payerPhone && <span dir="ltr">from {r.payerPhone}</span>}
              {r.payerName && <span>{r.payerName}</span>}
              {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">open receipt</a> : <span className="text-red-300">file not available</span>}
            </div>
            {r.reviewNote && <p className="text-xs text-zinc-400">Note: {r.reviewNote}</p>}
            {r.status !== 'verified' && <ReceiptForms receiptId={r.id} depositDue={due} />}
          </div>
        )
      })}
    </div>
  )
}
