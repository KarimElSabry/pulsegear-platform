// src/lib/promotions.ts
// Promotional campaigns: which products are on sale right now and at what price. Pure, so the shop (browser) and the
// checkout (server) calculate the same price from the same data.

export type Promotion = { id: number; name: string; starts_at: string | null; ends_at: string | null; is_active: boolean; allow_codes: boolean }
export type PromotionItem = { promotion_id: number; product_id: number; percent_off: number }

export type Sale = {
  promotionId: number
  name: string
  /** The percent the customer sees (rounded from the real price difference). */
  percent: number
  regular: number
  price: number
  allowCodes: boolean
}

export const MAX_PERCENT = 95

export type PromotionStatus = 'live' | 'scheduled' | 'ended' | 'off'

export function promotionStatus(p: Promotion, now: Date): PromotionStatus {
  if (!p.is_active) return 'off'
  if (p.starts_at && now < new Date(p.starts_at)) return 'scheduled'
  if (p.ends_at && now >= new Date(p.ends_at)) return 'ended'
  return 'live'
}

export const isLive = (p: Promotion, now: Date) => promotionStatus(p, now) === 'live'

/** Whole pounds, never below 1. */
export const salePrice = (regular: number, percent: number) => Math.max(1, Math.round(regular * (1 - percent / 100)))

/** The best live sale for a product (lowest price wins when campaigns overlap), or null. */
export function saleFor(productId: number, regular: number, promotions: Promotion[], items: PromotionItem[], now: Date): Sale | null {
  if (!(regular > 0)) return null
  const live = new Map(promotions.filter((p) => isLive(p, now)).map((p) => [p.id, p]))
  let best: Sale | null = null
  for (const it of items) {
    if (Number(it.product_id) !== Number(productId)) continue
    const promo = live.get(Number(it.promotion_id))
    if (!promo) continue
    const percent = Number(it.percent_off)
    if (!(percent > 0)) continue
    const price = salePrice(regular, percent)
    if (price >= regular) continue
    if (!best || price < best.price || (price === best.price && promo.id < best.promotionId)) {
      best = { promotionId: promo.id, name: promo.name, percent: Math.round((1 - price / regular) * 100), regular, price, allowCodes: promo.allow_codes }
    }
  }
  return best
}

// ── Egypt time ───────────────────────────────────────────────────────────────────────
// The admin types start and end as Egypt time ("2026-11-20T00:00"); we store real instants.

const TZ = 'Africa/Cairo'

function offsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(at)
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second'))
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60000)
}

/** "2026-11-20T18:00" typed as Egypt time -> ISO instant. Returns null for empty or invalid input. */
export function cairoLocalToIso(local: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec((local ?? '').trim())
  if (!m) return null
  const wall = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]))
  if (Number.isNaN(wall)) return null
  let guess = wall - offsetMinutes(new Date(wall)) * 60000
  guess = wall - offsetMinutes(new Date(guess)) * 60000 // second pass settles days near a clock change
  return new Date(guess).toISOString()
}

/** ISO instant -> "2026-11-20T18:00" in Egypt time (for the date fields). */
export function isoToCairoLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return ''
  const w = new Date(t.getTime() + offsetMinutes(t) * 60000).toISOString()
  return w.slice(0, 16)
}

// ── Validation of what the admin sends ────────────────────────────────────────────────

export type CleanPromotion = { name: string; starts_at: string | null; ends_at: string | null; is_active: boolean; allow_codes: boolean; items: { product_id: number; percent_off: number }[] }

export function cleanPromotion(input: { name?: unknown; starts?: unknown; ends?: unknown; is_active?: unknown; allow_codes?: unknown; items?: unknown }): { error: string } | { value: CleanPromotion } {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!name) return { error: 'Give the campaign a name (for example Early White Friday).' }
  if (name.length > 60) return { error: 'The campaign name is too long (60 characters at most).' }

  const startsRaw = typeof input.starts === 'string' ? input.starts.trim() : ''
  const endsRaw = typeof input.ends === 'string' ? input.ends.trim() : ''
  const starts_at = startsRaw ? cairoLocalToIso(startsRaw) : null
  const ends_at = endsRaw ? cairoLocalToIso(endsRaw) : null
  if (startsRaw && !starts_at) return { error: 'The start date is not valid.' }
  if (endsRaw && !ends_at) return { error: 'The end date is not valid.' }
  if (starts_at && ends_at && new Date(ends_at) <= new Date(starts_at)) return { error: 'The end must be after the start.' }

  if (!Array.isArray(input.items) || input.items.length === 0) return { error: 'Choose at least one product.' }
  if (input.items.length > 300) return { error: 'A campaign can have at most 300 products.' }
  const seen = new Set<number>()
  const items: { product_id: number; percent_off: number }[] = []
  for (const raw of input.items as { product_id?: unknown; percent_off?: unknown }[]) {
    const product_id = Number(raw?.product_id)
    const percent = Number(raw?.percent_off)
    if (!Number.isInteger(product_id) || product_id <= 0) return { error: 'One of the products is not valid.' }
    if (!Number.isFinite(percent) || percent <= 0 || percent > MAX_PERCENT) return { error: `Every discount must be between 1% and ${MAX_PERCENT}%.` }
    if (seen.has(product_id)) continue
    seen.add(product_id)
    items.push({ product_id, percent_off: Math.round(percent * 100) / 100 })
  }
  return { value: { name, starts_at, ends_at, is_active: input.is_active === false ? false : true, allow_codes: input.allow_codes === false ? false : true, items } }
}

/** Do two campaigns run at the same time? (empty start = from the beginning, empty end = never ends) */
export function overlaps(a: Pick<Promotion, 'starts_at' | 'ends_at'>, b: Pick<Promotion, 'starts_at' | 'ends_at'>): boolean {
  const aStart = a.starts_at ? new Date(a.starts_at).getTime() : -Infinity
  const aEnd = a.ends_at ? new Date(a.ends_at).getTime() : Infinity
  const bStart = b.starts_at ? new Date(b.starts_at).getTime() : -Infinity
  const bEnd = b.ends_at ? new Date(b.ends_at).getTime() : Infinity
  return aStart < bEnd && bStart < aEnd
}

// ── Showing campaigns ────────────────────────────────────────────────────────────────

/** "30.11.2026" in Egypt time (the way the end date is shown to customers). */
export function cairoDateDots(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date(iso))
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${g('day')}.${g('month')}.${g('year')}`
}

export type LiveCampaignInfo = { id: number; name: string; endsAt: string | null; maxPercent: number }

/** Campaigns that are live now and have products, the one ending first at the top (no end date last). */
export function liveCampaigns(promotions: Promotion[], items: PromotionItem[], now: Date): LiveCampaignInfo[] {
  const out: LiveCampaignInfo[] = []
  for (const p of promotions) {
    if (!isLive(p, now)) continue
    const mine = items.filter((i) => Number(i.promotion_id) === Number(p.id) && Number(i.percent_off) > 0)
    if (mine.length === 0) continue
    out.push({ id: Number(p.id), name: p.name, endsAt: p.ends_at, maxPercent: Math.round(Math.max(...mine.map((i) => Number(i.percent_off)))) })
  }
  return out.sort((a, b) => (a.endsAt ? new Date(a.endsAt).getTime() : Infinity) - (b.endsAt ? new Date(b.endsAt).getTime() : Infinity) || a.id - b.id)
}
