// src/app/admin/deals/DealsClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Deal, DEAL_STATUSES, SALE_CHANNELS, SOURCE_PLATFORMS, DealStatus, SaleChannel } from '@/types/deals'
import { createDeal, updateDeal, updateDealStatus, deleteDeal } from './actions'

type DealStatusValue = DealStatus

type ProductRequest = {
  id:                  number
  requested_product:   string | null
  customer_name:       string | null
  phone?:              string | null
  customer_instagram?: string | null
  budget:              number | null
  status:              string
  notes?:              string | null
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DealStatus }) {
  const found = DEAL_STATUSES.find((s) => s.value === status)
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${found?.color ?? 'bg-gray-700 text-gray-300'}`}>
      {found?.label ?? status}
    </span>
  )
}

// ── Field Wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  optional,
  children,
  hint,
}: {
  label:     string
  optional?: boolean
  children:  React.ReactNode
  hint?:     string
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

// ── Live Exchange Rate Hook ───────────────────────────────────────────────────
function useEurToEgp() {
  const [rate,    setRate]    = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  async function fetchRate(): Promise<number | null> {
    setLoading(true)
    setError(false)

    const APIs = [
      async () => {
        const res  = await fetch('https://open.er-api.com/v6/latest/EUR')
        const data = await res.json()
        if (data?.rates?.EGP) return data.rates.EGP as number
        throw new Error('no EGP')
      },
      async () => {
        const res  = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
        )
        const data = await res.json()
        if (data?.eur?.egp) return data.eur.egp as number
        throw new Error('no EGP')
      },
      async () => {
        const res  = await fetch('https://api.frankfurter.app/latest?from=EUR&to=EGP')
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
function DealFormFields({
  deal,
  productRequests,
}: {
  deal?:           Deal
  productRequests: ProductRequest[]
}) {
  const { rate: liveRate, loading: rateLoading, error: rateError, refetch } = useEurToEgp()

  // ✅ All fields fully controlled
  const [customerName,      setCustomerName]     = useState(deal?.customer_name       ?? '')
  const [customerPhone,     setCustomerPhone]     = useState(deal?.phone               ?? '')
  const [customerInstagram, setCustomerInstagram] = useState(deal?.customer_instagram  ?? '')
  const [sellingPrice,      setSellingPrice]      = useState(deal?.selling_price_egp?.toString()    ?? '')
  const [depositAmount,     setDepositAmount]     = useState(deal?.deposit_amount_egp?.toString()   ?? '')
  const [remainingAmount,   setRemainingAmount]   = useState(deal?.remaining_amount_egp?.toString() ?? '')
  const [commissionEgp,     setCommissionEgp]     = useState(deal?.commission_egp?.toString()       ?? '0')
  const [notes,             setNotes]             = useState(deal?.notes               ?? '')
  const [sourcePriceEur,    setSourcePriceEur]    = useState(deal?.source_price_eur?.toString()     ?? '')

  // ✅ Typed controlled selects
  const [status,         setStatus]         = useState<DealStatusValue>(
    (deal?.status as DealStatusValue) ?? 'deposit_pending'
  )
  const [sourcePlatform, setSourcePlatform] = useState<string>(
    deal?.source_platform ?? ''
  )
  const [saleChannel,    setSaleChannel]    = useState<SaleChannel>(
    (deal?.sale_channel as SaleChannel) ?? 'whatsapp'
  )
  const [requestId,      setRequestId]      = useState<string>(
    deal?.product_request_id ? String(deal.product_request_id) : ''
  )

  // ✅ Exchange rate: use deal value when editing, inject live rate when creating
  const [exchangeRate, setExchangeRate] = useState(
    deal?.exchange_rate ? String(deal.exchange_rate) : ''
  )

  const rateInjected = useRef(false)
  useEffect(() => {
    if (!deal && liveRate && !rateInjected.current) {
      setExchangeRate(String(liveRate))
      rateInjected.current = true
    }
  }, [liveRate, deal])

  const calculatedEgp =
    sourcePriceEur && exchangeRate
      ? Math.round(parseFloat(sourcePriceEur) * parseFloat(exchangeRate))
      : null

  function handleRequestChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    setRequestId(id)
    const req = productRequests.find((r) => r.id === Number(id))
    if (!req) return
    if (req.customer_name)      setCustomerName(req.customer_name)
    if (req.phone)              setCustomerPhone(req.phone)
    if (req.customer_instagram) setCustomerInstagram(req.customer_instagram)
    if (req.budget)             setSellingPrice(String(req.budget))
    if (req.notes)              setNotes(req.notes)
  }

  function handleDepositChange(e: React.ChangeEvent<HTMLInputElement>) {
    const deposit = parseFloat(e.target.value) || 0
    const selling = parseFloat(sellingPrice)   || 0
    setDepositAmount(e.target.value)
    if (selling > 0) setRemainingAmount(String(Math.max(0, selling - deposit)))
  }

  function handleSellingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selling = parseFloat(e.target.value) || 0
    const deposit = parseFloat(depositAmount)  || 0
    setSellingPrice(e.target.value)
    if (deposit > 0) setRemainingAmount(String(Math.max(0, selling - deposit)))
  }

  return (
    <>
      {/* ── Linked Request ─────────────────────────────────────────── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
          Linked Request
        </p>
        <Field label="Link to Product Request" optional>
          <input type="hidden" name="product_request_id" value={requestId} />
          <select
            value={requestId}
            onChange={handleRequestChange}
            className={inputClass}
          >
            <option value="">No linked request</option>
            {productRequests.map((r) => (
              <option key={r.id} value={String(r.id)}>
                #{r.id} - {r.requested_product ?? 'Unknown'} ({r.customer_name ?? 'No name'})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Customer Info ──────────────────────────────────────────── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
          Customer Info
        </p>
      </div>

      <Field label="Customer Name">
        <input
          name="customer_name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className={inputClass}
          placeholder="e.g. Ahmed Mohamed"
        />
      </Field>

      <Field label="Customer Phone">
        <input
          name="phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className={inputClass}
          placeholder="e.g. 01012345678"
        />
      </Field>

      <Field label="Customer Instagram">
        <input
          name="customer_instagram"
          value={customerInstagram}
          onChange={(e) => setCustomerInstagram(e.target.value)}
          className={inputClass}
          placeholder="e.g. @username"
        />
      </Field>

      {/* ✅ Sale Channel — controlled + hidden input + objects from types */}
      <Field label="Sale Channel">
        <input type="hidden" name="sale_channel" value={saleChannel} />
        <select
          value={saleChannel}
          onChange={(e) => setSaleChannel(e.target.value as SaleChannel)}
          className={inputClass}
        >
          {SALE_CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </Field>

      {/* ── Deal Info ──────────────────────────────────────────────── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2 mt-2">
          Deal Info
        </p>
      </div>

      {/* ✅ Status — controlled + hidden input */}
      <Field label="Status">
        <input type="hidden" name="status" value={status} />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DealStatusValue)}
          className={inputClass}
        >
          {DEAL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      {/* ✅ Source Platform — controlled + hidden input */}
      <Field label="Source Platform">
        <input type="hidden" name="source_platform" value={sourcePlatform} />
        <select
          value={sourcePlatform}
          onChange={(e) => setSourcePlatform(e.target.value)}
          className={inputClass}
        >
          <option value="">Select platform...</option>
          {SOURCE_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <div className="col-span-2">
        <Field label="Source Link" optional>
          <input
            name="source_link"
            type="url"
            defaultValue={deal?.source_link ?? ''}
            className={inputClass}
            placeholder="https://www.kleinanzeigen.de/..."
          />
        </Field>
      </div>

      {/* ── Financials ─────────────────────────────────────────────── */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2 mt-2">
          Financials
        </p>
      </div>

      <Field label="Source Price (EUR)">
        <input
          name="source_price_eur"
          type="number"
          step="0.01"
          value={sourcePriceEur}
          onChange={(e) => setSourcePriceEur(e.target.value)}
          className={inputClass}
          placeholder="0.00"
        />
        {calculatedEgp !== null && exchangeRate && (
          <p className="text-xs text-indigo-400 mt-1">
            ≈ {calculatedEgp.toLocaleString()} EGP
            <span className="text-gray-600 ml-1">(at {exchangeRate} EGP/EUR)</span>
          </p>
        )}
      </Field>

      <Field
        label="Exchange Rate (EUR to EGP)"
        hint={
          rateLoading ? 'جاري تحميل السعر...'
          : rateError  ? 'تعذر تحميل السعر'
          : liveRate   ? `السعر الحالي: ${liveRate}`
          : ''
        }
      >
        <div className="flex gap-2">
          <input
            name="exchange_rate"
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            className={`${inputClass} ${liveRate ? 'border-indigo-600' : ''}`}
            placeholder="0.00"
          />
          <button
            type="button"
            onClick={async () => {
              const freshRate = await refetch()
              if (freshRate) setExchangeRate(String(freshRate))
            }}
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

      <Field label="Selling Price (EGP)">
        <input
          name="selling_price_egp"
          type="number"
          step="0.01"
          value={sellingPrice}
          onChange={handleSellingChange}
          className={inputClass}
          placeholder="0.00"
        />
      </Field>

      <Field label="Deposit Amount (EGP)">
        <input
          name="deposit_amount_egp"
          type="number"
          step="0.01"
          value={depositAmount}
          onChange={handleDepositChange}
          className={inputClass}
          placeholder="0.00"
        />
      </Field>

      <Field label="Remaining Amount (EGP)" hint="يُحسب تلقائياً">
        <input
          name="remaining_amount_egp"
          type="number"
          step="0.01"
          value={remainingAmount}
          onChange={(e) => setRemainingAmount(e.target.value)}
          className={`${inputClass} ${remainingAmount ? 'border-green-700' : ''}`}
          placeholder="0.00"
        />
      </Field>

      <Field label="Commission (EGP)">
        <input
          name="commission_egp"
          type="number"
          step="0.01"
          value={commissionEgp}
          onChange={(e) => setCommissionEgp(e.target.value)}
          className={inputClass}
          placeholder="0.00"
        />
      </Field>

      {/* ── Notes ──────────────────────────────────────────────────── */}
      <div className="col-span-2">
        <Field label="Notes" optional>
          <textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
            placeholder="Any extra info..."
          />
        </Field>
      </div>
    </>
  )
}

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({
  deal,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  deal:           Deal
  onEdit:         (deal: Deal) => void
  onDelete:       (id: string) => void
  onStatusChange: (id: string, status: DealStatus) => void
}) {
  const productName =
    deal.product_request?.requested_product ?? deal.customer_name ?? 'Unknown Deal'

  const currentIndex = DEAL_STATUSES.findIndex((s) => s.value === deal.status)
  const nextStatus   = DEAL_STATUSES[currentIndex + 1]

  // ✅ Channel icon from SALE_CHANNELS array
  function channelIcon(channel: string) {
    return SALE_CHANNELS.find((c) => c.value === channel)?.icon ?? '📦'
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3 hover:border-indigo-700 transition">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white text-sm">{productName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.phone ?? deal.customer_instagram ?? 'No contact info'}
          </p>
        </div>
        <StatusBadge status={deal.status} />
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {deal.selling_price_egp != null && (
          <div className="bg-gray-800 rounded-lg px-2 py-1.5">
            <span className="text-gray-500">Selling </span>
            <span className="font-semibold text-white">
              {deal.selling_price_egp.toLocaleString('en-EG')} EGP
            </span>
          </div>
        )}
        {deal.deposit_amount_egp != null && (
          <div className="bg-gray-800 rounded-lg px-2 py-1.5">
            <span className="text-gray-500">Deposit </span>
            <span className="font-semibold text-white">
              {deal.deposit_amount_egp.toLocaleString('en-EG')} EGP
            </span>
          </div>
        )}
        {deal.remaining_amount_egp != null && (
          <div className="bg-gray-800 rounded-lg px-2 py-1.5">
            <span className="text-gray-500">Remaining </span>
            <span className="font-semibold text-white">
              {deal.remaining_amount_egp.toLocaleString('en-EG')} EGP
            </span>
          </div>
        )}
        {deal.source_price_eur != null && (
          <div className="bg-gray-800 rounded-lg px-2 py-1.5">
            <span className="text-gray-500">Cost </span>
            <span className="font-semibold text-white">€{deal.source_price_eur}</span>
          </div>
        )}
        {deal.source_platform && (
          <div className="bg-gray-800 rounded-lg px-2 py-1.5">
            <span className="text-gray-500">Source </span>
            <span className="font-semibold text-white">{deal.source_platform}</span>
          </div>
        )}
        <div className="bg-gray-800 rounded-lg px-2 py-1.5">
          <span className="text-gray-500">Channel </span>
          <span className="font-semibold text-white capitalize">
            {channelIcon(deal.sale_channel)} {deal.sale_channel}
          </span>
        </div>
      </div>

      {/* Source Link */}
      {deal.source_link && (
        <a
          href={deal.source_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline block truncate"
        >
          🔗 {deal.source_link}
        </a>
      )}

      {/* Notes */}
      {deal.notes && (
        <p className="text-xs text-gray-500 italic">📝 {deal.notes}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {nextStatus && deal.status !== 'cancelled' && (
          <button
            onClick={() => onStatusChange(deal.id, nextStatus.value)}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition"
          >
            Next: {nextStatus.label}
          </button>
        )}
        <button
          onClick={() => onEdit(deal)}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-3 py-1.5 rounded-lg transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(deal.id)}
          className="text-xs bg-red-900/40 hover:bg-red-900/70 text-red-400 font-medium px-3 py-1.5 rounded-lg transition"
        >
          Delete
        </button>
      </div>

      <p className="text-xs text-gray-700">
        Created: {new Date(deal.created_at).toLocaleDateString('en-GB')}
      </p>
    </div>
  )
}

// ── Modal Wrapper ─────────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title:    string
  onClose:  () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg font-bold transition"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Main Client Component ─────────────────────────────────────────────────────
export default function DealsClient({
  deals: initialDeals,
  productRequests,
}: {
  deals:           Deal[]
  productRequests: ProductRequest[]
}) {
  const [deals,        setDeals]        = useState<Deal[]>(initialDeals)
  const [showForm,     setShowForm]     = useState(false)
  const [editingDeal,  setEditingDeal]  = useState<Deal | null>(null)
  const [filterStatus, setFilterStatus] = useState<DealStatus | 'all'>('all')
  const [loading,      setLoading]      = useState(false)

  const activeDeals    = deals.filter((d) => d.status !== 'cancelled' && d.status !== 'completed')
  const completedDeals = deals.filter((d) => d.status === 'completed')
  const totalRevenue   = completedDeals.reduce((s, d) => s + (d.selling_price_egp ?? 0), 0)

  const filteredDeals =
    filterStatus === 'all' ? deals : deals.filter((d) => d.status === filterStatus)

  async function handleCreate(formData: FormData) {
    setLoading(true)
    try {
      await createDeal(formData)
      setShowForm(false)
      window.location.reload()
    } catch (err) {
      console.error('handleCreate error:', err)
      alert('Failed to create deal. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingDeal) return
    setLoading(true)
    try {
      await updateDeal(editingDeal.id, formData)
      setEditingDeal(null)
      window.location.reload()
    } catch (err) {
      console.error('handleUpdate error:', err)
      alert('Failed to update deal. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, status: DealStatus) {
    try {
      await updateDealStatus(id, status)
      window.location.reload()
    } catch (err) {
      console.error('handleStatusChange error:', err)
      alert('Failed to update status. Check console for details.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deal? This cannot be undone.')) return
    try {
      await deleteDeal(id)
      setDeals((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      console.error('handleDelete error:', err)
      alert('Failed to delete deal. Check console for details.')
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deals Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Track every deal from deposit to delivery</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          + New Deal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Deals',    value: activeDeals.length,                   suffix: ''     },
          { label: 'Completed Deals', value: completedDeals.length,                suffix: ''     },
          { label: 'Total Revenue',   value: totalRevenue.toLocaleString('en-EG'), suffix: ' EGP' },
        ].map(({ label, value, suffix }) => (
          <div key={label} className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-indigo-400 mt-1">{value}{suffix}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
            filterStatus === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({deals.length})
        </button>
        {DEAL_STATUSES.map((s) => {
          const count = deals.filter((d) => d.status === s.value).length
          if (count === 0) return null
          return (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                filterStatus === s.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-4xl mb-3">🤝</p>
          <p className="font-medium">No deals yet — create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEdit={setEditingDeal}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <Modal title="New Deal" onClose={() => setShowForm(false)}>
          <form action={handleCreate} className="grid grid-cols-2 gap-4">
            <DealFormFields productRequests={productRequests} />
            <div className="col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Create Deal'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingDeal && (
        <Modal title="Edit Deal" onClose={() => setEditingDeal(null)}>
          <form action={handleUpdate} className="grid grid-cols-2 gap-4">
            <DealFormFields deal={editingDeal} productRequests={productRequests} />
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Update Deal'}
              </button>
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}