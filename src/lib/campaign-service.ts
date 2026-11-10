// src/lib/campaign-service.ts
// Server only: creates, changes, switches off and deletes promotional campaigns (the admin actions call these).

import type { SupabaseClient } from '@supabase/supabase-js'
import { overlaps, type CleanPromotion, type Promotion, type PromotionItem } from '@/lib/promotions'
import { PROMOTION_COLUMNS } from '@/lib/promotions-service'

type Db = SupabaseClient
const MISSING = /promotions|promotion_products|schema cache|does not exist/i

const failure = (message: string) => ({ ok: false as const, message: MISSING.test(message) ? 'Run the Supabase migration 20261110_01_campaigns.sql first, then try again.' : message })

/** Campaigns that run at the same time as this one and share products with it: the lower price wins, so you should know. */
async function overlapWarnings(db: Db, id: number, c: CleanPromotion): Promise<string[]> {
  const { data: others } = await db.from('promotions').select(PROMOTION_COLUMNS).eq('is_active', true).neq('id', id)
  const list = ((others ?? []) as Promotion[]).filter((o) => overlaps(c, o))
  if (list.length === 0) return []
  const { data: items } = await db.from('promotion_products').select('promotion_id, product_id').in('promotion_id', list.map((o) => Number(o.id)))
  const mine = new Set(c.items.map((i) => i.product_id))
  const out: string[] = []
  for (const o of list) {
    const shared = ((items ?? []) as Pick<PromotionItem, 'promotion_id' | 'product_id'>[]).filter((i) => Number(i.promotion_id) === Number(o.id) && mine.has(Number(i.product_id))).length
    if (shared > 0) out.push(`${shared} product${shared === 1 ? ' is' : 's are'} also in "${o.name}" at the same time. The lower price wins.`)
  }
  return out
}

export async function saveCampaign(db: Db, id: number | null, c: CleanPromotion): Promise<{ ok: true; id: number; warnings: string[] } | { ok: false; message: string }> {
  const fields = { name: c.name, starts_at: c.starts_at, ends_at: c.ends_at, is_active: c.is_active, allow_codes: c.allow_codes }
  let campaignId = id
  if (id !== null) {
    const { data: existing, error } = await db.from('promotions').select('id').eq('id', id).maybeSingle()
    if (error) return failure(error.message)
    if (!existing) return { ok: false, message: 'That campaign no longer exists.' }
    const { error: updateError } = await db.from('promotions').update(fields).eq('id', id)
    if (updateError) return failure(updateError.message)
  } else {
    const { data, error } = await db.from('promotions').insert(fields).select('id').single()
    if (error || !data) return failure(error?.message ?? 'Could not create the campaign.')
    campaignId = Number((data as { id: number }).id)
  }
  const promotionId = campaignId as number

  // add or update the chosen products first, then remove the ones that were taken out (a failure never leaves it empty)
  const rows = c.items.map((i) => ({ promotion_id: promotionId, product_id: i.product_id, percent_off: i.percent_off }))
  const { error: upsertError } = await db.from('promotion_products').upsert(rows, { onConflict: 'promotion_id,product_id' })
  if (upsertError) {
    if (id === null) await db.from('promotions').delete().eq('id', promotionId)
    return failure(/foreign key|violates/i.test(upsertError.message) ? 'One of the chosen products does not exist any more. Reload the page and try again.' : upsertError.message)
  }
  const { data: current } = await db.from('promotion_products').select('product_id').eq('promotion_id', promotionId)
  const keep = new Set(c.items.map((i) => i.product_id))
  const removed = ((current ?? []) as { product_id: number }[]).map((r) => Number(r.product_id)).filter((p) => !keep.has(p))
  if (removed.length) await db.from('promotion_products').delete().eq('promotion_id', promotionId).in('product_id', removed)

  return { ok: true, id: promotionId, warnings: c.is_active ? await overlapWarnings(db, promotionId, c) : [] }
}

export async function setCampaignActive(db: Db, id: number, active: boolean): Promise<{ ok: boolean; message: string }> {
  const { data, error } = await db.from('promotions').update({ is_active: active }).eq('id', id).select('id')
  if (error) return failure(error.message)
  if (!data || (data as unknown[]).length === 0) return { ok: false, message: 'That campaign no longer exists.' }
  return { ok: true, message: active ? 'Campaign switched on.' : 'Campaign switched off. Prices are back to normal.' }
}

export async function deleteCampaign(db: Db, id: number): Promise<{ ok: boolean; message: string }> {
  const { error } = await db.from('promotions').delete().eq('id', id)
  if (error) return failure(error.message)
  return { ok: true, message: 'Campaign deleted.' }
}
