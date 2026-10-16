// src/app/admin/analytics/ad-spend/page.tsx

import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { formatEGP } from '@/lib/format'
import { readMetaConfig } from '@/lib/meta/insights'
import SpendForms from './SpendForms'

export const dynamic = 'force-dynamic'

export default async function AdSpendPage() {
  const { data, error } = await createAdminSupabaseClient()
    .from('marketing_spend')
    .select('id, platform, campaign, spend_date, currency, amount, amount_egp, source')
    .order('spend_date', { ascending: false })
    .limit(100)

  const missing = error && (error.code === 'PGRST205' || error.code === '42P01')
  const rows = data ?? []
  const metaOn = readMetaConfig() !== null
  const total = rows.reduce((a, r) => a + Number(r.amount_egp), 0)

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advertising Spend</h1>
          <p className="text-gray-400 mt-1">Enter spend here so campaigns can be compared with the sales they produced.</p>
        </div>
        <Link href="/admin/analytics/sales-performance" className="text-gray-400 hover:text-white text-sm">← Sales performance</Link>
      </div>

      {missing && (
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-xl px-4 py-3">
          Run <code>20261014_01_revenue_intelligence.sql</code> in Supabase first.
        </p>
      )}
      {error && !missing && <p className="text-red-400 text-sm">Could not load spend: {error.message}</p>}

      <p className={`text-sm rounded-xl px-4 py-3 border ${metaOn ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
        {metaOn ? 'Meta Ads is connected: spend syncs automatically every day.' : 'Meta Ads is not connected. Set META_AD_ACCOUNT_ID and META_ACCESS_TOKEN in Vercel to sync spend automatically.'}
      </p>

      <SpendForms />

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-3">Latest 100 rows <span className="text-gray-500 text-sm font-normal">· {formatEGP(total)}</span></h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 border-b border-gray-800 text-left"><th className="py-2">Date</th><th>Platform</th><th>Campaign</th><th className="text-right">Amount</th><th className="text-right">EGP</th><th>Source</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 text-gray-300">
                  <td className="py-2">{r.spend_date}</td><td>{r.platform}</td><td>{r.campaign}</td>
                  <td className="text-right">{Number(r.amount).toLocaleString('en-US')} {r.currency}</td>
                  <td className="text-right">{Number(r.amount_egp).toLocaleString('en-US')}</td><td>{r.source}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="py-4 text-gray-500">No spend recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
