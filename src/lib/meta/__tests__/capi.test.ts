import { createHash } from 'crypto'
import { describe, expect, it, vi } from 'vitest'
import { buildCapiEvent, hashEmail, hashPhone, readCapiConfig, sendCapiEvents } from '../capi'

const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const cfg = { pixelId: '123456789012', token: 't'.repeat(30), version: 'v25.0', testEventCode: null }

describe('hashing', () => {
  it('normalises Egyptian phones and emails before hashing', () => {
    expect(hashPhone('0120 532 2444')).toBe(sha('201205322444'))
    expect(hashPhone('+20 120 532 2444')).toBe(sha('201205322444'))
    expect(hashPhone('123')).toBeUndefined()
    expect(hashEmail('  Ali@Example.COM ')).toBe(sha('ali@example.com'))
    expect(hashEmail('nope')).toBeUndefined()
  })
})

describe('readCapiConfig', () => {
  it('needs a numeric pixel id and a token', () => {
    expect(readCapiConfig({})).toBeNull()
    expect(readCapiConfig({ NEXT_PUBLIC_META_PIXEL_ID: '123456789012', META_CAPI_TOKEN: 'x'.repeat(30) })?.pixelId).toBe('123456789012')
  })
})

describe('buildCapiEvent', () => {
  it('maps Lead with hashed contact data and never includes raw phone/email', () => {
    const e = buildCapiEvent({ event: 'reservation_created', eventId: 'r1', phone: '01205322444', email: 'a@b.co', cookieHeader: '_fbp=fb.1.1.2; pg_vid=abc', ip: '1.2.3.4', userAgent: 'UA', productId: 7 })!
    expect(e.event_name).toBe('Lead')
    expect(e.event_id).toBe('r1')
    expect((e.user_data as Record<string, unknown>).fbp).toBe('fb.1.1.2')
    expect(JSON.stringify(e)).not.toContain('01205322444')
    expect(JSON.stringify(e)).not.toContain('a@b.co')
    expect((e.custom_data as Record<string, unknown>).content_ids).toEqual(['7'])
  })
  it('builds fbc from a stored fbclid and ignores events Meta should not get', () => {
    const attr = encodeURIComponent(JSON.stringify({ first: null, lastNonDirect: { source: 'facebook', medium: 'paid', campaign: null, content: null, clickIdType: 'fbclid', clickId: 'XYZ', referrer: null, at: '2026-10-01T00:00:00.000Z' } }))
    const e = buildCapiEvent({ event: 'page_view', eventId: 'p', cookieHeader: `pg_attr=${attr}` })!
    expect((e.user_data as Record<string, unknown>).fbc).toMatch(/^fb\.1\.\d+\.XYZ$/)
    expect(buildCapiEvent({ event: 'sale_completed', eventId: 'x' })).toBeNull()
    expect(buildCapiEvent({ event: 'refund_issued', eventId: 'x' })).toBeNull()
  })
})

describe('sendCapiEvents', () => {
  it('posts with a bearer header, token not in URL; never throws', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    expect(await sendCapiEvents([{ a: 1 }], cfg, f)).toBe(true)
    expect(f.mock.calls[0][0]).not.toContain(cfg.token)
    expect(f.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${cfg.token}`)
    expect(await sendCapiEvents([{ a: 1 }], cfg, async () => { throw new Error('down') })).toBe(false)
    expect(await sendCapiEvents([{ a: 1 }], null)).toBe(false)
  })
})
