import { describe, expect, it, vi } from 'vitest'
import { deriveTouch, mergeAttribution, parseAttributionCookie, readCookie, serializeAttribution } from '../touch'

const OWN = 'pulsegear.vercel.app'
const NOW = new Date('2026-10-05T10:00:00Z')

describe('deriveTouch', () => {
  it('reads UTM parameters', () => {
    const t = deriveTouch(new URL('https://pulsegear.vercel.app/products?utm_source=Instagram&utm_medium=paid&utm_campaign=Fenix_Launch&utm_content=reel1'), '', OWN, NOW)
    expect(t).toMatchObject({ source: 'instagram', medium: 'paid', campaign: 'Fenix_Launch', content: 'reel1', clickId: null })
  })

  it('recognises ad click ids without inventing a campaign', () => {
    const t = deriveTouch(new URL('https://pulsegear.vercel.app/?fbclid=abc123'), '', OWN, NOW)
    expect(t).toMatchObject({ source: 'facebook', medium: 'paid', campaign: null, clickIdType: 'fbclid', clickId: 'abc123' })
    expect(deriveTouch(new URL('https://pulsegear.vercel.app/?gclid=g1'), '', OWN, NOW)?.source).toBe('google')
  })

  it('treats an external referrer as a source and search engines as organic', () => {
    expect(deriveTouch(new URL('https://pulsegear.vercel.app/'), 'https://www.google.com/search?q=x', OWN, NOW)).toMatchObject({ source: 'google.com', medium: 'organic' })
    expect(deriveTouch(new URL('https://pulsegear.vercel.app/'), 'https://l.instagram.com/?u=1', OWN, NOW)).toMatchObject({ source: 'l.instagram.com', medium: 'referral' })
  })

  it('returns null for direct visits and for navigation from our own site', () => {
    expect(deriveTouch(new URL('https://pulsegear.vercel.app/products'), '', OWN, NOW)).toBeNull()
    expect(deriveTouch(new URL('https://pulsegear.vercel.app/products'), 'https://pulsegear.vercel.app/', OWN, NOW)).toBeNull()
  })

  it('caps parameter lengths', () => {
    const long = 'x'.repeat(500)
    const t = deriveTouch(new URL(`https://pulsegear.vercel.app/?utm_source=a&utm_campaign=${long}`), '', OWN, NOW)
    expect(t?.campaign?.length).toBe(120)
  })
})

describe('mergeAttribution', () => {
  const ig = deriveTouch(new URL('https://pulsegear.vercel.app/?utm_source=instagram&utm_campaign=A'), '', OWN, NOW)
  const fb = deriveTouch(new URL('https://pulsegear.vercel.app/?utm_source=facebook&utm_campaign=B'), '', OWN, NOW)

  it('records first touch once and keeps updating last non-direct', () => {
    let s = mergeAttribution(null, ig, NOW)
    expect(s.first?.source).toBe('instagram')
    s = mergeAttribution(s, fb, NOW)
    expect(s.first?.source).toBe('instagram')
    expect(s.lastNonDirect?.source).toBe('facebook')
  })

  it('a direct visit never overwrites last non-direct', () => {
    let s = mergeAttribution(null, ig, NOW)
    s = mergeAttribution(s, null, NOW)
    expect(s.lastNonDirect?.source).toBe('instagram')
  })

  it('a first visit that is direct stays "direct" (source null) until real evidence arrives', () => {
    const s = mergeAttribution(null, null, NOW)
    expect(s.first?.source).toBeNull()
    expect(s.lastNonDirect).toBeNull()
  })

  it('survives a cookie round trip and ignores a corrupted cookie', () => {
    const s = mergeAttribution(null, ig, NOW)
    const cookie = `a=1; pg_attr=${serializeAttribution(s)}; b=2`
    expect(parseAttributionCookie(readCookie(cookie, 'pg_attr'))).toEqual(s)
    expect(parseAttributionCookie('%7Bnot-json')).toBeNull()
    expect(parseAttributionCookie(undefined)).toBeNull()
  })
})

describe('server touchpoint rows', () => {
  it('copies visitor id and attribution from the request cookies', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon')
    const { touchpointRow } = await import('../server')
    const ig = deriveTouch(new URL('https://pulsegear.vercel.app/?utm_source=instagram&utm_medium=paid&utm_campaign=A'), '', OWN, NOW)
    const state = mergeAttribution(null, ig, NOW)
    const req = new Request('https://pulsegear.vercel.app/api/x', { headers: { cookie: `pg_vid=v-9; pg_attr=${serializeAttribution(state)}` } })
    const row = touchpointRow({ event: 'reservation_created', request: req, refType: 'reservation', refId: 7 })
    expect(row).toMatchObject({ visitor_id: 'v-9', utm_source: 'instagram', utm_campaign: 'A', ref_type: 'reservation', ref_id: '7', first_touch_source: 'instagram' })
  })

  it('leaves attribution empty when there is no cookie (unknown stays unknown)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon')
    const { touchpointRow } = await import('../server')
    const row = touchpointRow({ event: 'sale_completed', saleId: 'abc' })
    expect(row.utm_source).toBeNull()
    expect(row.first_touch_source).toBeNull()
    expect(row.sale_id).toBe('abc')
  })
})
