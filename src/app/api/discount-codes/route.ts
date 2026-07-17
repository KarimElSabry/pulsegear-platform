// src/app/api/discount-codes/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET ────────────────────────────────────────────────
export async function GET() {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ── POST ───────────────────────────────────────────────
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
      .insert({ code: code.toUpperCase().trim(), discount_percent })
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

// ── PATCH ──────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { id, is_active, discount_percent } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (typeof is_active === 'boolean') updates.is_active = is_active
    if (discount_percent !== undefined) updates.discount_percent = discount_percent

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .update(updates)
      .eq('id', Number(id))
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Code not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── DELETE ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', Number(id))

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}