// src/lib/audience.ts
// Server-only counts for the admin Audience page: registered accounts (Supabase Auth) and
// newsletter subscribers (Brevo list). Each source fails independently so one outage doesn't blank the page.

import { createAdminSupabaseClient } from '@/lib/supabase'

export interface AccountStats {
  total: number
  last7Days: number
  last30Days: number
  unconfirmed: number
  recent: { email: string; createdAt: string; confirmed: boolean }[]
}

export interface NewsletterStats {
  subscribers: number
  unique: number
  /** Newest campaigns Brevo has actually sent (empty if none). */
  lastCampaigns: { name: string; sentAt: string }[]
}

const DAY_MS = 24 * 60 * 60 * 1000

export async function getAccountStats(): Promise<AccountStats> {
  const supabase = createAdminSupabaseClient()
  const users: { email?: string; created_at: string; email_confirmed_at?: string | null }[] = []

  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(error.message)
    users.push(...data.users)
    if (data.users.length < 1000) break
  }

  const now = Date.now()
  const since = (days: number) => users.filter((u) => now - new Date(u.created_at).getTime() <= days * DAY_MS).length

  return {
    total: users.length,
    last7Days: since(7),
    last30Days: since(30),
    unconfirmed: users.filter((u) => !u.email_confirmed_at).length,
    recent: [...users]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((u) => ({ email: u.email ?? '(no email)', createdAt: u.created_at, confirmed: !!u.email_confirmed_at })),
  }
}

export async function getNewsletterStats(): Promise<NewsletterStats> {
  const key = process.env.BREVO_API_KEY
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID)
  if (!key || !Number.isInteger(listId) || listId <= 0) {
    throw new Error('BREVO_API_KEY / BREVO_NEWSLETTER_LIST_ID are not set')
  }

  const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${listId}`, {
    headers: { 'api-key': key, accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Brevo responded ${res.status}`)

  const body = (await res.json()) as { totalSubscribers?: number; uniqueSubscribers?: number }

  let lastCampaigns: NewsletterStats['lastCampaigns'] = []
  try {
    const c = await fetch('https://api.brevo.com/v3/emailCampaigns?status=sent&sort=desc&limit=3', {
      headers: { 'api-key': key, accept: 'application/json' },
      cache: 'no-store',
    })
    if (c.ok) {
      const cb = (await c.json()) as { campaigns?: { name?: string; sentDate?: string; scheduledAt?: string }[] }
      lastCampaigns = (cb.campaigns ?? []).map((x) => ({ name: x.name ?? '(unnamed)', sentAt: x.sentDate ?? x.scheduledAt ?? '' }))
    }
  } catch { /* the subscriber counts are still useful without this */ }

  return { subscribers: body.totalSubscribers ?? 0, unique: body.uniqueSubscribers ?? 0, lastCampaigns }
}
