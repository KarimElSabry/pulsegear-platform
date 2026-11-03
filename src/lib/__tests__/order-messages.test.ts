import { describe, expect, it } from 'vitest'
import { customerUpdateMessage, updateWhatsappLink } from '../order-messages'
import { loadEvents } from '../order-events'
import { FakeDb } from './fakeDb'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('customerUpdateMessage', () => {
  it('greets by first name, shows the update and the tracking link', () => {
    const m = customerUpdateMessage({ customerName: 'Ahmed Mohamed', code: 'PG-1', title: 'On its way from Europe', comment: 'DHL 12345', trackUrl: 'https://x/track-order?code=PG-1', expected: '2026-11-20' })
    expect(m).toBe('Hi Ahmed, this is Pulse Gear. An update on your order PG-1:\n*On its way from Europe*\nDHL 12345\nExpected delivery: 2026-11-20\nYou can follow every step here: https://x/track-order?code=PG-1')
  })
  it('leaves out what is missing', () => {
    expect(customerUpdateMessage({ customerName: null, code: null, title: 'Delivered' })).toBe('Hi there, this is Pulse Gear. An update on your order:\n*Delivered*')
  })
  it('builds an Egyptian WhatsApp link, or nothing without a usable phone', () => {
    expect(updateWhatsappLink('01012345678', { customerName: 'A', code: null, title: 'T' })).toMatch(/^https:\/\/wa\.me\/201012345678\?text=/)
    expect(updateWhatsappLink('12', { customerName: 'A', code: null, title: 'T' })).toBeNull()
  })
})

describe('loadEvents and hidden updates', () => {
  const db = () => {
    const f = new FakeDb()
    f.seed('order_events', [
      { id: 'e1', deal_id: 'd1', status: 'sourcing', title: 'Sourcing', comment: null, created_at: '2026-11-01T10:00:00Z', hidden: false },
      { id: 'e2', deal_id: 'd1', status: null, title: 'Internal', comment: 'secret', created_at: '2026-11-02T10:00:00Z', hidden: true },
      { id: 'e3', deal_id: 'd1', status: 'shipping', title: 'Shipping', comment: null, created_at: '2026-11-03T10:00:00Z' },
    ])
    return f as unknown as SupabaseClient
  }
  it('customers never get a hidden update', async () => {
    const ev = (await loadEvents(db(), ['d1'])).get('d1')!
    expect(ev.map((e) => e.id).sort()).toEqual(['e1', 'e3'])
  })
  it('the admin page can ask for them', async () => {
    expect((await loadEvents(db(), ['d1'], { includeHidden: true })).get('d1')).toHaveLength(3)
  })
})
