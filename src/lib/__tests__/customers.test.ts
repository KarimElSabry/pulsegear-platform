import { describe, expect, it } from 'vitest'
import { buildCustomers, filterCustomers } from '../customers'

const users = [
  { id: 'a', email: 'ali@x.com', created_at: '2026-10-01T00:00:00Z', email_confirmed_at: '2026-10-01T00:01:00Z' },
  { id: 'b', email: 'sara@x.com', created_at: '2026-10-05T00:00:00Z', email_confirmed_at: null },
]

describe('buildCustomers', () => {
  it('joins profile, newest request address and reservation phone; newest signup first', () => {
    const list = buildCustomers(
      users,
      [{ user_id: 'a', first_name: 'Ali', last_name: 'Hassan', newsletter_subscribed: true, current_sport: 'Running' }],
      [
        { user_id: 'a', street: 'Old St', city: 'Giza', governorate: 'Giza', created_at: '2026-10-02' },
        { user_id: 'a', street: '5 Nile St', city: 'Maadi', governorate: 'Cairo', created_at: '2026-10-09' },
      ],
      [{ user_id: 'a', phone: '01012345678', created_at: '2026-10-03' }, { user_id: 'b', name: 'Sara N', phone: '01199999999', created_at: '2026-10-06' }],
    )
    expect(list.map((c) => c.id)).toEqual(['b', 'a'])
    const a = list.find((c) => c.id === 'a')!
    expect(a).toMatchObject({ name: 'Ali Hassan', phone: '01012345678', address: '5 Nile St, Maadi, Cairo', newsletter: true, confirmed: true, requests: 2, reservations: 1 })
    expect(list[0]).toMatchObject({ name: 'Sara N', phone: '01199999999', confirmed: false, address: '' })
  })
  it('filters by name, email, address and phone digits', () => {
    const list = buildCustomers(users, [{ user_id: 'a', first_name: 'Ali', phone: '010-1234-5678' }], [], [])
    expect(filterCustomers(list, 'ali')).toHaveLength(1)
    expect(filterCustomers(list, '01012345678')).toHaveLength(1)
    expect(filterCustomers(list, 'zzz')).toHaveLength(0)
    expect(filterCustomers(list, '')).toHaveLength(2)
  })
})

import { phoneKey, repeatBuyers } from '../customers'

describe('repeat buyers', () => {
  it('matches the same phone written differently and ranks by spend', () => {
    const r = repeatBuyers([
      { customer_name: 'Ali', customer_phone: '01012345678', selling_price_egp: 1000, sale_date: '2026-09-01' },
      { customer_name: '', customer_phone: '+20 101 234 5678', selling_price_egp: 2500.5, sale_date: '2026-10-01' },
      { customer_name: 'Sara', customer_phone: '01199999999', selling_price_egp: 900, sale_date: '2026-10-02' },
      { customer_phone: null, selling_price_egp: 300 },
    ])
    expect(r.repeat).toHaveLength(1)
    expect(r.repeat[0]).toMatchObject({ name: 'Ali', orders: 2, totalEgp: 3500.5, lastSale: '2026-10-01' })
    expect(r.identified).toBe(2)
    expect(r.unidentified).toBe(1)
  })
  it('ignores too-short phones', () => { expect(phoneKey('123')).toBeNull() })
})
