// src/app/admin/analytics/sales-performance/TrendChart.tsx

'use client'

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrendPoint } from '@/lib/finance/engine'

const TOOLTIP_STYLE = { background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fff' }

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} tickFormatter={(d: string) => d.slice(5)} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => Number(v).toLocaleString('en-US')} />
        <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
        <Line type="monotone" dataKey="netSalesRevenue" name="Net sales revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="contributionBeforeAds" name="Contribution before ads" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="contributionAfterAds" name="Contribution after ads" stroke="#a855f7" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="adSpend" name="Ad spend" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
