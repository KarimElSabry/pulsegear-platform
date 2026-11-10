// src/lib/campaign-email.ts
// The sale part of the newsletter and the one-campaign email. Pure: data in, HTML out.

export type SaleEmailItem = {
  campaignName: string
  title: string
  imageUrl: string | null
  url: string
  regular: number
  price: number
  percent: number
}

export const MAX_EMAIL_ITEMS = 12

export const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const egp = (n: number) => `${n.toLocaleString('en-US')} EGP`

function card(i: SaleEmailItem): string {
  return `
      <div style="border:1px solid #fecaca; padding:16px; margin:12px 0; border-radius:12px; background:#ffffff;">
        ${i.imageUrl ? `<img src="${esc(i.imageUrl)}" width="100%" style="border-radius:8px; max-height:220px; object-fit:cover; margin-bottom:12px;" alt=""/>` : ''}
        <span style="background:#dc2626; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold;">-${i.percent}%</span>
        <h3 style="margin:10px 0 6px; font-size:18px; color:#111;">${esc(i.title)}</h3>
        <p style="font-size:22px; font-weight:bold; color:#000; margin:6px 0;">
          ${egp(i.price)} <span style="font-size:15px; font-weight:normal; color:#888; text-decoration:line-through;">${egp(i.regular)}</span>
        </p>
        <a href="${esc(i.url)}" style="background:#dc2626; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px; display:inline-block;">View Product →</a>
      </div>`
}

/** "On sale now" block for the weekly newsletter. Empty string when nothing is on sale. */
export function saleSectionHtml(items: SaleEmailItem[]): string {
  if (items.length === 0) return ''
  const names = [...new Set(items.map((i) => i.campaignName))]
  return `
          <h2 style="font-size:20px; border-bottom:2px solid #dc2626; padding-bottom:8px;">
            🔥 On Sale Now
            <span style="background:#dc2626; color:#fff; font-size:13px; padding:2px 10px; border-radius:20px; margin-left:8px;">${esc(names.join(' · '))}</span>
          </h2>
          ${items.slice(0, MAX_EMAIL_ITEMS).map(card).join('')}
          <hr style="border:none; border-top:1px solid #eee; margin:28px 0;"/>`
}

const cairoDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Cairo' })

/** The email for one campaign (sent from the Campaigns page). */
export function buildCampaignEmail(campaign: { name: string; endsAt: string | null; allowCodes: boolean }, items: SaleEmailItem[], siteUrl: string): { subject: string; html: string } {
  const top = Math.max(0, ...items.map((i) => i.percent))
  const subject = `${campaign.name}: up to ${top}% off at Pulse Gear Egypt`
  const html = `<!DOCTYPE html>
    <html lang="en">
    <body style="font-family:Arial,sans-serif; background:#f4f4f4; margin:0; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:#000; padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:30px; letter-spacing:1px;">Pulse Gear Egypt</h1>
          <p style="color:#fca5a5; margin:12px 0 0; font-size:20px; font-weight:bold;">🔥 ${esc(campaign.name)}</p>
          <p style="color:#aaa; margin:8px 0 0; font-size:14px;">${campaign.endsAt ? `Ends ${esc(cairoDate(campaign.endsAt))}` : 'For a limited time'}</p>
        </div>
        <div style="padding:24px;">
          ${items.slice(0, MAX_EMAIL_ITEMS).map(card).join('')}
          ${items.length > MAX_EMAIL_ITEMS ? `<p style="color:#555; font-size:14px;">…and ${items.length - MAX_EMAIL_ITEMS} more on the website.</p>` : ''}
          ${campaign.allowCodes ? '<p style="color:#555; font-size:13px; margin:16px 0 0;">Your discount code still works on top of these prices.</p>' : ''}
          <div style="text-align:center; margin:36px 0 16px;">
            <a href="${esc(siteUrl)}/products" style="background:#000; color:#fff; padding:16px 36px; border-radius:10px; text-decoration:none; font-size:16px; font-weight:bold;">Shop the sale</a>
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
