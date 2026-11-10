import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { buildCampaignEmail, esc, saleSectionHtml, type SaleEmailItem } from '../campaign-email'
import { buildEmailTemplate, sendBrevoCampaign, sendWeeklyNewsletter } from '../brevo'
import { emailCampaign, type EmailDeps } from '../campaign-email-service'
import { loadLiveSaleItems } from '../promotions-service'

vi.mock('../supabase', () => ({ createAdminSupabaseClient: vi.fn(), createBrowserSupabaseClient: vi.fn() }))

const item = (over: Partial<SaleEmailItem> = {}): SaleEmailItem => ({ campaignName: 'Early White Friday', title: 'Polar Ignite 3', imageUrl: 'https://img/x.jpg', url: 'https://shop/products/p1', regular: 1000, price: 800, percent: 20, ...over })

describe('email pieces', () => {
  it('escapes text that comes from products and names', () => {
    expect(esc(`<script>"x" & 'y'</script>`)).toBe('&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;')
    const html = saleSectionHtml([item({ title: '<b>Evil</b>', campaignName: 'A & B' })])
    expect(html).not.toContain('<b>Evil</b>')
    expect(html).toContain('&lt;b&gt;Evil&lt;/b&gt;')
    expect(html).toContain('A &amp; B')
  })
  it('shows sale price, crossed-out regular price and percent', () => {
    const html = saleSectionHtml([item()])
    expect(html).toContain('800 EGP')
    expect(html).toContain('line-through')
    expect(html).toContain('1,000 EGP')
    expect(html).toContain('-20%')
  })
  it('an empty list gives no section', () => { expect(saleSectionHtml([])).toBe('') })
  it('the campaign email says the best percent, the end date in Egypt time, and the code note', () => {
    const e = buildCampaignEmail({ name: 'Early White Friday', endsAt: '2026-11-30T22:30:00.000Z', allowCodes: true }, [item(), item({ percent: 41 })], 'https://shop')
    expect(e.subject).toBe('Early White Friday: up to 41% off at Pulse Gear Egypt')
    expect(e.html).toContain('Ends 1 December 2026') // 22:30 UTC is already 1 December in Egypt (UTC+2)
    expect(e.html).toContain('discount code still works')
    expect(e.html).toContain('https://shop/unsubscribe?email={{ contact.EMAIL }}')
    const open = buildCampaignEmail({ name: 'X', endsAt: null, allowCodes: false }, [item()], 'https://shop')
    expect(open.html).toContain('For a limited time')
    expect(open.html).not.toContain('discount code still works')
  })
  it('the weekly newsletter has the sale block only when something is on sale', () => {
    expect(buildEmailTemplate([], [], [item()])).toContain('On Sale Now')
    expect(buildEmailTemplate([], [])).not.toContain('On Sale Now')
  })
})

describe('Brevo sending (fetch mocked)', () => {
  const calls: { url: string; body: unknown }[] = []
  beforeEach(() => {
    calls.length = 0
    vi.stubEnv('BREVO_API_KEY', 'k'); vi.stubEnv('BREVO_NEWSLETTER_LIST_ID', '7'); vi.stubEnv('BREVO_SENDER_EMAIL', 'shop@example.com')
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: { body?: string }) => {
      calls.push({ url, body: init?.body ? JSON.parse(init.body) : null })
      return { ok: true, json: async () => ({ id: 55 }) }
    }))
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it('creates a campaign for the list and sends it', async () => {
    await sendBrevoCampaign({ name: 'n', subject: 's', html: '<p>x</p>' })
    expect(calls.map((c) => c.url)).toEqual(['https://api.brevo.com/v3/emailCampaigns', 'https://api.brevo.com/v3/emailCampaigns/55/sendNow'])
    expect(calls[0].body).toMatchObject({ subject: 's', recipients: { listIds: [7] }, htmlContent: '<p>x</p>' })
  })
  it('the weekly newsletter keeps its subject, or leads with the campaign when nothing is new', async () => {
    await sendWeeklyNewsletter([{ id: 1, title: 't', price_egp: 1, slug: 'a' } as never], [], [item()])
    expect(calls[0].body).toMatchObject({ subject: 'Pulse Gear Weekly — 1 New Items This Week' })
    calls.length = 0
    await sendWeeklyNewsletter([], [], [item()])
    expect(calls[0].body).toMatchObject({ subject: 'Pulse Gear Weekly — Early White Friday' })
  })
  it('reports a failure from Brevo', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({ message: 'bad key' }) })))
    await expect(sendBrevoCampaign({ name: 'n', subject: 's', html: 'h' })).rejects.toThrow('bad key')
  })
})

