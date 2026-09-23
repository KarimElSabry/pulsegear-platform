// src/lib/brevo.ts

import { Product, ProductImage } from '@/types/product'
import { createAdminSupabaseClient } from '@/lib/supabase'

const BREVO_API_URL = 'https://api.brevo.com/v3'

function getBrevoApiKey() {
  const key = process.env.BREVO_API_KEY
  if (!key) {
    throw new Error('BREVO_API_KEY is not set')
  }
  return key
}

function getNewsletterListId() {
  const raw = process.env.BREVO_NEWSLETTER_LIST_ID
  const id = Number(raw)
  if (!raw || !Number.isInteger(id) || id <= 0) {
    throw new Error('BREVO_NEWSLETTER_LIST_ID is not set correctly')
  }
  return id
}

function getSenderEmail() {
  const email = process.env.BREVO_SENDER_EMAIL
  if (!email) {
    throw new Error('BREVO_SENDER_EMAIL is not set')
  }
  return email
}

function getSenderName() {
  return process.env.BREVO_SENDER_NAME || 'Pulse Gear Egypt'
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

function getPrimaryImage(product: Product & { images?: ProductImage[] }): string {
  const primary = product.images?.find((img) => img.is_primary)
  return primary?.image_url || product.images?.[0]?.image_url || ''
}

function extractFirstName(name?: string) {
  if (!name) return ''
  return name.trim().split(/\s+/)[0] || ''
}

function buildEmailTemplate(
  newProducts: (Product & { images?: ProductImage[] })[],
  soldProducts: (Product & { images?: ProductImage[] })[]
): string {
  const siteUrl = getSiteUrl()
  const weekDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const newProductCards = newProducts
    .map(
      (p) => `
      <div style="border:1px solid #e0e0e0; padding:16px; margin:12px 0; border-radius:12px; background:#ffffff;">
        ${
          getPrimaryImage(p)
            ? `<img src="${getPrimaryImage(p)}" width="100%" style="border-radius:8px; max-height:220px; object-fit:cover; margin-bottom:12px;"/>`
            : ''
        }
        <h3 style="margin:0 0 6px; font-size:18px; color:#111;">${p.title}</h3>
        <p style="font-size:22px; font-weight:bold; color:#000; margin:6px 0;">${p.price_egp} EGP</p>
        <span style="background:#22c55e; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Available</span>
        <br/><br/>
        <a href="${siteUrl}/products/${p.slug}" style="background:#000; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px;">
          View Product →
        </a>
      </div>
    `
    )
    .join('')

  const soldProductCards = soldProducts
    .map(
      (p) => `
      <div style="border:1px solid #e0e0e0; padding:16px; margin:12px 0; border-radius:12px; background:#f9f9f9;">
        ${
          getPrimaryImage(p)
            ? `<img src="${getPrimaryImage(p)}" width="100%" style="border-radius:8px; max-height:220px; object-fit:cover; margin-bottom:12px; filter:grayscale(60%);"/>`
            : ''
        }
        <h3 style="margin:0 0 6px; font-size:18px; color:#555;">${p.title}</h3>
        <p style="font-size:20px; font-weight:bold; color:#999; margin:6px 0;">${p.price_egp} EGP</p>
        <span style="background:#ef4444; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Sold</span>
      </div>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <body style="font-family:Arial,sans-serif; background:#f4f4f4; margin:0; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:#000; padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:30px; letter-spacing:1px;">Pulse Gear Egypt</h1>
          <p style="color:#aaa; margin:10px 0 0; font-size:14px;">Weekly Update — ${weekDate}</p>
        </div>

        <div style="padding:24px;">
          <h2 style="font-size:20px; border-bottom:2px solid #000; padding-bottom:8px;">
            New This Week
            <span style="background:#000; color:#fff; font-size:13px; padding:2px 10px; border-radius:20px; margin-left:8px;">
              ${newProducts.length} items
            </span>
          </h2>
          ${
            newProductCards ||
            `<p style="color:#888; font-size:14px;">No new products this week. Stay tuned.</p>`
          }

          <hr style="border:none; border-top:1px solid #eee; margin:28px 0;"/>

          <h2 style="font-size:20px; border-bottom:2px solid #ef4444; padding-bottom:8px;">
            Sold This Week
            <span style="background:#ef4444; color:#fff; font-size:13px; padding:2px 10px; border-radius:20px; margin-left:8px;">
              ${soldProducts.length} items
            </span>
          </h2>
          ${
            soldProductCards ||
            `<p style="color:#888; font-size:14px;">Nothing sold this week yet.</p>`
          }

          <div style="text-align:center; margin:36px 0 16px;">
            <a href="${siteUrl}/products" style="background:#000; color:#fff; padding:16px 36px; border-radius:10px; text-decoration:none; font-size:16px; font-weight:bold;">
              Browse All Products
            </a>
          </div>
        </div>

        <div style="background:#f4f4f4; padding:20px; text-align:center;">
          <p style="color:#999; font-size:12px; margin:0;">
            You're receiving this email because you subscribed to Pulse Gear Egypt weekly updates.
          </p>
          <p style="color:#999; font-size:12px; margin:6px 0 0;">
            <a href="${siteUrl}/unsubscribe?email={{ contact.EMAIL }}" style="color:#999;">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function buildWishlistSoldAlertTemplate(
  product: Product & { images?: ProductImage[] },
  recipientEmail: string
): string {
  const siteUrl = getSiteUrl()
  const imageUrl = getPrimaryImage(product)

  return `
    <!DOCTYPE html>
    <html lang="en">
    <body style="font-family:Arial,sans-serif; background:#f4f4f4; margin:0; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:#000; padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:30px; letter-spacing:1px;">Pulse Gear Egypt</h1>
          <p style="color:#aaa; margin:10px 0 0; font-size:14px;">Wishlist Update</p>
        </div>

        <div style="padding:24px;">
          <h2 style="font-size:24px; margin:0 0 12px; color:#111;">
            An item in your wishlist is no longer available
          </h2>

          <p style="font-size:15px; color:#555; line-height:1.7; margin:0 0 18px;">
            One of the products you saved to your wishlist has been marked as sold.
          </p>

          <div style="border:1px solid #e0e0e0; padding:16px; margin:12px 0; border-radius:12px; background:#f9f9f9;">
            ${
              imageUrl
                ? `<img src="${imageUrl}" width="100%" style="border-radius:8px; max-height:220px; object-fit:cover; margin-bottom:12px; filter:grayscale(40%);"/>`
                : ''
            }
            <h3 style="margin:0 0 6px; font-size:18px; color:#333;">${product.title}</h3>
            <p style="font-size:20px; font-weight:bold; color:#777; margin:6px 0;">${product.price_egp} EGP</p>
            <span style="background:#ef4444; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Sold</span>
          </div>

          <div style="text-align:center; margin:30px 0 12px;">
            <a href="${siteUrl}/products" style="display:inline-block; background:#000; color:#fff; padding:14px 28px; border-radius:10px; text-decoration:none; font-size:15px; font-weight:bold; margin:0 6px 10px;">
              Browse Similar Products
            </a>
            <a href="${siteUrl}/request-product" style="display:inline-block; background:#ef4444; color:#fff; padding:14px 28px; border-radius:10px; text-decoration:none; font-size:15px; font-weight:bold; margin:0 6px 10px;">
              Request This Product
            </a>
          </div>
        </div>

        <div style="background:#f4f4f4; padding:20px; text-align:center;">
          <p style="color:#999; font-size:12px; margin:0;">
            This alert was sent because you saved this item to your Pulse Gear wishlist.
          </p>
          <p style="color:#999; font-size:12px; margin:6px 0 0;">
            <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color:#999;">
              Unsubscribe from newsletter
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function addContactToBrevo(
  email: string,
  name?: string,
  metadata?: { source?: string }
): Promise<void> {
  const apiKey = getBrevoApiKey()
  const listId = getNewsletterListId()

  const normalizedEmail = email.trim().toLowerCase()
  const firstName = extractFirstName(name)

  const attributes: Record<string, string> = {}

  if (firstName) {
    attributes.FIRSTNAME = firstName
  }

  if (metadata?.source) {
    attributes.SOURCE = metadata.source
  }

  const res = await fetch(`${BREVO_API_URL}/contacts`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: normalizedEmail,
      attributes,
      listIds: [listId],
      updateEnabled: true,
    }),
  })

  if (res.ok) return

  let err: any = null
  try {
    err = await res.json()
  } catch {
    err = null
  }

  const message = err?.message || 'Brevo subscription failed'

  if (
    message.toLowerCase().includes('duplicate') ||
    message.toLowerCase().includes('already exist') ||
    message.toLowerCase().includes('contact already exist')
  ) {
    return
  }

  throw new Error(message)
}

