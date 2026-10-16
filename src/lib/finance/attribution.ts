// src/lib/finance/attribution.ts

const SOURCE_ALIASES: Record<string, string> = {
  ig: 'instagram',
  insta: 'instagram',
  'instagram ads': 'instagram',
  fb: 'facebook',
  'facebook ads': 'facebook',
  meta: 'meta',
  tt: 'tiktok',
  'tiktok ads': 'tiktok',
  'google ads': 'google',
  adwords: 'google',
  wa: 'whatsapp',
}

export function normalizeSource(value: string | null | undefined): string {
  const key = (value ?? '').trim().toLowerCase()
  return SOURCE_ALIASES[key] ?? key
}

export function normalizeCampaign(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

export const NO_CAMPAIGN = '(no campaign)'

const META_SOURCES = new Set(['facebook', 'instagram', 'meta', 'fb', 'ig', 'messenger'])
const PAID_MEDIUMS = new Set(['paid', 'cpc', 'ppc', 'paid_social', 'paidsocial', 'paid-social', 'social_paid', 'ads', 'ad'])

export function isMetaSource(source: string | null | undefined): boolean {
  return META_SOURCES.has(normalizeSource(source))
}

/** Does a visit/sale from `source`/`medium` match a user-typed source filter? 'meta' also matches paid facebook/instagram. */
export function sourceMatches(filter: string, source: string | null | undefined, medium: string | null | undefined): boolean {
  const f = normalizeSource(filter)
  return normalizeSource(source) === f || resolvePlatform(source, medium) === f
}

/** Does an ad-spend row on `platform` match the filter? Spend on 'meta' covers facebook, instagram and meta filters. */
export function spendPlatformMatches(filter: string, platform: string): boolean {
  const f = normalizeSource(filter)
  const p = normalizeSource(platform)
  return p === f || (p === 'meta' && META_SOURCES.has(f))
}

/**
 * The platform a visit/sale belongs to when matching it with ad spend. Meta runs one campaign across Facebook and
 * Instagram and reports one spend figure, so PAID visits from any Meta surface are grouped as 'meta'.
 * Organic Instagram or Facebook traffic is NOT paid, so it keeps its own source.
 */
export function resolvePlatform(source: string | null | undefined, medium: string | null | undefined): string {
  const s = normalizeSource(source)
  if (META_SOURCES.has(s) && PAID_MEDIUMS.has((medium ?? '').trim().toLowerCase())) return 'meta'
  return s
}

/** Key that joins spend rows to attributed sales: same platform and campaign, case/space/alias-insensitive. */
export function campaignKey(platform: string | null | undefined, campaign: string | null | undefined): string {
  return `${normalizeSource(platform) || '(unknown)'}|${normalizeCampaign(campaign) || NO_CAMPAIGN}`
}
