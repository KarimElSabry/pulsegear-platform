'use client'

import { useState, useEffect, useRef } from 'react'
import { DEAL_STATUSES, SALE_CHANNELS, SOURCE_PLATFORMS, type Deal, type DealStatus, type SaleChannel } from '@/types/deals'
import { commissionForCode } from '@/lib/deal-codes'
import { normalizeDigits } from '@/lib/digits'

/** Runs before each field's own onChange, so Arabic digits typed in number/phone fields become 0-9 first. */
export function digitsCapture(e: React.ChangeEvent<HTMLFormElement>) {
  const el = e.target as unknown as HTMLInputElement
  if (el.dataset?.digits) {
    const fixed = normalizeDigits(el.value)
    if (fixed !== el.value) el.value = fixed
  }
}

export type DiscountCodeOption = { code: string; discount_percent: number }

type DealStatusValue = DealStatus

export type ProductRequest = {
  id:                  number
  requested_product:   string | null
  customer_name:       string | null
  phone?:              string | null
  customer_instagram?: string | null
  governorate?:        string | null
  city?:               string | null
  street?:             string | null
  budget:              number | null
  status:              string
  notes?:              string | null
}

function Field({
  label, optional, children, hint,
}: {
  label: string; optional?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
        {label}
        {optional && <span className="text-gray-600 normal-case font-normal">(optional)</span>}
        {hint && <span className="text-indigo-400 normal-case font-normal text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition'

function useEurToEgp() {
  const [rate, setRate]       = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  async function fetchRate(): Promise<number | null> {
    setLoading(true)
    setError(false)
    const APIs = [
      async () => {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR')
        const data = await res.json()
        if (data?.rates?.EGP) return data.rates.EGP as number
        throw new Error('no EGP')
      },
      async () => {
        const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json')
        const data = await res.json()
        if (data?.eur?.egp) return data.eur.egp as number
        throw new Error('no EGP')
      },
      async () => {
        const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=EGP')
        const data = await res.json()
        if (data?.rates?.EGP) return data.rates.EGP as number
        throw new Error('no EGP')
      },
    ]
    for (const api of APIs) {
      try {
        const fetched = await api()
        const rounded = Math.round(fetched * 100) / 100
        setRate(rounded)
        setLoading(false)
        return rounded
      } catch { continue }
    }
    setError(true)
    setLoading(false)
    return null
  }

  useEffect(() => { fetchRate() }, [])
  return { rate, loading, error, refetch: fetchRate }
}

// ── Deal Form Fields ──────────────────────────────────────────────────────────
export function DealFormFields({
  deal, productRequests, discountCodes,
}: {
  deal?: Deal; productRequests: ProductRequest[]; discountCodes: DiscountCodeOption[]
}) {
  const { rate: liveRate, loading: rateLoading, error: rateError, refetch } = useEurToEgp()

  const [customerName,      setCustomerName]     = useState(deal?.customer_name ?? '')
  const [customerPhone,     setCustomerPhone]     = useState(deal?.phone ?? '')
  const [customerInstagram, setCustomerInstagram] = useState(deal?.customer_instagram ?? '')
  const [customerAddress,   setCustomerAddress]   = useState(deal?.customer_address ?? '')
  const [sellingPrice,      setSellingPrice]      = useState(deal?.selling_price_egp?.toString() ?? '')
  const [depositAmount,     setDepositAmount]     = useState(deal?.deposit_amount_egp?.toString() ?? '')
  const [remainingAmount,   setRemainingAmount]   = useState(deal?.remaining_amount_egp?.toString() ?? '')
  const [commissionEgp,     setCommissionEgp]     = useState(deal?.commission_egp?.toString() ?? '0')
  const [discountCode,       setDiscountCode]       = useState(deal?.discount_code ?? '')
  const [notes,             setNotes]             = useState(deal?.notes ?? '')
  const [sourcePriceEur,    setSourcePriceEur]    = useState(deal?.source_price_eur?.toString() ?? '')
  const [shippingEur,       setShippingEur]       = useState(deal?.shipping_eur?.toString() ?? '0')
  const [egyptShipping,     setEgyptShipping]     = useState(deal?.egypt_shipping_egp?.toString() ?? '0')
  const [status,            setStatus]            = useState<DealStatusValue>((deal?.status as DealStatusValue) ?? 'deposit_pending')
  const [sourcePlatform,    setSourcePlatform]    = useState<string>(deal?.source_platform ?? '')
  const [saleChannel,       setSaleChannel]       = useState<SaleChannel>((deal?.sale_channel as SaleChannel) ?? 'whatsapp')
  const [requestId,         setRequestId]         = useState<string>(deal?.product_request_id ? String(deal.product_request_id) : '')
  const [exchangeRate,      setExchangeRate]       = useState(deal?.exchange_rate ? String(deal.exchange_rate) : '')

  const rateInjected = useRef(false)
  useEffect(() => {
    if (!deal && liveRate && !rateInjected.current) {
      setExchangeRate(String(liveRate))
      rateInjected.current = true
    }
  }, [liveRate, deal])

  // Total cost = (item + shipping from Germany) in EUR x rate, plus shipping inside Egypt (EGP)
  const totalSourceEur =
    sourcePriceEur || shippingEur
      ? (parseFloat(sourcePriceEur || '0') + parseFloat(shippingEur || '0'))
      : null

  const egyptShippingNum = Math.max(0, parseFloat(egyptShipping || '0') || 0)

  const calculatedEgp =
    totalSourceEur !== null && exchangeRate
      ? Math.round(totalSourceEur * parseFloat(exchangeRate) + egyptShippingNum)
      : egyptShippingNum > 0
        ? Math.round(egyptShippingNum)
        : null

  const shippingEgp =
    shippingEur && exchangeRate && parseFloat(shippingEur) > 0
      ? Math.round(parseFloat(shippingEur) * parseFloat(exchangeRate))
      : null

  // euro equivalents use the exchange rate in the form (EGP per 1 EUR)
  const rateNum = parseFloat(exchangeRate)
  const inEur = (egpAmount: number) => (rateNum > 0 ? '€' + (egpAmount / rateNum).toLocaleString('en-US', { maximumFractionDigits: 2 }) : null)

  const expectedProfit =
    calculatedEgp !== null && parseFloat(sellingPrice) > 0
      ? Math.round(parseFloat(sellingPrice) - calculatedEgp - (parseFloat(commissionEgp) || 0))
      : null

  function handleRequestChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    setRequestId(id)
    const req = productRequests.find((r) => r.id === Number(id))
    if (!req) return
    if (req.customer_name)      setCustomerName(req.customer_name)
    if (req.phone)              setCustomerPhone(req.phone)
    if (req.customer_instagram) setCustomerInstagram(req.customer_instagram)
    const address = [req.street, req.city, req.governorate].filter(Boolean).join(', ')
    if (address)                setCustomerAddress(address)
    if (req.budget)             setSellingPrice(String(req.budget))
    if (req.notes)              setNotes(req.notes)
  }

  function handleDepositChange(e: React.ChangeEvent<HTMLInputElement>) {
    const deposit = parseFloat(e.target.value) || 0
    const selling = parseFloat(sellingPrice)   || 0
    setDepositAmount(e.target.value)
    if (selling > 0) setRemainingAmount(String(Math.max(0, selling - deposit)))
  }

  const codePercent = (code: string) => Number(discountCodes.find((d) => d.code === code)?.discount_percent) || 0

  // choosing a code sets the commission to its percentage of the selling price; picking "none" resets it to 0
  function handleCodeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value
    setDiscountCode(code)
    setCommissionEgp(code ? String(commissionForCode(parseFloat(sellingPrice) || 0, codePercent(code))) : '0')
  }

  function handleSellingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selling = parseFloat(e.target.value) || 0
    const deposit = parseFloat(depositAmount)  || 0
    setSellingPrice(e.target.value)
    if (codePercent(discountCode) > 0) setCommissionEgp(String(commissionForCode(selling, codePercent(discountCode))))
    if (deposit > 0) setRemainingAmount(String(Math.max(0, selling - deposit)))
  }

  return (
    <>
      {/* ── Linked Request ── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
          Linked Request
        </p>
        <Field label="Link to Product Request" optional>
          <input type="hidden" name="product_request_id" value={requestId} />
          <select value={requestId} onChange={handleRequestChange} className={inputClass}>
            <option value="">No linked request</option>
            {productRequests.map((r) => (
              <option key={r.id} value={String(r.id)}>
                #{r.id} - {r.requested_product ?? 'Unknown'} ({r.customer_name ?? 'No name'})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Customer Info ── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
          Customer Info
        </p>
      </div>

      <Field label="Customer Name">
        <input name="customer_name" autoComplete="off" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} placeholder="e.g. Ahmed Mohamed" />
      </Field>

      <Field label="Customer Phone">
        <input name="phone" data-digits="1" autoComplete="off" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputClass} placeholder="e.g. 01012345678" />
      </Field>

      <Field label="Customer Instagram">
        <input name="customer_instagram" autoComplete="off" value={customerInstagram} onChange={(e) => setCustomerInstagram(e.target.value)} className={inputClass} placeholder="e.g. @username" />
      </Field>

 <Field label="Customer Address">
        <textarea name="customer_address" autoComplete="off" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={2} className={inputClass} placeholder="Street, city, governorate" />
      </Field>

      <Field label="Sale Channel">
        <input type="hidden" name="sale_channel" value={saleChannel} />
        <select value={saleChannel} onChange={(e) => setSaleChannel(e.target.value as SaleChannel)} className={inputClass}>
          {SALE_CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
      </Field>

      {/* ── Deal Info ── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2 mt-2">
          Deal Info
        </p>
      </div>

      <Field label="Status">
        <input type="hidden" name="status" value={status} />
        <select value={status} onChange={(e) => setStatus(e.target.value as DealStatusValue)} className={inputClass}>
          {DEAL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Source Platform">
        <input type="hidden" name="source_platform" value={sourcePlatform} />
        <select value={sourcePlatform} onChange={(e) => setSourcePlatform(e.target.value)} className={inputClass}>
          <option value="">Select platform...</option>
          {SOURCE_PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </Field>

      <div className="col-span-2">
        <Field label="Source Link" optional>
          <input name="source_link" type="url" defaultValue={deal?.source_link ?? ''} className={inputClass} placeholder="https://www.kleinanzeigen.de/..." />
        </Field>
      </div>

      {/* ── Financials ── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2 mt-2">
          Financials
        </p>
      </div>

      {/* Source Price */}
      <Field label="Source Price (EUR)">
        <input
          name="source_price_eur"
          type="text" inputMode="decimal" data-digits="1"
          step="0.01"
          value={sourcePriceEur}
          onChange={(e) => setSourcePriceEur(e.target.value)}
          className={inputClass}
          placeholder="0.00"
        />
      </Field>

      {/* Shipping from Germany */}
      <Field label="Shipping from Germany (EUR)" optional>
        <input
          name="shipping_eur"
          type="text" inputMode="decimal" data-digits="1"
          step="0.01"
          value={shippingEur}
          onChange={(e) => setShippingEur(e.target.value)}
          className={inputClass}
          placeholder="0.00"
        />
        {shippingEgp !== null && (
          <p className="text-xs text-cyan-400 mt-1">
            ≈ {shippingEgp.toLocaleString()} EGP shipping cost
          </p>
        )}
      </Field>

      {/* Shipping inside Egypt */}
      <Field label="Shipping in Egypt (EGP)" optional>
        <input
          name="egypt_shipping_egp"
          type="text" inputMode="decimal" data-digits="1"
          step="0.01"
          min="0"
          value={egyptShipping}
          onChange={(e) => setEgyptShipping(e.target.value)}
          className={inputClass}
          placeholder="0.00"
        />
      </Field>

      {/* Exchange Rate */}
      <Field
        label="Exchange Rate (EUR to EGP)"
        hint={rateLoading ? 'جاري تحميل السعر...' : rateError ? 'تعذر تحميل السعر' : liveRate ? `السعر الحالي: ${liveRate}` : ''}
      >
        <div className="flex gap-2">
          <input
            name="exchange_rate"
            type="text" inputMode="decimal" data-digits="1"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            className={`${inputClass} ${liveRate ? 'border-indigo-600' : ''}`}
            placeholder="0.00"
          />
          <button
            type="button"
            onClick={async () => { const r = await refetch(); if (r) setExchangeRate(String(r)) }}
            className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-3 rounded-lg transition whitespace-nowrap"
            title="Refresh live rate"
          >
            🔄
          </button>
        </div>
        {deal && (
          <p className="text-xs text-yellow-500 mt-1">
            ⚠️ Original rate: {deal.exchange_rate} — click 🔄 to use live rate
          </p>
        )}
      </Field>

      {/* ✅ Total Cost Summary */}
      {calculatedEgp !== null && (exchangeRate || egyptShippingNum > 0) && (
        <div className="col-span-2 bg-indigo-900/20 border border-indigo-700/30 rounded-lg px-4 py-3">
          <p className="text-xs text-indigo-300 font-semibold mb-1">Total Cost Breakdown</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            {sourcePriceEur && parseFloat(sourcePriceEur) > 0 && (
              <span>
                Product: <span className="text-white">€{sourcePriceEur}</span>
                {' '}≈ <span className="text-white">{Math.round(parseFloat(sourcePriceEur) * parseFloat(exchangeRate)).toLocaleString()} EGP</span>
              </span>
            )}
            {shippingEur && parseFloat(shippingEur) > 0 && (
              <span>
                Shipping from Germany: <span className="text-cyan-400">€{shippingEur}</span>
                {' '}≈ <span className="text-cyan-400">{shippingEgp?.toLocaleString()} EGP</span>
              </span>
            )}
            {egyptShippingNum > 0 && (
              <span>
                Shipping in Egypt: <span className="text-cyan-400">{egyptShippingNum.toLocaleString()} EGP</span>
                {inEur(egyptShippingNum) && <> ≈ <span className="text-cyan-400">{inEur(egyptShippingNum)}</span></>}
              </span>
            )}
            {(parseFloat(commissionEgp) || 0) > 0 && (
              <span>
                Commission: <span className="text-white">{(parseFloat(commissionEgp) || 0).toLocaleString()} EGP</span>
                {inEur(parseFloat(commissionEgp) || 0) && <> ≈ {inEur(parseFloat(commissionEgp) || 0)}</>}
              </span>
            )}
            <span className="font-bold text-indigo-300">
              Total cost: {calculatedEgp.toLocaleString()} EGP{inEur(calculatedEgp) ? ` · ${inEur(calculatedEgp)}` : ''}
            </span>
            {expectedProfit !== null && (
              <span className={`font-bold ${expectedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Expected profit: {expectedProfit.toLocaleString()} EGP{inEur(expectedProfit) ? ` · ${inEur(expectedProfit)}` : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selling Price */}
      <Field label="Selling Price (EGP)">
        <input
          name="selling_price_egp"
          type="text" inputMode="decimal" data-digits="1"
          step="0.01"
          value={sellingPrice}
          onChange={handleSellingChange}
          className={inputClass}
          placeholder="0.00"
        />
        {parseFloat(sellingPrice) > 0 && inEur(parseFloat(sellingPrice)) && <p className="text-xs text-cyan-400 mt-1">≈ {inEur(parseFloat(sellingPrice))}</p>}
        <p className="text-xs text-yellow-500 mt-1">⚠️ Enter the FULL selling price — not the deposit amount</p>
      </Field>

      <Field label="Deposit Amount (EGP)">
        <input name="deposit_amount_egp" type="text" inputMode="decimal" data-digits="1" step="0.01" value={depositAmount} onChange={handleDepositChange} className={inputClass} placeholder="0.00" />
      </Field>

      <Field label="Remaining Amount (EGP)" hint="يُحسب تلقائياً">
        <input name="remaining_amount_egp" type="text" inputMode="decimal" data-digits="1" step="0.01" value={remainingAmount} onChange={(e) => setRemainingAmount(e.target.value)} className={`${inputClass} ${remainingAmount ? 'border-green-700' : ''}`} placeholder="0.00" />
      </Field>

      <Field label="Discount / partner code" optional>
        <select name="discount_code" value={discountCode} onChange={handleCodeChange} className={inputClass}>
          <option value="">No code</option>
          {discountCode && !discountCodes.some((d) => d.code === discountCode) && <option value={discountCode}>{discountCode} (inactive)</option>}
          {discountCodes.map((d) => <option key={d.code} value={d.code}>{d.code} — {d.discount_percent}%</option>)}
        </select>
        {codePercent(discountCode) > 0 && <p className="text-xs text-cyan-400 mt-1">Commission is set to {codePercent(discountCode)}% of the selling price. You can still edit it below.</p>}
      </Field>

      <Field label="Commission (EGP)">
        <input name="commission_egp" type="text" inputMode="decimal" data-digits="1" step="0.01" value={commissionEgp} onChange={(e) => setCommissionEgp(e.target.value)} className={inputClass} placeholder="0.00" />
      </Field>

      <div className="col-span-2">
        <label className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-200">
          <input type="checkbox" name="client_listing" defaultChecked={deal?.client_listing === true} className="mt-1" />
          <span><b>Client item.</b> This watch is listed on behalf of a client: keep this order out of the finance reports and the profit.</span>
        </label>
      </div>

      <div className="col-span-2">
        <Field label="Notes" optional>
          <textarea name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} placeholder="Any extra info..." />
        </Field>
      </div>
    </>
  )
}

// ── Modal Wrapper ─────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg font-bold transition">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
