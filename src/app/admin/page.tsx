// src/app/admin/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { addProduct , addSale } from './actions'

const FALLBACK_RATE = 55
const DEFAULT_SHIPPING_EUR = 10

export default function AdminPage() {
  const [imageUrls, setImageUrls]         = useState<string[]>([])
  const [manualUrls, setManualUrls]       = useState<string>('')
  const [uploading, setUploading]         = useState(false)
  const formRef                           = useRef<HTMLFormElement>(null)

  const [eurRate, setEurRate]             = useState<number | null>(null)
  const [rateLoading, setRateLoading]     = useState(false)
  const [rateError, setRateError]         = useState(false)
  const [manualRate, setManualRate]       = useState<string>('')
  const [originalEur, setOriginalEur]     = useState<string>('')
  const [shippingEur, setShippingEur]     = useState<string>(String(DEFAULT_SHIPPING_EUR))
  const [marginPct, setMarginPct]         = useState<string>('20')
  const [baseEgp, setBaseEgp]             = useState<number | null>(null)
  const [sellingPrice, setSellingPrice]   = useState<string>('')

  const effectiveRate = manualRate
    ? parseFloat(manualRate)
    : eurRate ?? null

  // ─── Multi-API Fallback Chain ──────────────────────────────────────────────
  async function fetchRate() {
    setRateLoading(true)
    setRateError(false)

    const APIs = [
      async () => {
        const res  = await fetch('https://open.er-api.com/v6/latest/EUR')
        const data = await res.json()
        if (data?.rates?.EGP) return data.rates.EGP
        throw new Error('No EGP')
      },
      async () => {
        const res  = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
        )
        const data = await res.json()
        if (data?.eur?.egp) return data.eur.egp
        throw new Error('No EGP')
      },
      async () => {
        const res  = await fetch('https://api.frankfurter.app/latest?from=EUR&to=EGP')
        const data = await res.json()
        if (data?.rates?.EGP) return data.rates.EGP
        throw new Error('No EGP')
      },
    ]

    for (const api of APIs) {
      try {
        const rate = await api()
        setEurRate(rate)
        setRateError(false)
        setRateLoading(false)
        return
      } catch {
        continue
      }
    }

    setEurRate(null)
    setRateError(true)
    setRateLoading(false)
  }

  useEffect(() => { fetchRate() }, [])

  // ─── Auto-calculate whenever inputs change ─────────────────────────────────
  useEffect(() => {
    const eur      = parseFloat(originalEur)
    const shipping = parseFloat(shippingEur) || 0
    const margin   = parseFloat(marginPct)
    const rate     = effectiveRate

    const priceInput = formRef.current?.querySelector<HTMLInputElement>('input[name="price"]')

    if (!eur || !rate) {
      setBaseEgp(null)
      setSellingPrice('')
      if (priceInput) priceInput.value = ''
      return
    }

    const totalEur = eur + shipping
    const base     = totalEur * rate
    const final    = base * (1 + (isNaN(margin) ? 0 : margin) / 100)
    const rounded  = Math.ceil(final).toString()

    setBaseEgp(base)
    setSellingPrice(rounded)
    if (priceInput) priceInput.value = rounded

  }, [originalEur, shippingEur, eurRate, marginPct, manualRate])

  // ─── Handle Image Upload ───────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const uploaded: string[] = []

    for (const file of files) {
      const ext      = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false })

      if (error) { console.error('Upload error:', error.message); continue }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      if (data?.publicUrl) uploaded.push(data.publicUrl)
    }

    setImageUrls((prev) => [...prev, ...uploaded])
    setUploading(false)
  }

  // ─── Remove Uploaded Image ─────────────────────────────────────────────────
  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Full Reset ────────────────────────────────────────────────────────────
  function resetForm() {
    setImageUrls([])
    setManualUrls('')
    setOriginalEur('')
    setShippingEur(String(DEFAULT_SHIPPING_EUR))
    setMarginPct('20')
    setBaseEgp(null)
    setSellingPrice('')
    setManualRate('')
    formRef.current?.reset()
  }

  // ─── Form Submit ───────────────────────────────────────────────────────────
  async function handleSubmit(formData: FormData) {
    const manualList = manualUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean)

    formData.set('images', [...imageUrls, ...manualList].join('\n'))
    await addProduct(formData)
    resetForm()
  }

  return (
    <div className="max-w-2xl mx-auto p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Add New Product</h1>
        <p className="text-gray-400 mt-1">Fill in the details below to list a new item</p>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-6">

        {/* Vinted Item ID */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-200">
            Vinted Item ID <span className="text-purple-400">*</span>
          </label>
          <input
            name="vinted_id"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition font-mono tracking-widest"
            placeholder="e.g. 9221330612"
          />
          <p className="text-xs text-gray-500 mt-1">
            📌 The numeric ID from the Vinted URL — used to identify this exact listing
          </p>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-200">
            Seller Description <span className="text-purple-400">*</span>
          </label>
          <input
            name="title"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            placeholder="e.g. Garmin HRM-Pro Heart Rate Strap"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-200">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
            placeholder="Product description..."
          />
        </div>

        {/* ===== PRICE CALCULATOR ===== */}
        <div className="bg-gray-900 border border-purple-800 rounded-2xl p-5 space-y-4">

          {/* Header + Rate Badge */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest">
              💱 Price Calculator
            </h2>

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

              {rateError && !manualRate && (
                <button
                  type="button"
                  onClick={fetchRate}
                  className="text-xs text-purple-400 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full transition"
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>

          {/* Manual Rate Override */}
          {(rateError || !eurRate) && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-yellow-400 uppercase tracking-widest">
                ⚠️ API unavailable — Enter rate manually
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
                  className="flex-1 bg-gray-800 border border-yellow-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                  placeholder={`e.g. ${FALLBACK_RATE} (current approx. rate)`}
                />
                <span className="text-gray-400 text-sm whitespace-nowrap">EGP / EUR</span>
              </div>
              <p className="text-xs text-gray-500">
                💡 Check the current rate on{' '}
                <a
                  href="https://www.google.com/search?q=EUR+to+EGP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 underline"
                >
                  Google
                </a>
              </p>
            </div>
          )}

          {/* Step 1 — EUR Price */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Step 1 — Enter Original Price in EUR
            </label>
            <input
              type="number"
              step="0.01"
              value={originalEur}
              onChange={(e) => setOriginalEur(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="e.g. 49.99"
            />
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
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                placeholder="e.g. 10"
              />
              <span className="text-gray-400 text-sm whitespace-nowrap">EUR</span>
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
                📦 Shipping ≈ {(parseFloat(shippingEur) * effectiveRate).toFixed(0)} EGP
              </p>
            )}
          </div>

          {/* Step 3 — Margin */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Step 3 — Set Your Profit Margin (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={marginPct}
                onChange={(e) => setMarginPct(e.target.value)}
                className="flex-1 accent-purple-500"
              />
              <input
                type="number"
                step="1"
                value={marginPct}
                onChange={(e) => setMarginPct(e.target.value)}
                className="w-20 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-center focus:outline-none focus:border-purple-500 transition"
              />
              <span className="text-gray-400 text-sm">%</span>
            </div>
          </div>

          {/* Breakdown */}
          {baseEgp !== null && (
            <div className="bg-gray-800 rounded-xl px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Product price</span>
                <span>{parseFloat(originalEur).toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping to Egypt</span>
                <span>+ {parseFloat(shippingEur || '0').toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-gray-400 border-t border-gray-700 pt-2">
                <span>Total cost in EUR</span>
                <span>{(parseFloat(originalEur) + parseFloat(shippingEur || '0')).toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Converted to EGP (× {effectiveRate?.toFixed(2)})</span>
                <span>{baseEgp.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Profit margin ({marginPct}%)</span>
                <span>+ {(baseEgp * parseFloat(marginPct) / 100).toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-gray-700 pt-2">
                <span>✅ Auto-applied Selling Price</span>
                <span className="text-purple-400 text-base">{sellingPrice} EGP</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Selling Price (EGP) <span className="text-purple-400">*</span>
            </label>
            <input
              name="price"
              type="number"
              required
              step="0.01"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="Auto-filled by calculator ☝️"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">Original Price (EUR)</label>
            <input
              name="original_price"
              type="number"
              step="0.01"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="99.99"
            />
          </div>
        </div>

        {/* Brand & Size */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">Brand</label>
            <input
              name="brand"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="e.g. Garmin, Polar, Wahoo..."
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">Size / Model</label>
            <input
              name="size"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="e.g. HRM-Pro, Forerunner 965..."
            />
          </div>
        </div>

        {/* Condition & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Condition <span className="text-purple-400">*</span>
            </label>
            <select
              name="condition"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            >
              <option value="">Select...</option>
              <option value="New with tags">New with tags</option>
              <option value="New without tags">New without tags</option>
              <option value="Very good">Very good</option>
              <option value="Good">Good</option>
              <option value="Satisfactory">Satisfactory</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">Category</label>
            <select
              name="category"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            >
              <option value="">Select...</option>
              <option value="Fitness Watches">Fitness Watches</option>
              <option value="Heart Rate Straps">Heart Rate Straps</option>
              <option value="Replacement Straps">Replacement Straps</option>
              <option value="Running Accessories">Running Accessories</option>
              <option value="Cycling Accessories">Cycling Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Allow Reservation */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-200">
            Allow Reservation? <span className="text-purple-400">*</span>
          </label>
          <select
            name="is_reservable"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
          >
            <option value="true">✅ Yes — Can be reserved</option>
            <option value="false">🚫 No — Cannot be reserved</option>
          </select>
        </div>

        {/* Source URL */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-200">Source URL</label>
          <input
            name="source_url"
            type="url"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            placeholder="https://www.vinted.com/items/..."
          />
        </div>

        {/* Images */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-200">Product Images</label>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition bg-gray-800/50">
            <span className="text-3xl mb-1">📁</span>
            <span className="text-sm text-gray-400">
              {uploading ? '⏳ Uploading...' : 'Click to upload images from device'}
            </span>
            <span className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP supported</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-xs text-gray-500 uppercase tracking-widest">or paste URLs</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <textarea
            rows={3}
            placeholder={"https://www.vinted.com/photos/...\nhttps://www.vinted.com/photos/..."}
            value={manualUrls}
            onChange={(e) => setManualUrls(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none text-sm font-mono"
          />
          <p className="text-xs text-gray-500">
            📌 One URL per line — paste Vinted image links here
          </p>

          {imageUrls.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">
                📁 Uploaded from device ({imageUrls.length})
              </p>
              <div className="grid grid-cols-3 gap-3">
                {imageUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden border border-gray-700"
                  >
                    <img
                      src={url}
                      alt={`Uploaded ${i + 1}`}
                      className="w-full h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition text-lg"
        >
          ➕ Add Product
        </button>

      </form>
    </div>
  )
}