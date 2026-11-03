// src/app/admin/orders/OrderEditors.tsx
// Creating an order, editing its costs and details, and deleting a hand-made one, all without leaving the Orders page.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Deal } from '@/types/deals'
import { createDeal, deleteDeal, updateDeal } from '../deals/actions'
import { DealFormFields, Modal, digitsCapture, type DiscountCodeOption, type ProductRequest } from './DealFormFields'

type Lists = { productRequests: ProductRequest[]; discountCodes: DiscountCodeOption[] }

export function NewOrderButton({ productRequests, discountCodes }: Lists) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(formData: FormData) {
    setBusy(true); setError('')
    try {
      await createDeal(formData)
      setOpen(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the order.')
    } finally { setBusy(false) }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">+ New order</button>
      {open && (
        <Modal title="New order" onClose={() => setOpen(false)}>
          <form action={save} autoComplete="off" onChangeCapture={digitsCapture} className="grid grid-cols-2 gap-4">
            <DealFormFields productRequests={productRequests} discountCodes={discountCodes} />
            <div className="col-span-2 space-y-2">
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={busy} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg">{busy ? 'Saving…' : 'Create order'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

export function EditDealButton({ deal, label, productRequests, discountCodes }: { deal: Deal; label: string } & Lists) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(formData: FormData) {
    setBusy(true); setError('')
    try {
      await updateDeal(deal.id, formData)
      setOpen(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally { setBusy(false) }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-zinc-300 hover:text-white underline">{label}</button>
      {open && (
        <Modal title="Edit costs and details" onClose={() => setOpen(false)}>
          <form action={save} autoComplete="off" onChangeCapture={digitsCapture} className="grid grid-cols-2 gap-4">
            <DealFormFields deal={deal} productRequests={productRequests} discountCodes={discountCodes} />
            <div className="col-span-2 space-y-2">
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg">{busy ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 rounded-lg">Close</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

export function DeleteDealButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function remove() {
    if (!confirm('Delete this order for good? This cannot be undone. (To keep a record, change its status to Cancelled instead.)')) return
    setBusy(true)
    try { await deleteDeal(id); router.refresh() } catch (e) { alert(e instanceof Error ? e.message : 'Could not delete.') } finally { setBusy(false) }
  }
  return <button type="button" onClick={remove} disabled={busy} className="text-xs text-red-400 hover:text-red-300 underline disabled:opacity-50">Delete</button>
}
