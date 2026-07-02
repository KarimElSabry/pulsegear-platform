// src/app/api/newsletter/send-weekly/route.ts

import { NextResponse } from 'next/server'
import { sendWeeklyNewsletter } from '@/lib/brevo'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: Request) {
  // ✅ Security check
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // ✅ منتجات جديدة الأسبوع ده
    const { data: newProducts, error: newErr } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .gte('created_at', oneWeekAgo.toISOString())
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (newErr) throw newErr

    // ✅ منتجات اتباعت الأسبوع ده
    const { data: soldProducts, error: soldErr } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .gte('updated_at', oneWeekAgo.toISOString())
      .eq('status', 'sold')
      .order('updated_at', { ascending: false })

    if (soldErr) throw soldErr

    await sendWeeklyNewsletter(newProducts || [], soldProducts || [])

    return NextResponse.json({
      success: true,
      newProducts: newProducts?.length || 0,
      soldProducts: soldProducts?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}