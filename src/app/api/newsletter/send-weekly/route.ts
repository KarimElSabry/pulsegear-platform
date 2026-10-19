// src/app/api/newsletter/send-weekly/route.ts
// Vercel cron calls this with GET and `Authorization: Bearer <CRON_SECRET>`.
// POST is kept for manual triggers with the same header.

import { NextResponse } from 'next/server'
import { sendWeeklyNewsletter } from '@/lib/brevo'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isCronAuthorized } from '@/lib/admin-auth'
import { withJobLog } from '@/lib/jobs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function handle(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminSupabaseClient()

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [{ data: newProducts, error: newErr }, { data: soldProducts, error: soldErr }] =
      await Promise.all([
        supabase
          .from('products')
          .select('*, images:product_images(*)')
          .gte('created_at', oneWeekAgo.toISOString())
          .eq('status', 'available')
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('*, images:product_images(*)')
          .gte('sold_at', oneWeekAgo.toISOString())
          .eq('status', 'sold')
          .order('sold_at', { ascending: false }),
      ])

    if (newErr) throw newErr
    if (soldErr) throw soldErr

    // Nothing new and nothing sold: skip, rather than emailing subscribers an empty update.
    if ((newProducts?.length ?? 0) === 0 && (soldProducts?.length ?? 0) === 0) {
      return NextResponse.json({ success: true, skipped: 'no new or sold products this week' })
    }

    await sendWeeklyNewsletter(newProducts || [], soldProducts || [])

    return NextResponse.json({
      success: true,
      newProducts: newProducts?.length || 0,
      soldProducts: soldProducts?.length || 0,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send newsletter'
    console.error('[newsletter/send-weekly] Error:', message)

    if (message.includes('BREVO_')) {
      return NextResponse.json({ error: 'Newsletter service is not configured' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 502 })
  }
}

export const GET = withJobLog('newsletter-weekly', (req: Request) => handle(req))

export const POST = withJobLog('newsletter-weekly', (req: Request) => handle(req))
