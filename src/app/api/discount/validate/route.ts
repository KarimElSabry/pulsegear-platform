import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // ── Find the code (case-insensitive) ──
    const { data, error } = await supabase
      .from('discount_codes')
      .select('id, code, discount_percent, is_active, usage_count')
      .ilike('code', code.trim())
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 })
    }

    if (!data.is_active) {
      return NextResponse.json(
        { error: 'This code is no longer active' },
        { status: 403 }
      )
    }

    // ── Increment usage_count ──  ✅ fixed parentheses
    await supabase
      .from('discount_codes')
      .update({ usage_count: (data.usage_count ?? 0) + 1 })
      .eq('id', data.id)

    return NextResponse.json({
      success: true,
      code: data.code,
      discount_percent: data.discount_percent,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}