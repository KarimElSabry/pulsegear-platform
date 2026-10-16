// src/lib/finance/campaigns.ts
// Campaign-level performance. Each sale has at most one attribution row, so a sale lands in at most one
// campaign: campaign revenue can never add up to more than total revenue. ROAS here is a revenue ratio, not profit.

import { campaignKey, NO_CAMPAIGN, resolvePlatform } from './attribution'
import { ratio, round2 } from './money'
import type { SaleResult } from './sale'
import type { Attribution, SpendRecord, Touchpoint } from './types'

export interface CampaignRow {
  key: string
  platform: string
  campaign: string
  spend: number
  leads: number
  qualifiedLeads: number
  contactClicks: number
  attributedOrders: number
  attributedRevenue: number
  costPerLead: number | null
  costPerQualifiedLead: number | null
  costPerCompletedOrder: number | null
  roas: number | null
  /** Contribution before ads of the attributed orders, minus the campaign's spend. */
  contributionBeforeAds: number
  contributionAfterAds: number
  flags: ('spend_without_orders' | 'orders_without_spend')[]
}

export interface CampaignSummary {
  rows: CampaignRow[]
  totalSpend: number
  /** Spend on campaigns that have attributed orders. */
  matchedSpend: number
  /** Spend on campaigns with no attributed order (kept visible, never silently assigned). */
  unmatchedSpend: number
  completedOrders: number
  attributedOrders: number
  unknownOrders: number
  attributionCoverage: number | null
  attributedRevenue: number
  unattributedRevenue: number
  roas: number | null
}

const LEAD_EVENTS = new Set(['product_request_submitted', 'reservation_created'])
const CLICK_EVENTS = new Set(['contact_click', 'whatsapp_click'])

export function campaignPerformance(
  results: SaleResult[],
  attributions: Attribution[],
  spend: SpendRecord[],
  touchpoints: Touchpoint[]
): CampaignSummary {
  const byKey = new Map<string, CampaignRow>()
  const visitorsByKey = new Map<string, Set<string>>()
  const qualifiedVisitors = new Map<string, Set<string>>()

  const row = (platform: string, campaign: string): CampaignRow => {
    const key = campaignKey(platform, campaign)
    let r = byKey.get(key)
    if (!r) {
      r = {
        key,
        platform: resolvePlatform(platform, null) || '(unknown)',
        campaign: campaign.trim() || NO_CAMPAIGN,
        spend: 0, leads: 0, qualifiedLeads: 0, contactClicks: 0,
        attributedOrders: 0, attributedRevenue: 0,
        costPerLead: null, costPerQualifiedLead: null, costPerCompletedOrder: null, roas: null,
        contributionBeforeAds: 0, contributionAfterAds: 0, flags: [],
      }
      byKey.set(key, r)
    }
    return r
  }

  for (const s of spend) {
    // spend is paid by definition, so Meta surfaces (facebook, instagram) all fold into 'meta' like paid visits do
    const r = row(resolvePlatform(s.platform, 'paid'), s.campaign)
    r.spend = round2(r.spend + s.amountEgp)
  }

  const attrBySale = new Map(attributions.map((a) => [a.saleId, a]))
  const recognized = results.filter((r) => r.recognized)
  let attributedOrders = 0
  let attributedRevenue = 0

  for (const res of recognized) {
    const a = attrBySale.get(res.sale.id)
    if (!a || a.status !== 'attributed') continue
    const platform = resolvePlatform(a.utmSource ?? a.lastNonDirectSource ?? a.firstTouchSource ?? a.closingChannel ?? '(unknown)', a.utmMedium)
    const r = row(platform, a.utmCampaign ?? '')
    r.attributedOrders += 1
    r.attributedRevenue = round2(r.attributedRevenue + res.netRevenue)
    r.contributionBeforeAds = round2(r.contributionBeforeAds + res.contributionBeforeAds)
    attributedOrders += 1
    attributedRevenue = round2(attributedRevenue + res.netRevenue)
  }

  for (const t of touchpoints) {
    const platform = resolvePlatform(t.utmSource, t.utmMedium)
    if (!platform && !t.utmCampaign) continue
    const key = campaignKey(platform, t.utmCampaign)
    if (!byKey.has(key)) continue // only report on campaigns that have spend or attributed orders
    const r = byKey.get(key)!
    if (LEAD_EVENTS.has(t.event)) {
      const id = t.visitorId ?? `anon:${t.id}`
      const set = visitorsByKey.get(key) ?? new Set<string>()
      set.add(id)
      visitorsByKey.set(key, set)
    } else if (t.event === 'lead_qualified') {
      const id = t.visitorId ?? `anon:${t.id}`
      const set = qualifiedVisitors.get(key) ?? new Set<string>()
      set.add(id)
      qualifiedVisitors.set(key, set)
    } else if (CLICK_EVENTS.has(t.event)) {
      r.contactClicks += 1 // a click is interest, never counted as a lead
    }
  }

  let totalSpend = 0
  let matchedSpend = 0
  let unmatchedSpend = 0

  for (const r of byKey.values()) {
    r.leads = visitorsByKey.get(r.key)?.size ?? 0
    r.qualifiedLeads = qualifiedVisitors.get(r.key)?.size ?? 0
    r.costPerLead = r.leads > 0 ? round2(r.spend / r.leads) : null
    r.costPerQualifiedLead = r.qualifiedLeads > 0 ? round2(r.spend / r.qualifiedLeads) : null
    r.costPerCompletedOrder = r.attributedOrders > 0 ? round2(r.spend / r.attributedOrders) : null
    const roas = ratio(r.attributedRevenue, r.spend)
    r.roas = roas === null ? null : round2(roas)
    r.contributionAfterAds = round2(r.contributionBeforeAds - r.spend)
    if (r.spend > 0 && r.attributedOrders === 0) r.flags.push('spend_without_orders')
    if (r.attributedOrders > 0 && r.spend === 0) r.flags.push('orders_without_spend')

    totalSpend = round2(totalSpend + r.spend)
    if (r.attributedOrders > 0) matchedSpend = round2(matchedSpend + r.spend)
    else unmatchedSpend = round2(unmatchedSpend + r.spend)
  }

  const completedOrders = recognized.length
  const totalRevenue = round2(recognized.reduce((a, r) => a + r.netRevenue, 0))
  const roas = ratio(attributedRevenue, totalSpend)

  return {
    rows: [...byKey.values()].sort((a, b) => b.spend - a.spend || b.attributedRevenue - a.attributedRevenue),
    totalSpend,
    matchedSpend,
    unmatchedSpend,
    completedOrders,
    attributedOrders,
    unknownOrders: completedOrders - attributedOrders,
    attributionCoverage: ratio(attributedOrders, completedOrders),
    attributedRevenue,
    unattributedRevenue: round2(totalRevenue - attributedRevenue),
    roas: roas === null ? null : round2(roas),
  }
}