describe('emailing a campaign', () => {
  let db: FakeDb
  const client = () => db as unknown as SupabaseClient
  const NOW = new Date('2026-11-25T10:00:00.000Z')
  let sent: string[]
  let failNext: boolean
  const deps: EmailDeps = {
    sendAll: async (i) => { if (failNext) { failNext = false; throw new Error('Brevo down') } sent.push(i.subject) },
    sendTest: async () => 'shop@example.com',
  }
  beforeEach(() => {
    sent = []; failNext = false
    db = new FakeDb()
    db.seed('products', [
      { id: 1, slug: 'p1', title: 'Watch', price_egp: 1000, status: 'available' },
      { id: 2, slug: 'p2', title: 'Strap', price_egp: 500, status: 'available' },
      { id: 3, slug: 'p3', title: 'Sold one', price_egp: 500, status: 'sold' },
    ])
    db.seed('product_images', [{ product_id: 1, image_url: 'w.jpg', is_primary: true, display_order: 0 }])
    db.seed('promotions', [
      { id: 1, name: 'Early White Friday', starts_at: '2026-11-20T00:00:00Z', ends_at: '2026-11-30T00:00:00Z', is_active: true, allow_codes: true, emailed_at: null },
      { id: 2, name: 'Other', starts_at: null, ends_at: null, is_active: true, allow_codes: true, emailed_at: null },
    ])
    db.seed('promotion_products', [{ promotion_id: 1, product_id: 1, percent_off: 20 }, { promotion_id: 1, product_id: 2, percent_off: 40 }, { promotion_id: 1, product_id: 3, percent_off: 50 }, { promotion_id: 2, product_id: 2, percent_off: 10 }])
  })

  it('lists live sale products, available only, biggest discount first', async () => {
    const items = await loadLiveSaleItems(client(), NOW)
    expect(items.map((i) => [i.title, i.percent])).toEqual([['Strap', 40], ['Watch', 20]]) // Strap: the 40% campaign beats the 10% one; the sold product is left out
    expect(items.find((i) => i.title === 'Watch')?.imageUrl).toBe('w.jpg')
    expect((await loadLiveSaleItems(client(), NOW, { promotionId: 2 })).map((i) => [i.title, i.percent])).toEqual([['Strap', 10]])
    expect(await loadLiveSaleItems(client(), new Date('2026-12-05T00:00:00Z'), { promotionId: 1 })).toEqual([])
  })
  it('a test goes only to you and marks nothing as sent', async () => {
    expect(await emailCampaign(client(), 1, 'test', deps, NOW)).toMatchObject({ ok: true })
    expect(sent).toEqual([])
    expect(db.rows('promotions')[0].emailed_at).toBeNull()
  })
  it('sends once, records it, and refuses a second plain send', async () => {
    expect(await emailCampaign(client(), 1, 'all', deps, NOW)).toMatchObject({ ok: true })
    expect(sent).toEqual(['Early White Friday: up to 40% off at Pulse Gear Egypt'])
    expect(db.rows('promotions')[0].emailed_at).toBe(NOW.toISOString())
    expect(await emailCampaign(client(), 1, 'all', deps, NOW)).toMatchObject({ ok: false })
    expect(sent).toHaveLength(1)
  })
  it('two clicks at the same moment send once', async () => {
    const [a, b] = await Promise.all([emailCampaign(client(), 1, 'all', deps, NOW), emailCampaign(client(), 1, 'all', deps, NOW)])
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1)
    expect(sent).toHaveLength(1)
  })
  it('"again" sends a second time, but only after a first send', async () => {
    expect(await emailCampaign(client(), 1, 'again', deps, NOW)).toMatchObject({ ok: false })
    await emailCampaign(client(), 1, 'all', deps, NOW)
    expect(await emailCampaign(client(), 1, 'again', deps, new Date('2026-11-26T10:00:00Z'))).toMatchObject({ ok: true })
    expect(sent).toHaveLength(2)
  })
  it('a failed send is not recorded, so you can try again', async () => {
    failNext = true
    const r = await emailCampaign(client(), 1, 'all', deps, NOW)
    expect(r.ok).toBe(false)
    expect(r.message).toContain('Nothing went out')
    expect(db.rows('promotions')[0].emailed_at).toBeNull()
    expect(await emailCampaign(client(), 1, 'all', deps, NOW)).toMatchObject({ ok: true })
  })
  it('only a live campaign can be emailed, and not one with no available products', async () => {
    expect((await emailCampaign(client(), 1, 'all', deps, new Date('2026-12-05T00:00:00Z'))).message).toContain('live right now') // ended
    expect((await emailCampaign(client(), 1, 'all', deps, new Date('2026-11-10T00:00:00Z'))).message).toContain('live right now') // not started
    db.rows('products').forEach((p) => { p.status = 'sold' })
    expect(await emailCampaign(client(), 1, 'all', deps, NOW)).toMatchObject({ ok: false })
    expect(sent).toEqual([])
  })
})
