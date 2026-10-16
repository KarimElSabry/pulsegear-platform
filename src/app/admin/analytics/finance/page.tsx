// src/app/admin/analytics/finance/page.tsx

import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { loadDataset } from '@/lib/finance/load'
import { addDays, todayCairo } from '@/lib/finance/range'
import FinanceForms, { type ProductOption, type SaleOption } from './FinanceForms'

export const dynamic = 'force-dynamic'

export default async function FinanceRecordsPage() {
  const supabase = createAdminSupabaseClient()
  const today = todayCairo()
  const ds = await loadDataset(supabase, { from: addDays(today, -120), to: today })

  const sales: SaleOption[] = [...ds.sales]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 150)
    .map((s) => ({
      id: s.id,
      label: `${s.date} · ${s.items.map((i) => i.productName).join(' + ').slice(0, 45)} · ${s.recordedNet.toLocaleString('en-US')} EGP · ${s.id.slice(0, 6)}`,
      status: s.status,
      deliveryStatus: s.deliveryStatus ?? '',
      paymentMethod: s.paymentMethod ?? '',
      orderRef: s.orderRef ?? '',
      discount: s.discount,
      shippingRevenue: s.shippingRevenue,
      cashCollected: s.cashCollected,
      items: s.legacy ? [] : s.items.map((i) => ({ id: i.id, name: i.productName })),
    }))

  const { data: productRows } = await supabase.from('products').select('id, title, cost_egp').order('id', { ascending: false }).limit(300)
  const products: ProductOption[] = (productRows ?? []).map((p) => ({
    id: Number(p.id), title: String(p.title ?? ''), cost: p.cost_egp === null || p.cost_egp === undefined ? null : Number(p.cost_egp),
  }))

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Records</h1>
          <p className="text-gray-400 mt-1">Costs, refunds, delivery and attribution for each sale. These feed every report.</p>
        </div>
        <Link href="/admin/analytics/sales-performance" className="text-gray-400 hover:text-white text-sm">← Sales performance</Link>
      </div>

      {ds.missingTables.length > 0 && (
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-xl px-4 py-3">
          Run <code>20261014_01_revenue_intelligence.sql</code> in Supabase first. Missing: {ds.missingTables.join(', ')}.
        </p>
      )}

      <FinanceForms sales={sales} products={products} />
    </div>
  )
}
