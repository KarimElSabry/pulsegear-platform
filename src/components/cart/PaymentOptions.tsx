// src/components/cart/PaymentOptions.tsx
// The two ways to pay the deposit, shown on the customer's order page:
//   A. on the website (transfer, then upload the receipt)    B. through WhatsApp or Instagram.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAYMENT_DETAILS, groupIban } from '@/lib/payment-details'
import { MAX_RECEIPT_BYTES } from '@/lib/receipts'
import { egp } from '@/lib/checkout-core'
import { instagramDmUrl, whatsappOrderUrl } from '@/lib/contact'

function CopyRow({ label, value, shown }: { label: string; value: string; shown?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="flex items-center gap-2">
        <b dir="ltr" className="font-mono text-white">{shown ?? value}</b>
        <button type="button" onClick={() => { void navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
          className="rounded-lg border border-zinc-600 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-800">{copied ? 'Copied' : 'Copy'}</button>
      </span>
    </div>
  )
}

export default function PaymentOptions({ code, token, total, deposit, phone }: { code: string; token: string; total: number; deposit: number; phone: string }) {
  const router = useRouter()
  const [method, setMethod] = useState<'instapay' | 'bank'>('instapay')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const { instapay, bank } = PAYMENT_DETAILS

  const chatMessage = `Hello Pulse Gear, I would like to pay for my order ${code} here. Total ${egp(total)}, deposit ${egp(deposit)}.`

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const data = new FormData(form)
    const file = data.get('file')
    if (!(file instanceof File) || file.size === 0) { setError('Choose your receipt first.'); return }
    if (file.size > MAX_RECEIPT_BYTES) { setError('The file is too large (4 MB at most). Send a screenshot instead of the original photo.'); return }
    data.set('code', code)
    data.set('token', token)
    data.set('method', method)
    setBusy(true)
    try {
      const res = await fetch('/api/checkout/receipt', { method: 'POST', body: data })
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      if (!res.ok) { setError(body.error ?? 'Something went wrong. Please try again.'); return }
      setDone((body.message ?? 'Receipt received.') + ' Once your payment is confirmed we will reach out to arrange the delivery, which takes about 1 to 2 weeks.')
      form.reset()
      router.refresh()
    } catch {
      setError('No connection. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-6 space-y-4">
      <h2 className="text-xl font-black text-white">How would you like to pay?</h2>
      <ul className="rounded-xl border border-amber-800 bg-amber-900/20 px-4 py-3 text-sm text-amber-200 space-y-1 list-disc ps-8">
        <li>Reserved items must be paid for to get them. An order is confirmed once we receive the <b>50% deposit</b> ({egp(deposit)}). The rest is paid when your order is delivered.</li>
        <li>After your payment is confirmed we will reach out to you to arrange the delivery. Delivery takes about <b>1 to 2 weeks</b>.</li>
        <li>We hold your items for 24 hours. Send your receipt before then and we keep them for 48 hours while we check it.</li>
        <li>Our payment gateway is under construction, so paying by Visa or credit card <b>will be available soon</b>.</li>
      </ul>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-lg font-black text-white">A. Pay the deposit here</h3>
        <p className="mt-1 text-sm text-zinc-400">Send <b className="text-white">{egp(deposit)}</b> by Instapay or bank transfer, then upload the receipt. We check our account and confirm your order.</p>

        <div role="radiogroup" aria-label="Payment method" className="mt-4 flex gap-2">
          {(['instapay', 'bank'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${method === m ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
              {m === 'instapay' ? 'Instapay' : 'Bank transfer (CIB)'}
            </button>
          ))}
        </div>

        <div className="mt-3 divide-y divide-zinc-800 rounded-xl border border-zinc-800 px-4">
          {method === 'instapay' ? (
            <>
              <CopyRow label="Instapay number" value={instapay.number} />
              <CopyRow label="Name" value={instapay.name} />
            </>
          ) : (
            <>
              <CopyRow label="IBAN" value={bank.iban} shown={groupIban(bank.iban)} />
              <CopyRow label="Account number" value={bank.account} />
              <CopyRow label="Bank" value={bank.bank} />
              <CopyRow label="Account name" value={bank.name} />
              <CopyRow label="الاسم" value={bank.nameAr} />
            </>
          )}
          <CopyRow label="Amount" value={String(deposit)} shown={egp(deposit)} />
          <CopyRow label="Reference / note" value={code} />
        </div>
        <p className="mt-2 text-xs text-zinc-500">Please write {code} in the transfer note if the app allows it.</p>

        {done ? (
          <p role="status" className="mt-4 rounded-xl border border-green-800 bg-green-900/20 px-4 py-3 text-sm text-green-200">{done}</p>
        ) : (
          <form onSubmit={send} className="mt-4 space-y-3">
            <label className="block text-sm text-zinc-300">Receipt (screenshot, photo or PDF)
              <input name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="mt-1 block w-full text-sm text-zinc-300" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-zinc-300">Amount you sent (EGP)
                <input name="amount" defaultValue={deposit} inputMode="decimal" autoComplete="off" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" />
              </label>
              <label className="block text-sm text-zinc-300">Phone or account you paid from
                <input name="payerPhone" defaultValue={phone} inputMode="tel" autoComplete="off" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" />
              </label>
            </div>
            <label className="block text-sm text-zinc-300">Name on the account you paid from (optional)
              <input name="payerName" autoComplete="off" maxLength={80} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" />
            </label>
            <button disabled={busy} className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500 disabled:opacity-50">{busy ? 'Sending…' : 'Send receipt'}</button>
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-lg font-black text-white">B. Pay through chat</h3>
        <p className="mt-1 text-sm text-zinc-400">Prefer to arrange it with us directly? Message us with your order ID <b className="text-white">{code}</b> and we will take care of the payment together.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a href={whatsappOrderUrl(chatMessage)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-600">💬 WhatsApp</a>
          <a href={instagramDmUrl()} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-600">📷 Instagram message</a>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-700 p-5 opacity-70">
        <h3 className="text-lg font-black text-white">Visa / credit card</h3>
        <p className="mt-1 text-sm text-zinc-400">Coming soon. Our payment gateway is under construction.</p>
      </div>
    </section>
  )
}
