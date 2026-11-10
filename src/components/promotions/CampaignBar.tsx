// src/components/promotions/CampaignBar.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLiveCampaigns } from '@/components/promotions/PromotionsProvider'
import { cairoDateDots } from '@/lib/promotions'

/** A thin strip above the menu while a campaign is live: name, best discount, end date. Can be closed for the visit. */
export default function CampaignBar() {
  const pathname = usePathname()
  const campaign = useLiveCampaigns()[0]
  const [closedFor, setClosedFor] = useState<number | null>(null)

  useEffect(() => {
    try { const v = sessionStorage.getItem('pg_campaign_bar_closed'); if (v) setClosedFor(Number(v)) } catch { /* ignore */ }
  }, [])

  if (!campaign || closedFor === campaign.id || pathname?.startsWith('/admin')) return null
  const close = () => {
    setClosedFor(campaign.id)
    try { sessionStorage.setItem('pg_campaign_bar_closed', String(campaign.id)) } catch { /* ignore */ }
  }

  return (
    <div className="relative bg-red-600 px-10 py-2 text-center text-sm font-semibold text-white">
      <Link href="/deals" className="hover:underline">
        🔥 {campaign.name} · up to {campaign.maxPercent}% off{campaign.endsAt ? ` · until ${cairoDateDots(campaign.endsAt)}` : ''} <span className="ml-1 underline">Shop now →</span>
      </Link>
      <button onClick={close} aria-label="Close" className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-white/80 hover:text-white">×</button>
    </div>
  )
}
