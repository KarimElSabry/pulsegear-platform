// src/app/api/newsletter/send-weekly/route.ts

import { NextResponse } from 'next/server'
import { sendWeeklyNewsletter } from '@/lib/brevo'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminSupabaseClient()

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: newProducts, error: newErr } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .gte('created_at', oneWeekAgo.toISOString())
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (newErr) throw newErr

    const { data: soldProducts, error: soldErr } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .gte('sold_at', oneWeekAgo.toISOString())
      .eq('status', 'sold')
      .order('sold_at', { ascending: false })

    if (soldErr) throw soldErr

    await sendWeeklyNewsletter(newProducts || [], soldProducts || [])

    return NextResponse.json({
      success: true,
      newProducts: newProducts?.length || 0,
      soldProducts: soldProducts?.length || 0,
    })
  } catch (error: any) {
    const message = error?.message || 'Failed to send newsletter'

    if (
      message.includes('BREVO_API_KEY') ||
      message.includes('BREVO_NEWSLETTER_LIST_ID') ||
      message.includes('BREVO_SENDER_EMAIL')
    ) {
      return NextResponse.json(
        { error: 'Newsletter service is not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: message },
      { status: 502 }
    )
  }
}