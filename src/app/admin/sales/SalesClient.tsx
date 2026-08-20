// src/app/admin/sales/SalesClient.tsx
'use client'

import { useState } from 'react'
import { addSale, updateSale, deleteSale } from './actions'

const PLATFORMS = ['Vinted', 'Facebook', 'eBay', 'Instagram', 'Other']
const CHANNELS  = ['whatsapp', 'instagram', 'facebook', 'other']

type Sale = {
  id: string
  sale_date: string
  product_name: string
  source_platform: string
  source_url: string | null
  original_eur: number
  shipping_eur: number
  exchange_rate: number
  cost_egp: number
  selling_price_egp: number
  profit_egp: number
  profit_margin_pct: number
  commission_egp: number
  sale_channel: string
  notes: string | null
  discount_code: string | null
}

type DiscountCode = { code: string; discount_percent: number }

export default function SalesClient({
  sales,
  discountCodes,
}: {
  sales: Sale[]
  discountCodes: DiscountCode[]
}) {
  const [editingSale, setEditingSale] = useState<Sale | null>(null)

  const totalRevenue = sales.reduce((s, r) => s + r.selling_price_egp, 0)
  const totalProfit  = sales.reduce((s, r) => s + r.profit_egp, 0)
  const totalCost    = sales.reduce((s, r) => s + r.cost_egp, 0)

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <h1 className="text-2xl font-bold">💰 Sales Tracker</h1>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: totalRevenue },
          { label: 'Total Cost',    value: totalCost    },
          { label: 'Total Profit',  value: totalProfit  },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-green-600">
              {value.toLocaleString('en-EG')} EGP
            </p>
          </div>
        ))}
      </div>

      {/* ── Add Sale Form ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">➕ Add New Sale</h2>
        <form action={addSale} className="grid grid-cols-2 gap-4">
          <SaleFormFields discountCodes={discountCodes} />
          <div className="col-span-2">
            <button type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">
              Save Sale
            </button>
          </div>
        </form>
      </div>

      {/* ── Sales Table ── */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Date','Product','Source','Cost EGP','Sold EGP','Profit EGP','Margin','Channel','Code',''].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">
                  No sales yet — add your first one above! 🎉
                </td>
              </tr>
            )}
            {sales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{sale.sale_date}</td>
                <td className="px-4 py-3 font-medium">{sale.product_name}</td>
                <td className="px-4 py-3">
                  <div className="text-xs font-semibold text-blue-600">{sale.source_platform}</div>
                  {sale.source_url && (
                    <a href={sale.source_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-blue-500 underline truncate block max-w-[120px]">
                      link 🔗
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">{sale.cost_egp.toLocaleString('en-EG')}</td>
                <td className="px-4 py-3">{sale.selling_price_egp.toLocaleString('en-EG')}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">
                  {sale.profit_egp.toLocaleString('en-EG')}
                </td>
                <td className="px-4 py-3">{sale.profit_margin_pct}%</td>
                <td className="px-4 py-3 capitalize">{sale.sale_channel}</td>
                <td className="px-4 py-3">
                  {sale.discount_code ? (
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {sale.discount_code}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {/* ✅ Edit Button */}
                  <button
                    onClick={() => setEditingSale(sale)}
                    className="text-blue-400 hover:text-blue-600 text-xs font-medium">
                    Edit
                  </button>
                  <form action={deleteSale.bind(null, sale.id)}>
                    <button type="submit"
                      className="text-red-400 hover:text-red-600 text-xs font-medium">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit Modal ── */}
      {editingSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">✏️ Edit Sale</h2>
              <button onClick={() => setEditingSale(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <form
              action={async (formData) => {
                await updateSale(editingSale.id, formData)
                setEditingSale(null)
              }}
              className="grid grid-cols-2 gap-4"
            >
              <SaleFormFields discountCodes={discountCodes} sale={editingSale} />
              <div className="col-span-2 flex gap-3">
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                  Update Sale
                </button>
                <button type="button" onClick={() => setEditingSale(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Reusable Form Fields ──────────────────────────────────────────────────────
function SaleFormFields({
  discountCodes,
  sale,
}: {
  discountCodes: DiscountCode[]
  sale?: Sale
}) {
  return (
    <>
      {/* Product Name */}
      <div className="col-span-2">
        <label className="text-sm font-medium">Product Name</label>
        <input name="product_name" required defaultValue={sale?.product_name}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="e.g. Nike Air Max 90" />
      </div>

      {/* Source Platform */}
      <div>
        <label className="text-sm font-medium">Source Platform</label>
        <select name="source_platform" required defaultValue={sale?.source_platform}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
          <option value="">Select platform...</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Source URL */}
      <div>
        <label className="text-sm font-medium">Source URL</label>
        <input name="source_url" type="url" defaultValue={sale?.source_url ?? ''}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="https://vinted.com/items/..." />
      </div>

      {/* Original Price EUR */}
      <div>
        <label className="text-sm font-medium">Original Price (EUR)</label>
        <input name="original_eur" type="number" step="0.01" required
          defaultValue={sale?.original_eur}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Shipping EUR */}
      <div>
        <label className="text-sm font-medium">Shipping (EUR)</label>
        <input name="shipping_eur" type="number" step="0.01"
          defaultValue={sale?.shipping_eur ?? 0}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Exchange Rate */}
      <div>
        <label className="text-sm font-medium">Exchange Rate (EUR → EGP)</label>
        <input name="exchange_rate" type="number" step="0.01" required
          defaultValue={sale?.exchange_rate}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Selling Price EGP */}
      <div>
        <label className="text-sm font-medium">Selling Price (EGP)</label>
        <input name="selling_price_egp" type="number" step="0.01" required
          defaultValue={sale?.selling_price_egp}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Profit Margin % */}
      <div>
        <label className="text-sm font-medium">Profit Margin (%)</label>
        <input name="profit_margin_pct" type="number" step="0.01" required
          defaultValue={sale?.profit_margin_pct}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Commission EGP */}
      <div>
        <label className="text-sm font-medium">Commission (EGP)</label>
        <input name="commission_egp" type="number" step="0.01"
          defaultValue={sale?.commission_egp ?? 0}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Sale Channel */}
      <div>
        <label className="text-sm font-medium">Sale Channel</label>
        <select name="sale_channel" required defaultValue={sale?.sale_channel}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
          {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Discount Code ✅ */}
      <div>
        <label className="text-sm font-medium">
          Discount Code <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select name="discount_code" defaultValue={sale?.discount_code ?? ''}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
          <option value="">No discount code</option>
          {discountCodes.map(d => (
            <option key={d.code} value={d.code}>
              {d.code} — {d.discount_percent}% off
            </option>
          ))}
        </select>
      </div>

      {/* Sale Date */}
      <div>
        <label className="text-sm font-medium">Sale Date</label>
        <input name="sale_date" type="date" required
          defaultValue={sale?.sale_date ?? new Date().toISOString().split('T')[0]}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Notes */}
      <div className="col-span-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <textarea name="notes" rows={2} defaultValue={sale?.notes ?? ''}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Any extra info..." />
      </div>
    </>
  )
}