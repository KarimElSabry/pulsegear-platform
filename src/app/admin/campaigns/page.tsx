// src/app/admin/campaigns/page.tsx
// Promotional campaigns: a name, start and end time (Egypt time), and the products with a percent off.

import Link from 'next/link'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isoToCairoLocal, promotionStatus, type Promotion, type PromotionItem } from '@/lib/promotions'
import { PROMOTION_COLUMNS } from '@/lib/promotions-service'
import { CampaignForm, DeleteForm, EmailForm, SwitchForm, type CampaignInitial, type ProductLite } from './CampaignForms'

export const dynamic = 'force-dynamic'

const CHIP = {
  live: 'bg-green-900/40 text-green-200',
  scheduled: 'bg-blue-900/40 text-blue-200',
  ended: 'bg-zinc-800 text-zinc-400',
  off: 'bg-zinc-800 text-zinc-400',
} as const
const LABEL = { live: 'Live now', scheduled: 'Scheduled', ended: 'Ended', off: 'Switched off' } as const
const card = 'rounded-2xl border border-zinc-800 bg-zinc-900 p-5'

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  await assertAdmin()
  const sp = await searchParams
  const db = createAdminSupabaseClient()
  const now = new Date()

  const { data: promoRows, error } = await db.from('promotions').select(PROMOTION_COLUMNS).order('created_at', { ascending: false })
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Campaigns</h1>
        <p className="mt-4 rounded-xl border border-amber-800 bg-amber-900/20 p-4 text-amber-200">
          The campaign tables are not set up yet. Run <b>supabase/migrations/20261110_01_campaigns.sql</b> in the Supabase SQL editor, then reload this page.
        </p>
      </div>
    )
  }
  const promos = ((promoRows ?? []) as Promotion[]).map((p) => ({ ...p, id: Number(p.id) }))
  const { data: itemRows } = promos.length ? await db.from('promotion_products').select('promotion_id, product_id, percent_off').in('promotion_id', promos.map((p) => p.id)) : { data: [] }
  const items = ((itemRows ?? []) as PromotionItem[]).map((i) => ({ promotion_id: Number(i.promotion_id), product_id: Number(i.product_id), percent_off: Number(i.percent_off) }))

  const { data: productRows } = await db.from('products').select('id, title, brand, category, price_egp, status').order('created_at', { ascending: false })
  const products: ProductLite[] = ((productRows ?? []) as { id: number; title: string; brand: string | null; category: string | null; price_egp: number; status: string }[])
    .map((p) => ({ id: Number(p.id), title: p.title, brand: p.brand, category: p.category, price: Number(p.price_egp) || 0, status: p.status }))
    .sort((a, b) => (a.status === 'available' ? 0 : 1) - (b.status === 'available' ? 0 : 1))

  // when each campaign was emailed (needs migration 20261111; without it the column is simply unknown)
  const emailedAt = new Map<number, string | null>()
  const { data: emailRows, error: emailError } = await db.from('promotions').select('id, emailed_at')
  if (!emailError) for (const r of (emailRows ?? []) as { id: number; emailed_at: string | null }[]) emailedAt.set(Number(r.id), r.emailed_at)

  const editing = sp.edit ? promos.find((p) => p.id === Number(sp.edit)) : undefined
  const initial: CampaignInitial | null = editing
    ? { id: editing.id, name: editing.name, starts: isoToCairoLocal(editing.starts_at), ends: isoToCairoLocal(editing.ends_at), isActive: editing.is_active, allowCodes: editing.allow_codes, items: items.filter((i) => i.promotion_id === editing.id).map((i) => ({ product_id: i.product_id, percent_off: i.percent_off })) }
    : sp.new
      ? { id: null, name: '', starts: '', ends: '', isActive: true, allowCodes: true, items: [] }
      : null

  const when = (iso: string | null) => (iso ? isoToCairoLocal(iso).replace('T', ' ') : null)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">🔥 Campaigns</h1>
          <p className="mt-1 text-sm text-zinc-400">Sales for a limited time, such as Early White Friday. While a campaign is live, customers see the sale price with the regular price crossed out. Times are Egypt time.</p>
        </div>
        <Link href="/admin/campaigns?new=1" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500">+ New campaign</Link>
      </div>

      {initial && <CampaignForm key={initial.id ?? 'new'} products={products} initial={initial} />}

      <section className={card}>
        <h2 className="mb-3 text-lg font-bold text-white">Your campaigns ({promos.length})</h2>
        {promos.length === 0 && <p className="text-sm text-zinc-500">No campaigns yet. Press &quot;New campaign&quot;.</p>}
        <ul className="space-y-3">
          {promos.map((p) => {
            const st = promotionStatus(p, now)
            const count = items.filter((i) => i.promotion_id === p.id).length
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 p-3">
                <div className="space-y-1">
                  <p className="font-bold text-white">{p.name} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${CHIP[st]}`}>{LABEL[st]}</span></p>
                  <p className="text-xs text-zinc-400">
                    {count} product{count === 1 ? '' : 's'} · {when(p.starts_at) ? `from ${when(p.starts_at)}` : 'starts now'} · {when(p.ends_at) ? `until ${when(p.ends_at)}` : 'no end date'} · codes {p.allow_codes ? 'work' : 'do not work'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/campaigns?edit=${p.id}`} className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500">Edit</Link>
                  <SwitchForm id={p.id} active={p.is_active} />
                  <EmailForm id={p.id} live={st === 'live'} emailedAt={emailedAt.get(p.id) ?? null} />
                  <DeleteForm id={p.id} />
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
