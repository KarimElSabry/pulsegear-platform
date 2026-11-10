// src/lib/promotions-service.ts
// Server only: reads campaigns. Tolerant of migration 20261110 not being run yet: without the tables nothing is on sale.

import type { SupabaseClient } from '@supabase/supabase-js'
import { liveCampaigns, saleFor, type LiveCampaignInfo, type Promotion, type PromotionItem } from '@/lib/promotions'
import type { Product } from '@/types/product'
import type { SaleEmailItem } from '@/lib/campaign-email'
import { SITE_URL } from '@/lib/site'

export const PROMOTION_COLUMNS = 'id, name, starts_at, ends_at, is_active, allow_codes'

/** Active campaigns and their products (for the given products, or all). The caller decides what is live right now. */
export async function loadPromotionData(db: SupabaseClient, productIds?: number[]): Promise<{ promotions: Promotion[]; items: PromotionItem[] }> {
  try {
    const { data: promos, error } = await db.from('promotions').select(PROMOTION_COLUMNS).eq('is_active', true)
    if (error || !promos || promos.length === 0) return { promotions: [], items: [] }
    const ids = (promos as Promotion[]).map((p) => Number(p.id))
    let q = db.from('promotion_products').select('promotion_id, product_id, percent_off').in('promotion_id', ids)
    if (productIds) q = q.in('product_id', productIds)
    const { data: items, error: itemError } = await q
    if (itemError || !items) return { promotions: [], items: [] }
    return {
      promotions: (promos as Promotion[]).map((p) => ({ ...p, id: Number(p.id) })),
      items: (items as PromotionItem[]).map((i) => ({ promotion_id: Number(i.promotion_id), product_id: Number(i.product_id), percent_off: Number(i.percent_off) })),
    }
  } catch {
    return { promotions: [], items: [] }
  }
}

// ── Products on sale right now, for emails ─────────────────────────────────────────────

/** The available products of live campaigns (optionally only one campaign), biggest discount first. */
export async function loadLiveSaleItems(db: SupabaseClient, now: Date, opts: { promotionId?: number } = {}): Promise<SaleEmailItem[]> {
  const all = await loadPromotionData(db)
  const promotions = all.promotions.filter((p) => opts.promotionId === undefined || p.id === opts.promotionId)
  const items = all.items.filter((i) => promotions.some((p) => p.id === i.promotion_id))
  if (promotions.length === 0 || items.length === 0) return []

  const productIds = [...new Set(items.map((i) => i.product_id))]
  const { data: products } = await db.from('products').select('id, slug, title, price_egp, status').in('id', productIds)
  const { data: images } = await db.from('product_images').select('product_id, image_url, is_primary, display_order').in('product_id', productIds)

  const out: SaleEmailItem[] = []
  for (const p of (products ?? []) as { id: number; slug: string | null; title: string; price_egp: number; status: string }[]) {
    if (p.status !== 'available') continue
    const regular = Number(p.price_egp) || 0
    const sale = saleFor(Number(p.id), regular, promotions, items, now)
    if (!sale) continue
    const photos = ((images ?? []) as { product_id: number; image_url: string; is_primary: boolean; display_order: number }[])
      .filter((i) => Number(i.product_id) === Number(p.id))
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)
    out.push({ campaignName: sale.name, title: p.title, imageUrl: photos[0]?.image_url ?? null, url: `${SITE_URL}/products/${p.slug ?? p.id}`, regular, price: sale.price, percent: sale.percent })
  }
  return out.sort((a, b) => b.percent - a.percent).slice(0, 100)
}

// ── Live campaigns with their products, for the homepage and the Deals page ────────────────

export type LiveCampaign = LiveCampaignInfo & { products: Product[] }

/** Live campaigns (ending first at the top) with their available products, biggest discount first. Campaigns with nothing to buy are left out. */
export async function loadLiveCampaigns(db: SupabaseClient, now: Date, opts: { perCampaign?: number } = {}): Promise<LiveCampaign[]> {
  const { promotions, items } = await loadPromotionData(db)
  const live = liveCampaigns(promotions, items, now)
  if (live.length === 0) return []
  const ids = [...new Set(items.filter((i) => live.some((c) => c.id === i.promotion_id)).map((i) => i.product_id))]
  const { data } = await db.from('products').select('*, images:product_images(*)').in('id', ids).eq('status', 'available')
  const byId = new Map(((data ?? []) as Product[]).map((p) => [Number(p.id), p]))
  const out: LiveCampaign[] = []
  for (const c of live) {
    const mine = items.filter((i) => i.promotion_id === c.id).sort((a, b) => b.percent_off - a.percent_off)
    const products = mine.map((i) => byId.get(i.product_id)).filter((p): p is Product => !!p).slice(0, opts.perCampaign ?? 60)
    if (products.length > 0) out.push({ ...c, products })
  }
  return out
}
