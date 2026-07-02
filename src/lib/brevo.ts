// src/lib/brevo.ts

import { Product, ProductImage } from '@/types/product'

const BREVO_API_KEY = process.env.BREVO_API_KEY!
const BREVO_API_URL = 'https://api.brevo.com/v3'
const NEWSLETTER_LIST_ID = 2 // غيره لو عندك List ID تاني في Brevo

// ✅ Helper - جيب أول صورة للمنتج
function getPrimaryImage(product: Product & { images?: ProductImage[] }): string {
  const primary = product.images?.find((img) => img.is_primary)
  return primary?.image_url || product.images?.[0]?.image_url || ''
}

// ✅ بناء الـ Email Template
function buildEmailTemplate(
  newProducts: (Product & { images?: ProductImage[] })[],
  soldProducts: (Product & { images?: ProductImage[] })[]
): string {
  const weekDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // ✅ كروت المنتجات الجديدة
  const newProductCards = newProducts
    .map(
      (p) => `
      <div style="border:1px solid #e0e0e0; padding:16px; margin:12px 0;
                  border-radius:12px; background:#ffffff;">
        ${
          getPrimaryImage(p)
            ? `<img src="${getPrimaryImage(p)}" width="100%"
                style="border-radius:8px; max-height:220px;
                       object-fit:cover; margin-bottom:12px;"/>`
            : ''
        }
        <h3 style="margin:0 0 6px; font-size:18px; color:#111;">
          ${p.title}
        </h3>
        <p style="font-size:22px; font-weight:bold; color:#000; margin:6px 0;">
          ${p.price_egp} EGP
        </p>
        <span style="background:#22c55e; color:#fff; padding:4px 12px;
                     border-radius:20px; font-size:12px; font-weight:bold;">
          ✅ Available
        </span>
        <br/><br/>
        <a href="https://pulsegear-platform.vercel.app/products/${p.slug}"
           style="background:#000; color:#fff; padding:12px 24px;
                  border-radius:8px; text-decoration:none;
                  font-weight:bold; font-size:14px;">
          View Product →
        </a>
      </div>
    `
    )
    .join('')

  // ✅ كروت المنتجات المباعة
  const soldProductCards = soldProducts
    .map(
      (p) => `
      <div style="border:1px solid #e0e0e0; padding:16px; margin:12px 0;
                  border-radius:12px; background:#f9f9f9;">
        ${
          getPrimaryImage(p)
            ? `<img src="${getPrimaryImage(p)}" width="100%"
                style="border-radius:8px; max-height:220px;
                       object-fit:cover; margin-bottom:12px;
                       filter:grayscale(60%);"/>`
            : ''
        }
        <h3 style="margin:0 0 6px; font-size:18px; color:#555;">
          ${p.title}
        </h3>
        <p style="font-size:20px; font-weight:bold; color:#999; margin:6px 0;">
          ${p.price_egp} EGP
        </p>
        <span style="background:#ef4444; color:#fff; padding:4px 12px;
                     border-radius:20px; font-size:12px; font-weight:bold;">
          🔴 Sold
        </span>
      </div>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <body style="font-family:Arial,sans-serif; background:#f4f4f4;
                 margin:0; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff;
                  border-radius:16px; overflow:hidden;
                  box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- ✅ Header -->
        <div style="background:#000; padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:30px; letter-spacing:1px;">
            ⚡ Pulse Gear Egypt
          </h1>
          <p style="color:#aaa; margin:10px 0 0; font-size:14px;">
            Weekly Update — ${weekDate}
          </p>
        </div>

        <!-- ✅ Body -->
        <div style="padding:24px;">

          <!-- New Products -->
          <h2 style="font-size:20px; border-bottom:2px solid #000;
                     padding-bottom:8px;">
            🆕 New This Week
            <span style="background:#000; color:#fff; font-size:13px;
                         padding:2px 10px; border-radius:20px; margin-left:8px;">
              ${newProducts.length} items
            </span>
          </h2>
          ${
            newProductCards ||
            `<p style="color:#888; font-size:14px;">
              No new products this week. Stay tuned! 👀
            </p>`
          }

          <hr style="border:none; border-top:1px solid #eee; margin:28px 0;"/>

          <!-- Sold Products -->
          <h2 style="font-size:20px; border-bottom:2px solid #ef4444;
                     padding-bottom:8px;">
            🔴 Sold This Week
            <span style="background:#ef4444; color:#fff; font-size:13px;
                         padding:2px 10px; border-radius:20px; margin-left:8px;">
              ${soldProducts.length} items
            </span>
          </h2>
          ${
            soldProductCards ||
            `<p style="color:#888; font-size:14px;">
              Nothing sold this week yet.
            </p>`
          }

          <!-- ✅ CTA Button -->
          <div style="text-align:center; margin:36px 0 16px;">
            <a href="https://pulsegear-platform.vercel.app/products"
               style="background:#000; color:#fff; padding:16px 36px;
                      border-radius:10px; text-decoration:none;
                      font-size:16px; font-weight:bold;">
              🛒 Browse All Products
            </a>
          </div>

        </div>

        <!-- ✅ Footer -->
        <div style="background:#f4f4f4; padding:20px; text-align:center;">
          <p style="color:#999; font-size:12px; margin:0;">
            You're receiving this email because you subscribed to
            Pulse Gear Egypt weekly updates.
          </p>
          <p style="color:#999; font-size:12px; margin:6px 0 0;">
            <a href="{{unsubscribeLink}}" style="color:#999;">
              Unsubscribe
            </a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}

// ✅ اشتراك عميل جديد في Brevo
export async function addContactToBrevo(
  email: string,
  name?: string
): Promise<void> {
  const res = await fetch(`${BREVO_API_URL}/contacts`, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: name || '' },
      listIds: [NEWSLETTER_LIST_ID],
      updateEnabled: true,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Brevo subscription failed')
  }
}

// ✅ إرسال الـ Newsletter الأسبوعي
export async function sendWeeklyNewsletter(
  newProducts: (Product & { images?: ProductImage[] })[],
  soldProducts: (Product & { images?: ProductImage[] })[]
): Promise<void> {
  const htmlContent = buildEmailTemplate(newProducts, soldProducts)

  const res = await fetch(`${BREVO_API_URL}/emailCampaigns`, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Weekly Newsletter - ${new Date().toLocaleDateString('en-US')}`,
      subject: `⚡ Pulse Gear Weekly — ${newProducts.length} New Items This Week!`,
      sender: {
        name: 'Pulse Gear Egypt',
        email: 'pulsegearegypt@gmail.com', // ← غير ده بالإيميل بتاعك
      },
      type: 'classic',
      htmlContent,
      recipients: { listIds: [NEWSLETTER_LIST_ID] },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to send newsletter')
  }
}