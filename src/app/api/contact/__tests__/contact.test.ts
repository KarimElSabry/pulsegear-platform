import { beforeEach, describe, expect, it, vi } from 'vitest'

const telegram = vi.fn<(html: string) => Promise<boolean>>()
vi.mock('@/lib/telegram', () => ({ escapeTelegramHtml: (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), sendTelegramMessage: (h: string) => telegram(h) }))

import { POST } from '../route'
import { resetRateLimits } from '@/lib/rate-limit'

const good = { name: 'Omar', email: 'omar@example.com', phone: '01001112222', subject: 'Delivery date', message: 'When will it arrive?' }
const call = (body: unknown, ip = '1.1.1.1') => POST(new Request('http://x/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: typeof body === 'string' ? body : JSON.stringify(body) }))
const fetchMock = vi.fn()

beforeEach(() => {
  resetRateLimits(); telegram.mockReset(); fetchMock.mockReset()
  telegram.mockResolvedValue(true)
  fetchMock.mockResolvedValue({ ok: true })
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('contact form endpoint', () => {
  it('sends the message to Telegram and the sheet, and answers success', async () => {
    const res = await call(good)
    expect(res.status).toBe(200)
    expect(telegram).toHaveBeenCalledTimes(1)
    expect(telegram.mock.calls[0][0]).toContain('New contact message')
    expect(telegram.mock.calls[0][0]).toContain('When will it arrive?')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('an order question says which order, in the Telegram message and the sheet subject', async () => {
    await call({ ...good, orderCode: 'pg-3fa9c21b' })
    expect(telegram.mock.calls[0][0]).toContain('Question about order PG-3FA9C21B')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).subject).toBe('[PG-3FA9C21B] Delivery date')
  })

  it('ignores a malformed order code instead of putting it in the message', async () => {
    await call({ ...good, orderCode: '<b>hack</b>' })
    expect(telegram.mock.calls[0][0]).not.toContain('hack')
    expect(telegram.mock.calls[0][0]).toContain('New contact message')
  })

  it('escapes HTML so a visitor cannot format or inject into your Telegram chat', async () => {
    await call({ ...good, message: '<a href="http://evil">click</a> & more' })
    const sent = telegram.mock.calls[0][0]
    expect(sent).not.toContain('<a href')
    expect(sent).toContain('&lt;a href')
  })

  it('still says success when Telegram worked but the sheet failed, and when only the sheet worked', async () => {
    fetchMock.mockRejectedValue(new Error('down'))
    expect((await call(good)).status).toBe(200)
    telegram.mockResolvedValue(false); fetchMock.mockResolvedValue({ ok: true })
    expect((await call(good, '2.2.2.2')).status).toBe(200)
  })

  it('never says "sent" when nothing could be delivered anywhere', async () => {
    telegram.mockResolvedValue(false); fetchMock.mockResolvedValue({ ok: false })
    const res = await call(good)
    expect(res.status).toBe(502)
    expect((await res.json()).status).toBe('error')
  })

  it('rejects missing fields, a bad email and unreadable bodies', async () => {
    expect((await call({ ...good, name: '' })).status).toBe(400)
    expect((await call({ ...good, email: 'nope' })).status).toBe(400)
    expect((await call({ ...good, message: '   ' })).status).toBe(400)
    expect((await call('{not json')).status).toBe(400)
    expect(telegram).not.toHaveBeenCalled()
  })

  it('allows 5 messages in 10 minutes per address, then slows spam down', async () => {
    for (let i = 0; i < 5; i++) expect((await call(good)).status).toBe(200)
    expect((await call(good)).status).toBe(429)
    expect((await call(good, '9.9.9.9')).status).toBe(200)
  })
})
