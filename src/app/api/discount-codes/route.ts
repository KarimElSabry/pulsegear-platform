// src/app/api/discount-codes/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { code, discount_percent } = await req.json()

    if (!code || !discount_percent) {
      return NextResponse.json(
        { error: 'Code and discount percent are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .insert({ 
        code: code.toUpperCase().trim(), 
        discount_percent,
        is_active: true // ✅ هنا الـ fix
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}