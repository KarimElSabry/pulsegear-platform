// src/components/cart/CancelMyOrder.tsx
// "Cancel my order" for the customer, while the order is still waiting for confirmation.

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelMyOrder } from '@/app/checkout/[code]/actions'

export default function CancelMyOrder({ code, token }: { code: string; token: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState('')

  const cancel = () => {
    if (!confirm('Cancel this order? Your items will be released.')) return
    setError('')
    start(async () => {
      const r = await cancelMyOrder(code, token)
      if (r.ok) router.refresh()
      else setError(r.message)
    })
  }

  return (
    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-300">Changed your mind? You can cancel this order now. Nothing has been charged.</p>
      <button type="button" onClick={cancel} disabled={pending} className="mt-3 rounded-xl border border-red-700 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-900/30 disabled:opacity-50">
        {pending ? 'Cancelling…' : 'Cancel my order'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}
