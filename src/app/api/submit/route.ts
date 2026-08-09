// src/app/api/submit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name,
      email,
      phone,
      governorate,
      city,
      street,
      product,
      budget,
      notes,
    } = body

    // ── Basic validation ──────────────────────────────────────────
    if (!name || !email || !phone || !product || !budget) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ── Insert into Supabase ──────────────────────────────────────
    const { error } = await supabase.from('product_requests').insert([
      {
        name,
        email,
        phone,
        governorate,
        city,
        street,
        product_name: product,
        budget,
        notes,
        status: 'new',          // default status
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('Supabase error:', error.message)
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { status: 'error', message: 'Unexpected server error' },
      { status: 500 }
    )
  }
}