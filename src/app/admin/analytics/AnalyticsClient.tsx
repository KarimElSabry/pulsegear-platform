// src/app/admin/analytics/AnalyticsClient.tsx
'use client'

import { formatEGP } from '@/lib/format'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, useEffect } from 'react'
import { addSale, updateSale, deleteSale } from '../sales/actions'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import StatCard from './StatCard'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalProducts:      number
  availableProducts:  number
  soldProducts:       number
  reservedProducts:   number
  outOfStockProducts: number
  totalRevenue:       number
  discountedRevenue:  number
  totalSavingsGiven:  number
  avgProductPrice:    number
  totalReservations:     number
  pendingReservations:   number
  confirmedReservations: number
  cancelledReservations: number
  discountCodes: {
    code:             string
    discount_percent: number
    usage_count:      number
    is_active:        boolean
  }[]
  topReservedProducts: {
    title:        string
    reservations: number
    revenue:      number
  }[]
  byCategory: { category: string; count: number }[]
  byBrand:    { brand: string;    count: number }[]
  reservationsOverTime: { date: string; reservations: number; revenue: number }[]
  productsOverTime:     { date: string; count: number }[]
  totalLikes:        number
  mostLikedProducts: { title: string; likes: number }[]
  totalSalesCount:   number
  totalSalesRevenue: number
  totalSalesProfit:  number
  totalSalesCost:    number
  avgProfitMargin:   number
  salesByChannel: {
    channel: string
    count:   number
    revenue: number
    profit:  number
  }[]
  salesOverTime: {
    date:    string
    revenue: number
    profit:  number
    count:   number
  }[]
  recentSales: {
    id:                string
    product_name:      string
    selling_price_egp: number
    profit_egp:        number
    profit_margin_pct: number
    sale_channel:      string
    sale_date:         string
    cost_egp:          number
    commission_egp:    number
    original_eur:      number
    shipping_eur:      number
    exchange_rate:     number
    notes?:            string
  }[]
}

// ─── EditSale Type ────────────────────────────────────────────────────────────

interface EditSale {
  id:                string
  product_name:      string
  selling_price_egp: number
  profit_egp:        number
  profit_margin_pct: number
  sale_channel:      string
  sale_date:         string
  cost_egp:          number
  commission_egp:    number
  original_eur:      number
  shipping_eur:      number
  exchange_rate:     number
  notes?:            string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#a855f7', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899']

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border:          '1px solid #3f3f46',
  borderRadius:    '12px',
  color:           '#fff',
}

const FALLBACK_RATE        = 55
const DEFAULT_SHIPPING_EUR = 10

// ─── Manual Sale Form ─────────────────────────────────────────────────────────

