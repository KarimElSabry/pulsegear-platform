// src/lib/campaign-email-service.ts
// Server only: emails one live campaign to the newsletter list (or sends you a test first).
// This reaches real customers, so it can only be sent once per campaign unless you ask to send again, and a double click sends once.

import type { SupabaseClient } from '@supabase/supabase-js'
import { buildCampaignEmail } from '@/lib/campaign-email'
import { promotionStatus, type Promotion } from '@/lib/promotions'
import { PROMOTION_COLUMNS, loadLiveSaleItems } from '@/lib/promotions-service'
import { SITE_URL } from '@/lib/site'

export type EmailDeps = {
  sendAll: (input: { name: string; subject: string; html: string }) => Promise<void>
  sendTest: (subject: string, html: string) => Promise<string>
}

export type EmailMode = 'test' | 'all' | 'again'
type Result = { ok: boolean; message: string }

const MISSING = 'Run the Supabase migration 20261111_01_campaign_email.sql first, then try again.'

export async function emailCampaign(db: SupabaseClient, id: number, mode: EmailMode, deps: EmailDeps, now = new Date()): Promise<Result> {
  const { data, error } = await db.from('promotions').select(`${PROMOTION_COLUMNS}, emailed_at`).eq('id', id).maybeSingle()
  if (error) return { ok: false, message: /emailed_at|column|schema cache/i.test(error.message) ? MISSING : error.message }
  if (!data) return { ok: false, message: 'That campaign no longer exists.' }
  const promo = data as Promotion & { emailed_at: string | null }
  if (promotionStatus(promo, now) !== 'live') return { ok: false, message: 'Only a campaign that is live right now can be emailed.' }

  const items = await loadLiveSaleItems(db, now, { promotionId: Number(promo.id) })
  if (items.length === 0) return { ok: false, message: 'None of the campaign products is available, so there is nothing to email.' }
  const email = buildCampaignEmail({ name: promo.name, endsAt: promo.ends_at, allowCodes: promo.allow_codes }, items, SITE_URL)

  if (mode === 'test') {
    try {
      const to = await deps.sendTest(email.subject, email.html)
      return { ok: true, message: `Test email sent to ${to}. Check your inbox.` }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'Could not send the test email.' }
    }
  }

  // Claim first: only one click can win, and a second send needs the explicit "again".
  const previous = promo.emailed_at
  if (mode === 'all' && previous) return { ok: false, message: `This campaign was already emailed on ${new Date(previous).toLocaleDateString('en-GB')}. Use "Email again" if you really want to send it again.` }
  if (mode === 'again' && !previous) return { ok: false, message: 'This campaign has not been emailed yet.' }
  const claimAt = now.toISOString()
  const claim = db.from('promotions').update({ emailed_at: claimAt }).eq('id', id)
  const { data: won, error: claimError } = await (previous ? claim.eq('emailed_at', previous) : claim.is('emailed_at', null)).select('id')
  if (claimError) return { ok: false, message: /emailed_at|column|schema cache/i.test(claimError.message) ? MISSING : claimError.message }
  if (!won || (won as unknown[]).length === 0) return { ok: false, message: 'Someone else just sent this campaign. Reload the page.' }

  try {
    await deps.sendAll({ name: `Campaign - ${promo.name} - ${claimAt.slice(0, 10)}`, subject: email.subject, html: email.html })
  } catch (e) {
    await db.from('promotions').update({ emailed_at: previous }).eq('id', id) // not sent: allow another try
    return { ok: false, message: `Not sent: ${e instanceof Error ? e.message : 'the email service failed'}. Nothing went out.` }
  }
  return { ok: true, message: 'Sent to your newsletter list.' }
}
