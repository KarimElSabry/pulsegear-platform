import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FakeDb } from './fakeDb'
import { buildCampaignEmail, esc, saleSectionHtml, type SaleEmailItem } from '../campaign-email'
import { brevoRefusesHtml, buildEmailTemplate, sendBrevoCampaign, sendWeeklyNewsletter } from '../brevo'
import { emailCampaign, type EmailDeps } from '../campaign-email-service'
import { loadLiveSaleItems } from '../promotions-service'

vi.mock('../supabase', () => ({ createAdminSupabaseClient: vi.fn(), createBrowserSupabaseClient: vi.fn() }))

const item = (over: Partial<SaleEmailItem> = {}): SaleEmailItem => ({ campaignName: 'Early White Friday', title: 'Polar Ignite 3', imageUrl: 'https://img/x.jpg', url: 'https://shop/products/p1', regular: 1000, price: 800, percent: 20, ...over })

import { diagnoseEmail, emailImageSrc, looksLikeCode, mailText, mailUrl } from '../campaign-email'

describe('text that Brevo could take for code', () => {
  it('takes out angle brackets, template braces, javascript: and onclick= patterns', () => {
    expect(mailText('Wahoo <b>ELEMNT</b> {{ x }} {% y %}')).toBe('Wahoo b ELEMNT /b x y')
    expect(mailText('javascript:alert(1)')).toBe('javascript -alert(1)')
    expect(mailText('Oura onclick=run() Ring')).toBe('Oura onclick -run() Ring')
    expect(mailText('onerror = bad')).toBe('onerror - bad')
  })
  it('keeps normal titles, ampersands and apostrophes (escaped)', () => {
    expect(mailText("Wahoo & Oura  Bundle  (Size 10)")).toBe('Wahoo &amp; Oura Bundle (Size 10)')
    expect(mailText("Oura's ring")).toBe('Oura&#39;s ring')
    expect(mailText(null)).toBe('')
    expect(mailText('Pace 3 on sale = great')).toBe('Pace 3 on sale = great') // "on" alone is not an event handler
  })
  it('links: only web addresses, written the standard way', () => {
    expect(mailUrl('https://shop.com/products/a b')).toBe('https://shop.com/products/a%20b')
    expect(mailUrl('javascript:alert(1)')).toBeNull()
    expect(mailUrl('data:text/html,<script>')).toBeNull()
    expect(mailUrl('not a url')).toBeNull()
    expect(mailUrl(null)).toBeNull()
  })
  it('the built email has no script-like text even for a hostile product title and link', () => {
    const e = buildCampaignEmail({ name: 'A <script>x</script> {{ y }}', endsAt: null, allowCodes: true },
      [{ campaignName: 'A', title: '<img src=x onerror=alert(1)> javascript:go()', imageUrl: 'javascript:evil()', url: 'javascript:evil()', regular: 100, price: 80, percent: 20 }], 'https://shop')
    expect(e.html).not.toMatch(/<script|javascript:|onerror\s*=|<img src=x/i)
    expect(e.html.match(/\{\{/g)).toHaveLength(1) // only the unsubscribe placeholder
    expect(e.subject).not.toMatch(/[<>{}]/)
    expect(e.html).toContain('href="#"')
  })
})

describe('photo links that look like code (the real cause: ",onerror=redirect/" in a CDN photo link)', () => {
  const HEALF = 'https://de.healf.com/cdn-cgi/image/width=1536,quality=80,format=auto,fit=scale-down,onerror=redirect/img/shopify/s/files/a.jpg'
  const CODE_LIKE = /\bon[a-z]{3,}\s*=/i

  it('a normal photo link is used as it is', () => {
    expect(emailImageSrc(3, 'https://cdn.example.com/a.jpg?width=100&quality=80', 'https://shop')).toBe('https://cdn.example.com/a.jpg?width=100&quality=80')
  })
  it('a link with onerror= is replaced by a clean link on our own site', () => {
    expect(looksLikeCode(HEALF)).toBe(true)
    expect(emailImageSrc(9, HEALF, 'https://shop/')).toBe('https://shop/api/email-image/9')
  })
  it('no product id for a code-like link, or an unusable link: no picture, never the raw link', () => {
    expect(emailImageSrc(undefined, HEALF, 'https://shop')).toBeNull()
    expect(emailImageSrc(0, HEALF, 'https://shop')).toBeNull()
    expect(emailImageSrc(1, 'javascript:evil()', 'https://shop')).toBeNull()
    expect(emailImageSrc(1, null, 'https://shop')).toBeNull()
  })
  it('the campaign email never contains the code-like link, anywhere', () => {
    const e = buildCampaignEmail({ name: 'Wahoo & Oura Sale', endsAt: null, allowCodes: false }, [item({ productId: 9, title: 'Oura Ring 5', imageUrl: HEALF })], 'https://shop')
    expect(e.html).not.toMatch(CODE_LIKE)
    expect(e.html).toContain('https://shop/api/email-image/9')
    expect(e.html).toContain('Oura Ring 5')
  })
  it('a product page link that looks like code becomes a plain #', () => {
    const e = buildCampaignEmail({ name: 'X', endsAt: null, allowCodes: false }, [item({ url: 'https://shop/products/a?x=1&onload=2' })], 'https://shop')
    expect(e.html).not.toMatch(CODE_LIKE)
    expect(e.html).toContain('href="#"')
  })
  it('the weekly newsletter and the wishlist alert are protected the same way', () => {
    const p = { id: 9, slug: 'oura', title: 'Oura <b>Ring</b>', price_egp: 100, images: [{ image_url: HEALF, is_primary: true, display_order: 0 }] } as never
    const html = buildEmailTemplate([p], [p])
    expect(html).not.toMatch(CODE_LIKE)
    expect(html).toContain('/api/email-image/9')
    expect(html).not.toContain('<b>Ring</b>')
  })
})

describe('diagnoseEmail (asks Brevo about smaller emails)', () => {
  const camp = { name: 'Wahoo & Oura Sale', endsAt: null, allowCodes: true }
  const good = (n: number) => item({ title: `Good ${n}`, url: `https://shop/products/good-${n}`, imageUrl: `https://img/good-${n}.jpg` })
  // a pretend Brevo filter: refuses any email that contains the word "BADWORD"
  const refuses = (word: string) => async (html: string) => html.includes(word)

  it('names the product and the part that Brevo refuses', async () => {
    const bad = item({ title: 'Oura Ring', imageUrl: 'https://img/x.jpg?a=1&BADWORD=2', url: 'https://shop/products/oura' })
    const found = await diagnoseEmail(camp, [good(1), bad, good(2)], 'https://shop', refuses('BADWORD'))
    expect(found).toHaveLength(1)
    expect(found[0]).toContain('product "Oura Ring"')
    expect(found[0]).toContain('photo link')
    expect(found[0]).not.toContain('title')
  })
  it('finds a refused title and a refused product link too', async () => {
    const t = await diagnoseEmail(camp, [item({ title: 'BADWORD ring' })], 'https://shop', refuses('BADWORD'))
    expect(t[0]).toContain('its title')
    const l = await diagnoseEmail(camp, [item({ url: 'https://shop/products/BADWORD' })], 'https://shop', refuses('BADWORD'))
    expect(l[0]).toContain('product link')
  })
  it('reports every product that is refused', async () => {
    const found = await diagnoseEmail(camp, [item({ title: 'BADWORD 1' }), good(1), item({ title: 'BADWORD 2' })], 'https://shop', refuses('BADWORD'))
    expect(found).toHaveLength(2)
  })
  it('blames the campaign name when even an empty email is refused', async () => {
    const found = await diagnoseEmail({ ...camp, name: 'BADWORD sale' }, [good(1)], 'https://shop', refuses('BADWORD'))
    expect(found).toHaveLength(1)
    expect(found[0]).toContain('campaign name')
  })
  it('nothing refused alone = nothing to report', async () => {
    expect(await diagnoseEmail(camp, [good(1), good(2)], 'https://shop', async () => false)).toEqual([])
  })
})

describe('brevoRefusesHtml (a draft check, never a send)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })
  const env = () => { vi.stubEnv('BREVO_API_KEY', 'k'); vi.stubEnv('BREVO_SENDER_EMAIL', 'shop@example.com') }
  const reply = (ok: boolean, body: unknown) => ({ ok, json: async () => body })

  it('accepted: creates a draft, deletes it again, never sends', async () => {
    env()
    const f = vi.fn().mockResolvedValueOnce(reply(true, { id: 77 })).mockResolvedValueOnce(reply(true, {}))
    vi.stubGlobal('fetch', f)
    expect(await brevoRefusesHtml('<p>hi</p>')).toBe(false)
    expect(f.mock.calls[0][0]).toContain('/emailCampaigns')
    expect(f.mock.calls[1][0]).toContain('/emailCampaigns/77')
    expect(f.mock.calls[1][1].method).toBe('DELETE')
    expect(f.mock.calls.some((c) => String(c[0]).includes('sendNow'))).toBe(false)
    expect(JSON.parse(f.mock.calls[0][1].body).recipients).toBeUndefined() // no recipients: it could not reach anyone
  })
  it('refused by the code filter = true', async () => {
    env()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(false, { message: 'Please remove any executable code from your HTML content.' })))
    expect(await brevoRefusesHtml('x')).toBe(true)
  })
  it('any other problem is thrown, never taken for a refusal', async () => {
    env()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(false, { message: 'Key not found' })))
    await expect(brevoRefusesHtml('x')).rejects.toThrow('Key not found')
  })
})

