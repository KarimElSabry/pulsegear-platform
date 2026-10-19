// src/app/admin/inventory/page.tsx

import Link from 'next/link'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { getEgpPerEur, toEur } from '@/lib/finance/fx'
import { inventorySummary, type StockItem } from '@/lib/inventory'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  await assertAdmin()
  const { data, error } = await createAdminSupabaseClient()
    .from('products').select('id, title, brand, status, price_egp, cost_egp, created_at').in('status', ['available', 'reserved'])
  const s = inventorySummary((data ?? []) as StockItem[])
  const fx = await getEgpPerEur()
  const egp = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const eur = (n: number) => { const v = toEur(n, fx.rate); return v === null ? '' : ` · ≈ €${egp(v)}` }
  const tied = s.slow.reduce((a, r) => a + r.price, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">📦 Stock on hand</h1>
        <p className="text-zinc-500 text-sm mt-1">Items still for sale (available or reserved), how old they are, and the money tied up in them.</p>
      </div>
      {error && <p className="text-red-400 text-sm">Could not load stock: {error.message}</p>}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">Items in stock</p><p className="text-2xl font-black text-white">{s.items}</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">Asking value</p><p className="text-xl font-black text-white">{egp(s.retailValue)} EGP</p><p className="text-xs text-zinc-500">{eur(s.retailValue).replace(' · ', '')}</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">What you paid (known costs)</p><p className="text-xl font-black text-white">{egp(s.knownCostValue)} EGP</p><p className="text-xs text-zinc-500">{eur(s.knownCostValue).replace(' · ', '')}</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">No cost recorded</p><p className={`text-2xl font-black ${s.uncosted ? 'text-yellow-300' : 'text-white'}`}>{s.uncosted}</p>{s.uncosted > 0 && <Link href="/admin/analytics/finance" className="text-[11px] text-purple-400">Enter costs (form 7) →</Link>}</div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-3">How long items have been waiting</h2>
        <ul className="space-y-2 text-sm">
          {s.buckets.map((b) => (
            <li key={b.label} className="flex justify-between text-gray-300"><span>{b.label}</span><span>{b.count} item(s) · {egp(b.retail)} EGP{eur(b.retail)}</span></li>
          ))}
        </ul>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
        <h2 className="text-white font-bold">Slow movers (over {s.slowDays} days)</h2>
        <p className="text-zinc-500 text-xs mb-3">{s.slow.length} item(s), {egp(tied)} EGP{eur(tied)} of asking value. Consider a better photo, a lower price, or a deal.</p>
        <table className="w-full text-sm">
          <thead><tr className="text-zinc-500 border-b border-gray-800 text-left"><th className="py-2">Item</th><th>Brand</th><th className="text-right">Days</th><th className="text-right">Price</th><th className="text-right">Cost</th><th className="text-right">Margin</th></tr></thead>
          <tbody>
            {s.slow.slice(0, 40).map((r) => (
              <tr key={r.id} className="border-b border-gray-800/50 text-gray-300">
                <td className="py-2"><Link href={`/products/${r.id}`} className="text-white hover:text-purple-300">{r.title}</Link>{r.status === 'reserved' && <span className="text-yellow-400 text-xs"> · reserved</span>}</td>
                <td>{r.brand}</td><td className="text-right">{r.ageDays}</td><td className="text-right">{egp(r.price)}</td>
                <td className="text-right">{r.cost === null ? <span className="text-yellow-400">?</span> : egp(r.cost)}</td>
                <td className="text-right">{r.marginPct === null ? '' : `${r.marginPct}%`}</td>
              </tr>
            ))}
            {s.slow.length === 0 && <tr><td colSpan={6} className="py-4 text-zinc-500">Nothing is waiting longer than {s.slowDays} days.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  )
}
