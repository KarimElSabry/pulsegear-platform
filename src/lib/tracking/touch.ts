// src/lib/tracking/touch.ts
// Pure helpers: read marketing parameters from a landing URL and keep first-touch / last-non-direct state.
// Used by the browser tracker and by server routes that read the same cookie.

export interface Touch {
  source: string | null
  medium: string | null
  campaign: string | null
  content: string | null
  clickIdType: string | null
  clickId: string | null
  referrer: string | null
  at: string
}

export interface AttributionState {
  /** First touch ever seen for this visitor (may be 'direct' with source null). */
  first: Touch | null
  /** Most recent touch that was NOT direct. */
  lastNonDirect: Touch | null
}

export const ATTR_COOKIE = 'pg_attr'
export const VISITOR_COOKIE = 'pg_vid'
export const ATTR_MAX_AGE_SECONDS = 60 * 60 * 24 * 90

const CLICK_IDS: [param: string, type: string, platform: string][] = [
  ['gclid', 'gclid', 'google'],
  ['fbclid', 'fbclid', 'facebook'],
  ['ttclid', 'ttclid', 'tiktok'],
  ['msclkid', 'msclkid', 'bing'],
]

const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'yandex.', 'ecosia.']
const clip = (v: string | null, n = 120): string | null => (v && v.trim() ? v.trim().slice(0, n) : null)

function hostOf(url: string): string | null {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return null }
}

/**
 * Describes where this visit came from, or null when it is direct (no UTM, no click id, no external referrer).
 * Explicit evidence only: nothing is guessed.
 */
export function deriveTouch(url: URL, referrer: string, ownHost: string, now = new Date()): Touch | null {
  const p = url.searchParams
  const utmSource = clip(p.get('utm_source'))
  const utmMedium = clip(p.get('utm_medium'))
  const utmCampaign = clip(p.get('utm_campaign'))
  const utmContent = clip(p.get('utm_content'))

  let clickIdType: string | null = null
  let clickId: string | null = null
  let clickPlatform: string | null = null
  for (const [param, type, platform] of CLICK_IDS) {
    const v = clip(p.get(param), 200)
    if (v) { clickIdType = type; clickId = v; clickPlatform = platform; break }
  }

  const refHost = referrer ? hostOf(referrer) : null
  const external = refHost && refHost !== ownHost.replace(/^www\./, '') ? refHost : null

  if (!utmSource && !utmMedium && !utmCampaign && !clickId && !external) return null

  let source = utmSource ?? clickPlatform
  let medium = utmMedium
  if (!source && external) {
    const isSearch = SEARCH_ENGINES.some((s) => external.includes(s))
    source = external
    medium = medium ?? (isSearch ? 'organic' : 'referral')
  }

  return {
    source: source ? source.toLowerCase() : null,
    medium: medium ? medium.toLowerCase() : clickId ? 'paid' : null,
    campaign: utmCampaign,
    content: utmContent,
    clickIdType,
    clickId,
    referrer: clip(external, 200),
    at: now.toISOString(),
  }
}

/** Direct visits never overwrite last-non-direct; first touch is recorded once. */
export function mergeAttribution(prev: AttributionState | null, touch: Touch | null, now = new Date()): AttributionState {
  const state: AttributionState = { first: prev?.first ?? null, lastNonDirect: prev?.lastNonDirect ?? null }
  if (!state.first) {
    state.first = touch ?? { source: null, medium: null, campaign: null, content: null, clickIdType: null, clickId: null, referrer: null, at: now.toISOString() }
  }
  if (touch) state.lastNonDirect = touch
  return state
}

export function parseAttributionCookie(raw: string | undefined | null): AttributionState | null {
  if (!raw) return null
  try {
    const v = JSON.parse(decodeURIComponent(raw))
    if (v && typeof v === 'object') return { first: v.first ?? null, lastNonDirect: v.lastNonDirect ?? null }
  } catch { /* malformed cookie: treat as absent */ }
  return null
}

export function serializeAttribution(state: AttributionState): string {
  return encodeURIComponent(JSON.stringify(state))
}

export function readCookie(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return undefined
}
