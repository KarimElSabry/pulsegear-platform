// src/lib/customers.ts
// Admin-only customer directory: one row per registered account, joined with the profile the customer filled in
// and the contact details from their product requests and reservations. Never import this from a public page.


export interface AuthUserLite { id: string; email?: string; created_at: string; email_confirmed_at?: string | null }
export interface ProfileLite {
  user_id: string; first_name?: string | null; last_name?: string | null; phone?: string | null
  newsletter_subscribed?: boolean | null; current_sport?: string | null; current_watch?: string | null
}
export interface RequestLite {
  user_id: string | null; customer_name?: string | null; phone?: string | null
  governorate?: string | null; city?: string | null; street?: string | null; created_at?: string | null
}
export interface ReservationLite { user_id: string | null; name?: string | null; phone?: string | null; created_at?: string | null }

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joined: string
  confirmed: boolean
  newsletter: boolean
  sport: string
  watch: string
  requests: number
  reservations: number
}

const clean = (v?: string | null) => (v ?? '').trim()
const byNewest = <T extends { created_at?: string | null }>(a: T, b: T) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()

/** Pure join. Newest request/reservation wins for name, phone and address when the profile has none. */
export function buildCustomers(users: AuthUserLite[], profiles: ProfileLite[], requests: RequestLite[], reservations: ReservationLite[]): Customer[] {
  const profileBy = new Map(profiles.map((p) => [p.user_id, p]))
  const group = <T extends { user_id: string | null; created_at?: string | null }>(rows: T[]) => {
    const m = new Map<string, T[]>()
    for (const r of [...rows].sort(byNewest)) if (r.user_id) m.set(r.user_id, [...(m.get(r.user_id) ?? []), r])
    return m
  }
  const reqBy = group(requests)
  const resBy = group(reservations)

  return users
    .map((u): Customer => {
      const p = profileBy.get(u.id)
      const reqs = reqBy.get(u.id) ?? []
      const ress = resBy.get(u.id) ?? []
      const withAddress = reqs.find((r) => clean(r.street) || clean(r.city) || clean(r.governorate))
      const profileName = [clean(p?.first_name), clean(p?.last_name)].filter(Boolean).join(' ')
      return {
        id: u.id,
        name: profileName || clean(reqs[0]?.customer_name) || clean(ress[0]?.name) || '',
        email: u.email ?? '',
        phone: clean(p?.phone) || clean(reqs.find((r) => clean(r.phone))?.phone) || clean(ress.find((r) => clean(r.phone))?.phone),
        address: withAddress ? [withAddress.street, withAddress.city, withAddress.governorate].map(clean).filter(Boolean).join(', ') : '',
        joined: u.created_at,
        confirmed: !!u.email_confirmed_at,
        newsletter: !!p?.newsletter_subscribed,
        sport: clean(p?.current_sport),
        watch: clean(p?.current_watch),
        requests: reqs.length,
        reservations: ress.length,
      }
    })
    .sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime())
}

export function filterCustomers(list: Customer[], q: string): Customer[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return list
  const digits = needle.replace(/\D/g, '')
  return list.filter((c) =>
    [c.name, c.email, c.address, c.sport, c.watch].some((v) => v.toLowerCase().includes(needle)) ||
    (digits.length >= 4 && c.phone.replace(/\D/g, '').includes(digits)))
}

export async function loadCustomers(): Promise<Customer[]> {
  // loaded lazily so the pure functions above can be unit tested without Supabase env vars
  const { createAdminSupabaseClient } = await import('@/lib/supabase')
  const db = createAdminSupabaseClient()
  const users: AuthUserLite[] = []
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(error.message)
    users.push(...(data.users as AuthUserLite[]))
    if (data.users.length < 1000) break
  }
  const [profiles, requests, reservations] = await Promise.all([
    db.from('profiles').select('user_id, first_name, last_name, phone, newsletter_subscribed, current_sport, current_watch'),
    db.from('product_requests').select('user_id, customer_name, phone, governorate, city, street, created_at').not('user_id', 'is', null),
    db.from('reservations').select('user_id, name, phone, created_at').not('user_id', 'is', null),
  ])
  for (const r of [profiles, requests, reservations]) if (r.error) throw new Error(r.error.message)
  return buildCustomers(users, (profiles.data ?? []) as ProfileLite[], (requests.data ?? []) as RequestLite[], (reservations.data ?? []) as ReservationLite[])
}

// ─── Repeat buyers ─────────────────────────────────────────────────────────────────────────────────────

export interface SaleBuyerLite { customer_name?: string | null; customer_phone?: string | null; selling_price_egp?: number | string | null; sale_date?: string | null }
export interface RepeatBuyer { key: string; name: string; phone: string; orders: number; totalEgp: number; lastSale: string | null }

/** Same person = same last 10 digits of the phone (01012345678 and +201012345678 match). */
export function phoneKey(phone?: string | null): string | null {
  const d = (phone ?? '').replace(/\D/g, '')
  return d.length >= 8 ? d.slice(-10) : null
}

/** Buyers with two or more orders, best spenders first. Sales without a phone cannot be matched and are ignored. */
export function repeatBuyers(sales: SaleBuyerLite[]): { repeat: RepeatBuyer[]; identified: number; unidentified: number } {
  const by = new Map<string, RepeatBuyer>()
  let unidentified = 0
  for (const s of sales) {
    const key = phoneKey(s.customer_phone)
    if (!key) { unidentified++; continue }
    const cur = by.get(key) ?? { key, name: '', phone: clean(s.customer_phone), orders: 0, totalEgp: 0, lastSale: null }
    cur.orders += 1
    cur.totalEgp = Math.round((cur.totalEgp + (Number(s.selling_price_egp) || 0)) * 100) / 100
    if (!cur.name) cur.name = clean(s.customer_name)
    if (s.sale_date && (!cur.lastSale || s.sale_date > cur.lastSale)) cur.lastSale = s.sale_date
    by.set(key, cur)
  }
  const all = [...by.values()]
  return { repeat: all.filter((b) => b.orders >= 2).sort((a, b) => b.totalEgp - a.totalEgp), identified: all.length, unidentified }
}

export async function loadRepeatBuyers() {
  const { createAdminSupabaseClient } = await import('@/lib/supabase')
  const { data, error } = await createAdminSupabaseClient()
    .from('sales').select('customer_name, customer_phone, selling_price_egp, sale_date').eq('status', 'completed')
  if (error) throw new Error(error.message)
  return repeatBuyers((data ?? []) as SaleBuyerLite[])
}
