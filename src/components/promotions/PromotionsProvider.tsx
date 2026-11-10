// src/components/promotions/PromotionsProvider.tsx

'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { liveCampaigns, saleFor, type LiveCampaignInfo, type Promotion, type PromotionItem, type Sale } from '@/lib/promotions'

type Value = { promotions: Promotion[]; items: PromotionItem[]; now: Date }
const Ctx = createContext<Value>({ promotions: [], items: [], now: new Date(0) })

/**
 * Loads the active campaigns once per visit (fresh, not frozen into the cached pages), so a sale starts and ends on time.
 * This only decides what is SHOWN: the cart and checkout price everything again on the server.
 */
export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<{ promotions: Promotion[]; items: PromotionItem[] }>({ promotions: [], items: [] })
  const [now, setNow] = useState(() => new Date(0))

  useEffect(() => {
    let cancelled = false
    const supabase = createBrowserSupabaseClient()
    ;(async () => {
      try {
        const { data: promos, error } = await supabase.from('promotions').select('id, name, starts_at, ends_at, is_active, allow_codes').eq('is_active', true)
        if (error || !promos || promos.length === 0) return
        const { data: items } = await supabase.from('promotion_products').select('promotion_id, product_id, percent_off').in('promotion_id', promos.map((p) => p.id))
        if (cancelled) return
        setData({
          promotions: promos.map((p) => ({ ...p, id: Number(p.id) })) as Promotion[],
          items: (items ?? []).map((i) => ({ promotion_id: Number(i.promotion_id), product_id: Number(i.product_id), percent_off: Number(i.percent_off) })),
        })
        setNow(new Date())
      } catch { /* campaigns are optional: without them everything is shown at the regular price */ }
    })()
    return () => { cancelled = true }
  }, [])

  const value = useMemo(() => ({ ...data, now }), [data, now])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** The live sale of a product at the given regular price, or null. */
export function useSale(productId: number | null | undefined, regularPrice: number): Sale | null {
  const { promotions, items, now } = useContext(Ctx)
  return useMemo(() => (productId ? saleFor(productId, regularPrice, promotions, items, now) : null), [productId, regularPrice, promotions, items, now])
}

/** Campaigns live right now (the one ending first at the top), for the announcement bar and the menu. */
export function useLiveCampaigns(): LiveCampaignInfo[] {
  const { promotions, items, now } = useContext(Ctx)
  return useMemo(() => liveCampaigns(promotions, items, now), [promotions, items, now])
}