describe('email pieces', () => {
  it('escapes text that comes from products and names', () => {
    expect(esc(`<script>"x" & 'y'</script>`)).toBe('&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;')
    const html = saleSectionHtml([item({ title: '<b>Evil</b>', campaignName: 'A & B' })])
    expect(html).not.toContain('<b>Evil</b>')
    expect(html).toContain('b Evil /b') // angle brackets are taken out, not just escaped
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
  it('the sale items carry the product id, so a code-like photo link becomes the clean link in the real email', async () => {
    db.rows('product_images')[0].image_url = 'https://de.healf.com/cdn-cgi/image/width=1536,onerror=redirect/img/a.jpg'
    const items = await loadLiveSaleItems(client(), NOW)
    expect(items.find((i) => i.title === 'Watch')?.productId).toBe(1)
    const e = buildCampaignEmail({ name: 'X', endsAt: null, allowCodes: false }, items, 'https://shop')
    expect(e.html).not.toMatch(/\bon[a-z]{3,}\s*=/i)
    expect(e.html).toContain('https://shop/api/email-image/1')
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
  it('explains Brevo\'s "executable code" refusal in plain words and still allows another try', async () => {
    const strict: EmailDeps = { sendAll: async () => { throw new Error('Please remove any executable code from your HTML content.') }, sendTest: async () => 'x' }
    const r = await emailCampaign(client(), 1, 'all', strict, NOW)
    expect(r.ok).toBe(false)
    expect(r.message).toContain('Nothing went out')
    expect(r.message).toContain('product titles')
    expect(db.rows('promotions')[0].emailed_at).toBeNull()
    failNext = true
    expect((await emailCampaign(client(), 1, 'all', deps, NOW)).message).not.toContain('product titles') // other errors get no hint
  })
  it('when Brevo refuses the text, the message says which product and part (asked from Brevo, nothing sent)', async () => {
    db.rows('products')[1].title = 'Strap BADWORD'
    const asked: string[] = []
    const strict: EmailDeps = {
      sendAll: async () => { throw new Error('Please remove any executable code from your HTML content.') },
      sendTest: async () => 'x',
      refuses: async (html) => { asked.push(html); return html.includes('BADWORD') },
    }
    const r = await emailCampaign(client(), 1, 'all', strict, NOW)
    expect(r.ok).toBe(false)
    expect(r.message).toContain('product "Strap BADWORD"')
    expect(r.message).toContain('Nothing went out')
    expect(asked.length).toBeGreaterThan(1)
    expect(db.rows('promotions')[0].emailed_at).toBeNull()
  })
  it('a problem while asking Brevo is shown, and the campaign can still be tried again', async () => {
    const broken: EmailDeps = {
      sendAll: async () => { throw new Error('Please remove any executable code from your HTML content.') },
      sendTest: async () => 'x',
      refuses: async () => { throw new Error('Key not found') },
    }
    const r = await emailCampaign(client(), 1, 'all', broken, NOW)
    expect(r.message).toContain('Could not find the exact part: Key not found')
    expect(db.rows('promotions')[0].emailed_at).toBeNull()
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
