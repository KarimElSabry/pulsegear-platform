import { describe, expect, it } from 'vitest'
import { askMessage } from '../ask-message'
import { instagramDmUrl, whatsappOrderUrl } from '../contact'

describe('askMessage', () => {
  it('lists the cart items with colors and quantities', () => {
    const m = askMessage([{ title: 'Fenix 8', colorName: 'Black', quantity: 1 }, { title: 'HRM 600', quantity: 2 }])
    expect(m).toContain('- Fenix 8 (Black) x1')
    expect(m).toContain('- HRM 600 x2')
    expect(m.endsWith('My question: ')).toBe(true)
  })
  it('works with an empty cart and caps long lists', () => {
    expect(askMessage([])).toMatch(/question before I order/)
    const many = askMessage(Array.from({ length: 20 }, (_, i) => ({ title: `P${i}`, quantity: 1 })))
    expect(many).toContain('…and 5 more')
  })
  it('builds the WhatsApp and Instagram links', () => {
    expect(whatsappOrderUrl('a b')).toBe('https://wa.me/201205322444?text=a%20b')
    expect(instagramDmUrl()).toBe('https://ig.me/m/pulsegear_egypt')
  })
})
