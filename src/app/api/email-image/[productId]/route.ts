// src/app/api/email-image/[productId]/route.ts
// Public. Emails use this link when a product photo's own link looks like code to the email service (for example
// ".../width=1536,onerror=redirect/..."). It looks the photo up BY PRODUCT ID in our own database and sends the browser on to it,
// so it can never be used to redirect somewhere else.

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const productId = Number((await params).productId)
  if (!Number.isInteger(productId) || productId <= 0) return new NextResponse('Not found', { status: 404 })

  const { data } = await createAdminSupabaseClient().from('product_images').select('image_url, is_primary, display_order').eq('product_id', productId)
  const photos = ((data ?? []) as { image_url: string; is_primary: boolean; display_order: number }[])
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)
  const url = photos[0]?.image_url
  let target: URL | null = null
  try { target = url ? new URL(url) : null } catch { target = null }
  if (!target || (target.protocol !== 'https:' && target.protocol !== 'http:')) return new NextResponse('Not found', { status: 404 })

  return NextResponse.redirect(target, { status: 302, headers: { 'Cache-Control': 'public, max-age=3600' } })
}
