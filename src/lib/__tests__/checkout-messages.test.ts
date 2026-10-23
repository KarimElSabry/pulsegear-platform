import { describe, expect, it } from 'vitest'
import { orderWhatsappLink } from '../checkout-messages'

describe('orderWhatsappLink', () => {
  it('greets by first name, lists the items and uses the Egyptian country code', () => {
    const url = orderWhatsappLink({ customer_name: 'Ahmed Mohamed', phone: '01012345678', code: 'PG-1234ABCD' }, [{ title: 'Garmin 265', color_name: 'Black', quantity: 2 }])!
    expect(url.startsWith('https://wa.me/201012345678?text=')).toBe(true)
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Hi Ahmed')
    expect(text).toContain('PG-1234ABCD')
    expect(text).toContain('- Garmin 265 (Black) x2')
  })
  it('returns nothing without a usable phone number', () => {
    expect(orderWhatsappLink({ customer_name: 'A B', phone: '12', code: 'PG-1' }, [])).toBeNull()
  })
})
