// src/lib/campaign-email.ts
// The sale part of the newsletter and the one-campaign email. Pure: data in, HTML out.

export type SaleEmailItem = {
  /** Needed to give a photo link that looks like code (for example "...,onerror=redirect/...") a clean link on our own site. */
  productId?: number
  campaignName: string
  title: string
  imageUrl: string | null
  url: string
  regular: number
  price: number
  percent: number
}

import { SITE_URL } from '@/lib/site'

export const MAX_EMAIL_ITEMS = 12

export const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/**
 * Text that comes from products and campaign names, made safe for an email. Brevo refuses any email that looks like it
 * contains code ("Please remove any executable code from your HTML content"), so characters and patterns that look like
 * code are taken out: angle brackets, template braces ({{ }} {% %}), "javascript:" and "onclick=" style words.
 */
export function mailText(s: unknown): string {
  const cleaned = String(s ?? '')
    .replace(/[<>`]/g, ' ')
    .replace(/\{\{|\}\}|\{%|%\}/g, ' ')
    .replace(/\b(java|vb)script\s*:/gi, '$1script -')
    .replace(/\b(on[a-z]{3,})\s*=/gi, '$1 -')
    .replace(/\s+/g, ' ')
    .trim()
  return esc(cleaned)
}

/** A link for an email: only normal web addresses, written the standard way (quotes and spaces encoded). Anything else becomes null. */
export function mailUrl(u: unknown): string | null {
  try {
    const url = new URL(String(u ?? '').trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

/**
 * Does a link look like code to an email filter? Photo links from shops often carry options such as
 * ".../width=1536,quality=80,onerror=redirect/img/..." and Brevo reads "onerror=" as an event handler and refuses the whole email.
 */
export const looksLikeCode = (s: string) => /\bon[a-z]{3,}\s*=|(java|vb)script\s*:|[<>]/i.test(s)

/**
 * The photo link to put in an email. A normal photo link is used as it is. A link that looks like code is replaced by
 * a clean link on our own site that sends the visitor to the photo (/api/email-image/<product id>), so the email text never contains it.
 * Returns null when there is no usable photo (the email then simply has no picture).
 */
export function emailImageSrc(productId: number | string | null | undefined, url: unknown, siteUrl: string = SITE_URL): string | null {
  const safe = mailUrl(url)
  if (!safe) return null
  if (!looksLikeCode(safe)) return safe
  const id = Number(productId)
  return Number.isInteger(id) && id > 0 ? `${siteUrl.replace(/\/$/, '')}/api/email-image/${id}` : null
}

const egp = (n: number) => `${n.toLocaleString('en-US')} EGP`

function card(i: SaleEmailItem, siteUrl: string = SITE_URL): string {
  const photo = emailImageSrc(i.productId, i.imageUrl, siteUrl)
  return `
      <div style="border:1px solid #fecaca; padding:16px; margin:12px 0; border-radius:12px; background:#ffffff;">
        ${photo ? `<img src="${esc(photo)}" width="100%" style="border-radius:8px; max-height:220px; object-fit:cover; margin-bottom:12px;" alt=""/>` : ''}
        <span style="background:#dc2626; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold;">-${i.percent}%</span>
        <h3 style="margin:10px 0 6px; font-size:18px; color:#111;">${mailText(i.title)}</h3>
        <p style="font-size:22px; font-weight:bold; color:#000; margin:6px 0;">
          ${egp(i.price)} <span style="font-size:15px; font-weight:normal; color:#888; text-decoration:line-through;">${egp(i.regular)}</span>
        </p>
        <a href="${esc(mailUrl(i.url) && !looksLikeCode(mailUrl(i.url)!) ? mailUrl(i.url) : '#')}" style="background:#dc2626; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px; display:inline-block;">View Product →</a>
      </div>`
}

/** "On sale now" block for the weekly newsletter. Empty string when nothing is on sale. */
export function saleSectionHtml(items: SaleEmailItem[], siteUrl: string = SITE_URL): string {
  if (items.length === 0) return ''
  const names = [...new Set(items.map((i) => i.campaignName))]
  return `
          <h2 style="font-size:20px; border-bottom:2px solid #dc2626; padding-bottom:8px;">
            🔥 On Sale Now
            <span style="background:#dc2626; color:#fff; font-size:13px; padding:2px 10px; border-radius:20px; margin-left:8px;">${mailText(names.join(' · '))}</span>
          </h2>
          ${items.slice(0, MAX_EMAIL_ITEMS).map((i) => card(i, siteUrl)).join('')}
          <hr style="border:none; border-top:1px solid #eee; margin:28px 0;"/>`
}

const cairoDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Cairo' })

/** The email for one campaign (sent from the Campaigns page). */
export function buildCampaignEmail(campaign: { name: string; endsAt: string | null; allowCodes: boolean }, items: SaleEmailItem[], siteUrl: string): { subject: string; html: string } {
  const top = Math.max(0, ...items.map((i) => i.percent))
  const subject = `${String(campaign.name).replace(/[<>{}]/g, ' ').replace(/\s+/g, ' ').trim()}: up to ${top}% off at Pulse Gear Egypt`
  const html = `<!DOCTYPE html>
    <html lang="en">
    <body style="font-family:Arial,sans-serif; background:#f4f4f4; margin:0; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:#000; padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:30px; letter-spacing:1px;">Pulse Gear Egypt</h1>
          <p style="color:#fca5a5; margin:12px 0 0; font-size:20px; font-weight:bold;">🔥 ${mailText(campaign.name)}</p>
          <p style="color:#aaa; margin:8px 0 0; font-size:14px;">${campaign.endsAt ? `Ends ${esc(cairoDate(campaign.endsAt))}` : 'For a limited time'}</p>
        </div>
        <div style="padding:24px;">
          ${items.slice(0, MAX_EMAIL_ITEMS).map((i) => card(i, siteUrl)).join('')}
          ${items.length > MAX_EMAIL_ITEMS ? `<p style="color:#555; font-size:14px;">…and ${items.length - MAX_EMAIL_ITEMS} more on the website.</p>` : ''}
          ${campaign.allowCodes ? '<p style="color:#555; font-size:13px; margin:16px 0 0;">Your discount code still works on top of these prices.</p>' : ''}
          <div style="text-align:center; margin:36px 0 16px;">
            <a href="${esc(mailUrl(siteUrl) ? siteUrl.replace(/\/$/, '') : '')}/products" style="background:#000; color:#fff; padding:16px 36px; border-radius:10px; text-decoration:none; font-size:16px; font-weight:bold;">Shop the sale</a>
          </div>
        </div>
        <div style="background:#f4f4f4; padding:20px; text-align:center;">
          <p style="color:#999; font-size:12px; margin:0;">You're receiving this email because you subscribed to Pulse Gear Egypt updates.</p>
          <p style="color:#999; font-size:12px; margin:6px 0 0;"><a href="${esc(siteUrl)}/unsubscribe?email={{ contact.EMAIL }}" style="color:#999;">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>`
  return { subject, html }
}


/**
 * Finds what Brevo's code filter objects to, by asking it about smaller emails (nothing is sent).
 * `refuses(html)` says whether Brevo refuses that HTML. Returns a list of plain sentences; empty = nothing could be isolated.
 */
export async function diagnoseEmail(campaign: { name: string; endsAt: string | null; allowCodes: boolean }, items: SaleEmailItem[], siteUrl: string, refuses: (html: string) => Promise<boolean>): Promise<string[]> {
  const build = (list: SaleEmailItem[]) => buildCampaignEmail(campaign, list, siteUrl).html
  if (await refuses(build([]))) return [`the campaign name "${campaign.name}" or the fixed text of the email`]
  const found: string[] = []
  for (const item of items.slice(0, MAX_EMAIL_ITEMS)) {
    if (!(await refuses(build([item])))) continue
    const parts: [string, SaleEmailItem, string][] = [
      ['title', { ...item, title: 'x' }, item.title],
      ['photo link', { ...item, imageUrl: null }, String(item.imageUrl ?? '')],
      ['product link', { ...item, url: siteUrl }, item.url],
    ]
    const culprits: string[] = []
    for (const [label, changed, value] of parts) {
      if (!(await refuses(build([changed])))) culprits.push(`its ${label} (${value.slice(0, 120)})`)
    }
    found.push(`product "${item.title.slice(0, 80)}": ${culprits.length ? culprits.join(' and ') : 'the combination of its title and links'}`)
  }
  return found
}