function ManualSaleForm({
  editSale,
  onClose,
}: {
  editSale?: EditSale
  onClose?:  () => void
}) {
  const isEditing = !!editSale

  const router                       = useRouter()
  const formRef                      = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess]        = useState(false)

  // ── EUR → EGP Rate ──────────────────────────────────────────────
  const [eurRate,     setEurRate]     = useState<number | null>(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError,   setRateError]   = useState(false)

  // ── Pre-fill rate if editing ─────────────────────────────────────
  const [manualRate, setManualRate] = useState<string>(
    editSale ? String(editSale.exchange_rate) : ''
  )

  // ── Calculator Inputs — pre-fill if editing ──────────────────────
  const [originalEur, setOriginalEur] = useState(editSale ? String(editSale.original_eur)      : '')
  const [shippingEur, setShippingEur] = useState(editSale ? String(editSale.shipping_eur)      : String(DEFAULT_SHIPPING_EUR))
  const [sellingEgp,  setSellingEgp]  = useState(editSale ? String(editSale.selling_price_egp) : '')

  // ── Commission % — back-calculate from EGP amount ───────────────
  const [commissionPct, setCommissionPct] = useState(() => {
    if (!editSale) return '0'
    if (editSale.selling_price_egp > 0 && editSale.commission_egp > 0) {
      return ((editSale.commission_egp / editSale.selling_price_egp) * 100).toFixed(1)
    }
    return '0'
  })

  // ── Derived ─────────────────────────────────────────────────────
  const effectiveRate = manualRate ? parseFloat(manualRate) : eurRate ?? null

  const costEgp =
    effectiveRate && originalEur
      ? (parseFloat(originalEur) + parseFloat(shippingEur || '0')) * effectiveRate
      : null

  const commissionAmt =
    sellingEgp && commissionPct && parseFloat(commissionPct) > 0
      ? (parseFloat(sellingEgp) * parseFloat(commissionPct)) / 100
      : 0

  const profitEgp =
    costEgp !== null && sellingEgp
      ? parseFloat(sellingEgp) - costEgp - commissionAmt
      : null

  const profitMarginPct =
    profitEgp !== null && sellingEgp && parseFloat(sellingEgp) > 0
      ? (profitEgp / parseFloat(sellingEgp)) * 100
      : null

  // ── Fetch Live Rate ──────────────────────────────────────────────
  async function fetchRate() {
    setRateLoading(true)
    setRateError(false)

    const APIs = [
      async () => {
        const res  = await fetch('https://open.er-api.com/v6/latest/EUR')
        const data = await res.json()
        if (data?.rates?.EGP) return data.rates.EGP
        throw new Error('no EGP')
      },
      async () => {
        const res  = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
        )
        const data = await res.json()
        if (data?.eur?.egp) return data.eur.egp
        throw new Error('no EGP')
      },
      async () => {
        const res  = await fetch('https://api.frankfurter.app/latest?from=EUR&to=EGP')
        const data = await res.json()
        if (data?.rates?.EGP) return data.rates.EGP
        throw new Error('no EGP')
      },
    ]

    for (const api of APIs) {
      try {
        const rate = await api()
        setEurRate(rate)
        setRateError(false)
        setRateLoading(false)
        return
      } catch { continue }
    }

    setEurRate(null)
    setRateError(true)
    setRateLoading(false)
  }

  // ── Only auto-fetch rate when adding new sale ────────────────────
  useEffect(() => {
    if (!isEditing) fetchRate()
  }, [isEditing])

  // ── Submit ──────────────────────────────────────────────────────
  async function handleSubmit(formData: FormData) {
    if (effectiveRate)            formData.set('exchange_rate',     String(effectiveRate))
    if (costEgp)                  formData.set('cost_egp',          String(Math.round(costEgp)))
    if (profitEgp !== null)       formData.set('profit_egp',        String(Math.round(profitEgp)))
    if (profitMarginPct !== null) formData.set('profit_margin_pct', String(profitMarginPct.toFixed(2)))
    formData.set('commission_egp', String(Math.round(commissionAmt)))

    startTransition(async () => {
      if (isEditing && editSale) {
        await updateSale(editSale.id, formData)
        onClose?.()
      } else {
        await addSale(formData)
        formRef.current?.reset()
        setOriginalEur('')
        setShippingEur(String(DEFAULT_SHIPPING_EUR))
        setSellingEgp('')
        setCommissionPct('0')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
      router.refresh()
    })
  }

  return (
    <section className={`bg-zinc-900 rounded-2xl p-6 border ${isEditing ? 'border-purple-700' : 'border-green-800'}`}>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {isEditing ? '✏️ Edit Sale' : '💰 Record Manual Sale'}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {isEditing
              ? 'Modify the sale details — profit recalculates live'
              : 'Log a sale — the calculator auto-computes cost, commission & profit'}
          </p>
        </div>
        {isEditing && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl leading-none transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-4 bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-semibold px-4 py-3 rounded-xl">
          ✅ Sale recorded! Analytics updated automatically.
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-6">

        {/* Product Name */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-200">
            Product Name <span className="text-purple-400">*</span>
          </label>
          <input
            name="product_name"
            required
            disabled={isPending}
            defaultValue={editSale?.product_name ?? ''}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50"
            placeholder="e.g. Garmin Forerunner 965"
          />
        </div>

        {/* ── Live EUR → EGP Calculator ─────────────────────────────── */}
        <div className="bg-gray-900 border border-purple-800 rounded-2xl p-5 space-y-5">

          {/* Rate Badge + Refresh */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest">
              💱 Live EUR → EGP Calculator
            </h3>
            <div className="flex items-center gap-2">
              {rateLoading ? (
                <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                  ⏳ Fetching rate...
                </span>
              ) : effectiveRate ? (
                <span className="text-xs text-green-400 bg-gray-800 px-3 py-1 rounded-full">
                  📈 1 EUR = {effectiveRate.toFixed(2)} EGP
                  {manualRate ? ' (manual)' : ' (live)'}
                </span>
              ) : (
                <span className="text-xs text-yellow-400 bg-gray-800 px-3 py-1 rounded-full">
                  ⚠️ Rate unavailable
                </span>
              )}
              {!rateLoading && (
                <button
                  type="button"
                  onClick={fetchRate}
                  className="text-xs text-purple-400 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full transition"
                >
                  🔄 Refresh
                </button>
              )}
            </div>
          </div>

          {/* Manual Rate Override */}
          {(rateError || !eurRate || isEditing) && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-yellow-400 uppercase tracking-widest">
                {isEditing ? '💱 Exchange Rate Used' : '⚠️ API unavailable — Enter rate manually'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
                  className="flex-1 bg-gray-800 border border-yellow-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                  placeholder={`e.g. ${FALLBACK_RATE}`}
                />
                <span className="text-gray-400 text-sm whitespace-nowrap">EGP / EUR</span>
              </div>
              {!isEditing && (
                <p className="text-xs text-gray-500">
                  Check on{' '}
                  <a
                    href="https://www.google.com/search?q=EUR+to+EGP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 underline"
                  >
                    Google
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Step 1 — EUR Price */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Step 1 — Original Price (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={originalEur}
              onChange={(e) => setOriginalEur(e.target.value)}
              disabled={isPending}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50"
              placeholder="e.g. 49.99"
            />
            {effectiveRate && originalEur && (
              <p className="text-xs text-purple-400 mt-1">
                ≈ {(parseFloat(originalEur) * effectiveRate).toFixed(0)} EGP
              </p>
            )}
          </div>

          {/* Step 2 — Shipping */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Step 2 — Shipping to Egypt (EUR)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                value={shippingEur}
                onChange={(e) => setShippingEur(e.target.value)}
                disabled={isPending}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50"
              />
              <span className="text-gray-400 text-sm">EUR</span>
              <button
                type="button"
                onClick={() => setShippingEur(String(DEFAULT_SHIPPING_EUR))}
                className="text-xs text-purple-400 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition whitespace-nowrap"
              >
                Reset to {DEFAULT_SHIPPING_EUR}€
              </button>
            </div>
            {effectiveRate && shippingEur && (
              <p className="text-xs text-gray-500 mt-1">
                📦 ≈ {(parseFloat(shippingEur) * effectiveRate).toFixed(0)} EGP
              </p>
            )}
          </div>

          {/* Step 3 — Selling Price EGP */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Step 3 — Actual Selling Price (EGP)
            </label>
            <input
              type="number"
              step="1"
              value={sellingEgp}
              onChange={(e) => setSellingEgp(e.target.value)}
              disabled={isPending}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50"
              placeholder="e.g. 3500"
            />
          </div>

          {/* Step 4 — Commission */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Step 4 — Collaborator Commission (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                disabled={isPending}
                className="w-36 bg-gray-800 border border-pink-700 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition disabled:opacity-50"
                placeholder="0"
              />
              <span className="text-gray-300 text-base font-semibold">% of selling price</span>
              {commissionAmt > 0 && (
                <span className="ml-auto text-pink-400 font-bold text-sm">
                  = {Math.round(commissionAmt).toLocaleString()} EGP
                </span>
              )}
            </div>
          </div>

          {/* ── Live Breakdown ───────────────────────────────────────── */}
          {costEgp !== null && sellingEgp && (
            <div className="bg-gray-800 rounded-xl px-5 py-4 space-y-2 text-sm border border-zinc-700">
              <div className="flex justify-between text-gray-400">
                <span>🛒 Product price</span>
                <span>{parseFloat(originalEur).toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>📦 Shipping</span>
                <span>+ {parseFloat(shippingEur || '0').toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-gray-400 border-t border-gray-700 pt-2">
                <span>💸 Total cost (× {effectiveRate?.toFixed(2)})</span>
                <span className="text-white font-semibold">
                  − {Math.round(costEgp).toLocaleString()} EGP
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>🏷️ Selling price</span>
                <span className="text-white font-semibold">
                  {parseFloat(sellingEgp).toLocaleString()} EGP
                </span>
              </div>
              {commissionAmt > 0 && (
                <div className="flex justify-between text-pink-400">
                  <span>🤝 Commission ({commissionPct}%)</span>
                  <span>− {Math.round(commissionAmt).toLocaleString()} EGP</span>
                </div>
              )}
              <div className={`
                flex justify-between items-center font-black text-lg
                border-t-2 pt-3 mt-1
                ${profitEgp !== null && profitEgp >= 0
                  ? 'border-green-500 text-green-400'
                  : 'border-red-500 text-red-400'}
              `}>
                <span>
                  {profitEgp !== null && profitEgp >= 0 ? '✅ Final Profit' : '❌ Net Loss'}
                </span>
                <span className="text-2xl">
                  {profitEgp !== null
                    ? `${Math.round(profitEgp).toLocaleString()} EGP`
                    : '—'}
                </span>
              </div>
              {profitMarginPct !== null && (
                <div className="flex justify-end pt-1">
                  <span className={`
                    text-xs font-bold px-3 py-1 rounded-full
                    ${profitMarginPct >= 20
                      ? 'bg-green-500/20 text-green-400'
                      : profitMarginPct >= 10
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'}
                  `}>
                    Margin: {profitMarginPct.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden fields */}
        <input type="hidden" name="selling_price_egp" value={sellingEgp || '0'} />
        <input type="hidden" name="exchange_rate"     value={effectiveRate ?? ''} />
        <input type="hidden" name="cost_egp"          value={costEgp !== null ? Math.round(costEgp) : ''} />
        <input type="hidden" name="profit_egp"        value={profitEgp !== null ? Math.round(profitEgp) : ''} />
        <input type="hidden" name="profit_margin_pct" value={profitMarginPct !== null ? profitMarginPct.toFixed(2) : ''} />
        <input type="hidden" name="commission_egp"    value={Math.round(commissionAmt)} />
        <input type="hidden" name="original_eur"      value={originalEur || '0'} />
        <input type="hidden" name="shipping_eur"      value={shippingEur || '0'} />

        {/* Channel + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Sale Channel <span className="text-purple-400">*</span>
            </label>
            <select
              name="sale_channel"
              required
              disabled={isPending}
              defaultValue={editSale?.sale_channel ?? 'whatsapp'}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50"
            >
              <option value="whatsapp">📱 WhatsApp</option>
              <option value="instagram">📸 Instagram</option>
              <option value="website">🌐 Website</option>
              <option value="in_person">🤝 In Person</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Sale Date <span className="text-purple-400">*</span>
            </label>
            <input
              name="sale_date"
              type="date"
              required
              disabled={isPending}
              defaultValue={
                editSale
                  ? editSale.sale_date.split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-200">Notes</label>
          <textarea
            name="notes"
            rows={2}
            disabled={isPending}
            defaultValue={editSale?.notes ?? ''}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none disabled:opacity-50"
            placeholder="Optional notes about this sale..."
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !sellingEgp || !originalEur || !effectiveRate}
          className={`w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition text-lg ${
            isEditing
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isPending
            ? '⏳ Saving...'
            : isEditing
            ? '💾 Save Changes'
            : '💾 Record Sale → Analytics'}
        </button>

      </form>
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {

  const router = useRouter()

  // ── Edit Sale State ──────────────────────────────────────────────
  const [editingSale, setEditingSale] = useState<EditSale | null>(null)

  // ── Delete Sale Handler ──────────────────────────────────────────
  async function handleDelete(id: string, name: string) {
    if (!confirm(`🗑️ Delete "${name}"?\n\nThis cannot be undone.`)) return
    await deleteSale(id)
    router.refresh()
  }

  const statusData = [
    { name: 'Available',    value: data.availableProducts,  color: '#22c55e' },
    { name: 'Sold',         value: data.soldProducts,       color: '#a855f7' },
    { name: 'Reserved',     value: data.reservedProducts,   color: '#f59e0b' },
    { name: 'Out of Stock', value: data.outOfStockProducts, color: '#ef4444' },
  ].filter((d) => d.value > 0)

  const reservationStatusData = [
    { name: 'Pending',   value: data.pendingReservations,   color: '#f59e0b' },
    { name: 'Confirmed', value: data.confirmedReservations, color: '#22c55e' },
    { name: 'Cancelled', value: data.cancelledReservations, color: '#ef4444' },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-10">

      {/* ── Overview Stats ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-white text-xl font-bold mb-4">📦 Products Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total Products"  value={data.totalProducts}      icon="📦" color="purple" />
          <StatCard title="Available"       value={data.availableProducts}  icon="✅" color="green"  />
          <StatCard title="Sold"            value={data.soldProducts}       icon="💜" color="purple" />
          <StatCard title="Reserved"        value={data.reservedProducts}   icon="🔒" color="yellow" />
          <StatCard title="Out of Stock"    value={data.outOfStockProducts} icon="❌" color="red"    />
        </div>
      </section>

      {/* ── Revenue Stats ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-white text-xl font-bold mb-4">💰 Revenue — Reservations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Revenue"       value={formatEGP(data.totalRevenue)}      subtitle="From confirmed reservations" icon="💰" color="green"  />
          <StatCard title="Discounted Revenue"  value={formatEGP(data.discountedRevenue)} subtitle="After discount codes"        icon="🏷️" color="blue"   />
          <StatCard title="Total Savings Given" value={formatEGP(data.totalSavingsGiven)} subtitle="Discount value given"        icon="🎁" color="pink"   />
          <StatCard title="Avg Product Price"   value={formatEGP(data.avgProductPrice)}   subtitle="Across all products"         icon="📊" color="purple" />
        </div>
      </section>

      {/* ── Reservations Stats ───────────────────────────────────────── */}
      <section>
        <h2 className="text-white text-xl font-bold mb-4">📋 Reservations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Reservations" value={data.totalReservations}     icon="📋" color="blue"   />
          <StatCard title="Pending"             value={data.pendingReservations}   icon="⏳" color="yellow" />
          <StatCard title="Confirmed"           value={data.confirmedReservations} icon="✅" color="green"  />
          <StatCard title="Cancelled"           value={data.cancelledReservations} icon="❌" color="red"    />
        </div>
      </section>

      {/* ── Sales Overview ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-white text-xl font-bold mb-4">🛍️ Sales Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total Sales"   value={data.totalSalesCount}                          icon="🛍️" color="purple" />
          <StatCard title="Sales Revenue" value={formatEGP(data.totalSalesRevenue)} subtitle="Total selling price"   icon="💵" color="green"  />
          <StatCard title="Total Profit"  value={formatEGP(data.totalSalesProfit)}  subtitle="Revenue minus cost"    icon="📈" color="blue"   />
          <StatCard title="Total Cost"    value={formatEGP(data.totalSalesCost)}    subtitle="Purchase + shipping"   icon="🧾" color="yellow" />
          <StatCard title="Avg Margin"    value={`${data.avgProfitMargin.toFixed(1)}%`}         subtitle="Average profit margin" icon="📊" color="pink"   />
        </div>
      </section>

      {/* ── Charts Row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">🥧 Products by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={4} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}
                >
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 text-center py-10">No data yet</p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">🥧 Reservations by Status</h3>
          {reservationStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={reservationStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={4} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}
                >
                  {reservationStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 text-center py-10">No data yet</p>
          )}
        </div>
      </div>

      {/* ── Reservations Over Time ───────────────────────────────────── */}
      {data.reservationsOverTime.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">📈 Reservations & Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.reservationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
              <Line yAxisId="left"  type="monotone" dataKey="reservations" stroke="#a855f7" strokeWidth={2} dot={false} name="Reservations"  />
              <Line yAxisId="right" type="monotone" dataKey="revenue"      stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue (EGP)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Products Over Time ───────────────────────────────────────── */}
      {data.productsOverTime.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">📦 Products Added — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.productsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} name="Products Added" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Sales Over Time ──────────────────────────────────────────── */}
      {data.salesOverTime.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">📈 Sales Revenue & Profit — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} dot={false} name="Revenue (EGP)" />
              <Line type="monotone" dataKey="profit"  stroke="#22c55e" strokeWidth={2} dot={false} name="Profit (EGP)"  />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Charts Row 2 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.byCategory.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">🏷️ Products by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.byCategory} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number"   tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Products">
                  {data.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.byBrand.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">👟 Products by Brand</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.byBrand} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number"   tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="brand" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Products">
                  {data.byBrand.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Sales by Channel ─────────────────────────────────────────── */}
      {data.salesByChannel.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">📡 Sales by Channel</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.salesByChannel}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="channel"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {data.salesByChannel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="overflow-x-auto self-center">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-3 pr-4">Channel</th>
                    <th className="text-right py-3 pr-4">Sales</th>
                    <th className="text-right py-3 pr-4">Revenue</th>
                    <th className="text-right py-3">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.salesByChannel.map((ch, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                      <td className="py-3 pr-4 text-white font-medium capitalize">{ch.channel}</td>
                      <td className="py-3 pr-4 text-right text-purple-400 font-bold">{ch.count}</td>
                      <td className="py-3 pr-4 text-right text-green-400 font-bold">{formatEGP(ch.revenue)}</td>
                      <td className="py-3 text-right text-blue-400 font-bold">{formatEGP(ch.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Reserved Products ────────────────────────────────────── */}
      {data.topReservedProducts.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">🏆 Top Reserved Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-3 pr-4">#</th>
                  <th className="text-left py-3 pr-4">Product</th>
                  <th className="text-right py-3 pr-4">Reservations</th>
                  <th className="text-right py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topReservedProducts.map((p, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                    <td className="py-3 pr-4 text-zinc-500 font-bold">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td className="py-3 pr-4 text-white font-medium">{p.title}</td>
                    <td className="py-3 pr-4 text-right text-purple-400 font-bold">{p.reservations}</td>
                    <td className="py-3 text-right text-green-400 font-bold">
                      {p.revenue > 0 ? formatEGP(p.revenue) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent Sales ─────────────────────────────────────────────── */}
      {data.recentSales.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">🧾 Recent Sales (Last 10)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-3 pr-4">Product</th>
                  <th className="text-left py-3 pr-4">Date</th>
                  <th className="text-left py-3 pr-4">Channel</th>
                  <th className="text-right py-3 pr-4">Cost</th>
                  <th className="text-right py-3 pr-4">Revenue</th>
                  <th className="text-right py-3 pr-4">Profit</th>
                  <th className="text-right py-3 pr-4">Margin</th>
                  <th className="text-right py-3 pr-4">Edit</th>
                  <th className="text-right py-3">Delete</th>  {/* ✅ NEW */}
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                    <td className="py-3 pr-4 text-white font-medium max-w-[180px] truncate">{s.product_name}</td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {new Date(s.sale_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full capitalize">{s.sale_channel}</span>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{formatEGP(s.cost_egp)}</td>
                    <td className="py-3 pr-4 text-right text-green-400 font-bold">{formatEGP(s.selling_price_egp)}</td>
                    <td className="py-3 pr-4 text-right text-blue-400 font-bold">{formatEGP(s.profit_egp)}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        s.profit_margin_pct >= 20 ? 'bg-green-500/20 text-green-400'
                        : s.profit_margin_pct >= 10 ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                        {s.profit_margin_pct.toFixed(1)}%
                      </span>
                    </td>

                    {/* ✏️ Edit */}
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => setEditingSale(s)}
                        className="text-zinc-500 hover:text-purple-400 transition text-base"
                        title="Edit sale"
                      >
                        ✏️
                      </button>
                    </td>

                    {/* 🗑️ Delete — ✅ NEW */}
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id, s.product_name)}
                        className="text-zinc-500 hover:text-red-400 transition text-base"
                        title="Delete sale"
                      >
                        🗑️
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Discount Codes ───────────────────────────────────────────── */}
      {data.discountCodes.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">🏷️ Discount Codes Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-3 pr-4">Code</th>
                  <th className="text-right py-3 pr-4">Discount</th>
                  <th className="text-right py-3 pr-4">Times Used</th>
                  <th className="text-right py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.discountCodes.map((dc, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                    <td className="py-3 pr-4 text-white font-mono font-bold">{dc.code}</td>
                    <td className="py-3 pr-4 text-right text-yellow-400 font-bold">{dc.discount_percent}%</td>
                    <td className="py-3 pr-4 text-right text-blue-400 font-bold">{dc.usage_count ?? 0}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        dc.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {dc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Most Liked Products ──────────────────────────────────────── */}
      {data.mostLikedProducts.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">
            ❤️ Most Liked Products
            <span className="text-zinc-500 text-sm font-normal ml-2">(Total: {data.totalLikes})</span>
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.mostLikedProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="title" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="likes" radius={[6, 6, 0, 0]} name="Likes">
                {data.mostLikedProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Add New Sale Form ────────────────────────────────────────── */}
      <ManualSaleForm />

      {/* ── Edit Sale Modal ──────────────────────────────────────────── */}
      {editingSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingSale(null) }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <ManualSaleForm
              editSale={editingSale}
              onClose={() => setEditingSale(null)}
            />
          </div>
        </div>
      )}

    </div>
  )
}