export async function removeContactFromBrevo(email: string): Promise<void> {
  const apiKey = getBrevoApiKey()
  const encodedEmail = encodeURIComponent(email.trim().toLowerCase())

  const res = await fetch(`${BREVO_API_URL}/contacts/${encodedEmail}`, {
    method: 'DELETE',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (res.status === 404) {
    return
  }

  if (res.ok) return

  let err: any = null
  try {
    err = await res.json()
  } catch {
    err = null
  }

  throw new Error(err?.message || 'Failed to remove contact from Brevo')
}

export async function sendWeeklyNewsletter(
  newProducts: (Product & { images?: ProductImage[] })[],
  soldProducts: (Product & { images?: ProductImage[] })[]
): Promise<void> {
  const apiKey = getBrevoApiKey()
  const listId = getNewsletterListId()
  const htmlContent = buildEmailTemplate(newProducts, soldProducts)

  const createRes = await fetch(`${BREVO_API_URL}/emailCampaigns`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Weekly Newsletter - ${new Date().toLocaleDateString('en-US')}`,
      subject: `Pulse Gear Weekly — ${newProducts.length} New Items This Week`,
      sender: {
        name: getSenderName(),
        email: getSenderEmail(),
      },
      type: 'classic',
      htmlContent,
      recipients: { listIds: [listId] },
    }),
  })

  let createData: any = null
  try {
    createData = await createRes.json()
  } catch {
    createData = null
  }

  if (!createRes.ok || !createData?.id) {
    throw new Error(createData?.message || 'Failed to create newsletter campaign')
  }

  const sendRes = await fetch(`${BREVO_API_URL}/emailCampaigns/${createData.id}/sendNow`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!sendRes.ok) {
    let sendErr: any = null
    try {
      sendErr = await sendRes.json()
    } catch {
      sendErr = null
    }

    throw new Error(sendErr?.message || 'Failed to send newsletter campaign')
  }
}

export async function sendWishlistSoldAlerts(productId: number): Promise<void> {
  const supabase = createAdminSupabaseClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error(productError?.message || 'Product not found for wishlist alert')
  }

  const { data: wishlistRows, error: wishlistError } = await supabase
    .from('wishlist_items')
    .select('user_id')
    .eq('product_id', productId)

  if (wishlistError) {
    throw new Error(wishlistError.message)
  }

  const userIds = [...new Set((wishlistRows ?? []).map((row) => row.user_id).filter(Boolean))]

  if (userIds.length === 0) {
    return
  }

  const { data: existingAlerts, error: alertsError } = await supabase
    .from('wishlist_alerts')
    .select('user_id')
    .eq('product_id', productId)
    .eq('alert_type', 'sold')

  if (alertsError) {
    throw new Error(alertsError.message)
  }

  const alreadySentUserIds = new Set(
    (existingAlerts ?? []).map((row) => row.user_id).filter(Boolean)
  )

  const pendingUserIds = userIds.filter((userId) => !alreadySentUserIds.has(userId))

  if (pendingUserIds.length === 0) {
    return
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id')
    .in('user_id', pendingUserIds)

  if (profilesError) {
    throw new Error(profilesError.message)
  }

  const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers()

  if (authUsersError) {
    throw new Error(authUsersError.message)
  }

  const usersById = new Map(
    (authUsers?.users ?? []).map((user) => [user.id, user])
  )

  const sentRows: Array<{ user_id: string; product_id: number; alert_type: string }> = []

  for (const userId of pendingUserIds) {
    const authUser = usersById.get(userId)
    const email = authUser?.email?.trim().toLowerCase()

    if (!email) continue

    const htmlContent = buildWishlistSoldAlertTemplate(product as Product & { images?: ProductImage[] }, email)

    const res = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': getBrevoApiKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: getSenderName(),
          email: getSenderEmail(),
        },
        to: [{ email }],
        subject: `An item in your wishlist is no longer available`,
        htmlContent,
      }),
    })

    if (!res.ok) {
      let err: any = null
      try {
        err = await res.json()
      } catch {
        err = null
      }

      console.error('[Brevo] wishlist sold alert failed:', email, err?.message || 'Unknown error')
      continue
    }

    sentRows.push({
      user_id: userId,
      product_id: productId,
      alert_type: 'sold',
    })
  }

  if (sentRows.length > 0) {
    const { error: insertAlertError } = await supabase
      .from('wishlist_alerts')
      .insert(sentRows)

    if (insertAlertError) {
      throw new Error(insertAlertError.message)
    }
  }
}