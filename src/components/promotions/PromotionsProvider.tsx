// src/components/promotions/PromotionsProvider.tsx

'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { liveCampaigns, normalizeItem, saleFor, type LiveCampaignInfo, type Promotion, type PromotionItem, type Sale } from '@/lib/promotions'

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
        const ids = promos.map((p) => p.id)
        const first = await supabase.from('promotion_products').select('promotion_id, product_id, percent_off, variant_ids').in('promotion_id', ids)
        // before migration 20261114 the column does not exist: read the old columns (every campaign covers every option)
        const items: unknown[] | null = first.error ? (await supabase.from('promotion_products').select('promotion_id, product_id, percent_off').in('promotion_id', ids)).data : first.data
        if (cancelled) return
        setData({
          promotions: promos.map((p) => ({ ...p, id: Number(p.id) })) as Promotion[],
          items: ((items ?? []) as unknown as Record<string, unknown>[]).map((i) => normalizeItem(i as Parameters<typeof normalizeItem>[0])),
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
/** variantId: the chosen option (null = none / no options); leave out in product lists. See saleFor. */
export function useSale(productId: number | null | undefined, regularPrice: number, variantId?: number | null): Sale | null {
  const { promotions, items, now } = useContext(Ctx)
  return useMemo(() => (productId ? saleFor(productId, regularPrice, promotions, items, now, variantId) : null), [productId, regularPrice, promotions, items, now, variantId])
}

/** Campaigns live right now (the one ending first at the top), for the announcement bar and the menu. */
export function useLiveCampaigns(): LiveCampaignInfo[] {
  const { promotions, items, now } = useContext(Ctx)
  return useMemo(() => liveCampaigns(promotions, items, now), [promotions, items, now])
}
