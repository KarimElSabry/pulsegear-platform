// src/app/api/submit/route.ts

import { NextResponse } from 'next/server'
import { createClient }  from '@supabase/supabase-js'

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_m5sS_5s9Us1vNA1MMeSobyMwg2NnJEJNcUCGa6Vlc-zOtdWeFXGCaCw1GgBDpEhDpg/exec'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ✅ Field names match what deals/actions.ts expects
    const { error } = await supabase.from('product_requests').insert([{
      customer_name:     body.name,
      email:             body.email,
      phone:             body.phone,
      instagram:         body.instagram    ?? null,
      governorate:       body.governorate,
      city:              body.city,
      street:            body.street,
      requested_product: body.product,
      budget:            parseFloat(body.budget) || null,
      notes:             body.notes        ?? null,
      status:            'new',
    }])

    if (error) throw error

    // ✅ Also send to Google Sheets
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...body, formType: 'product_request' }),
      })
    } catch (sheetErr) {
      console.warn('Google Sheets sync failed (non-fatal):', sheetErr)
    }

    return NextResponse.json({ status: 'success' })

  } catch (err: any) {
    console.error('Submit error:', err)
    return NextResponse.json(
      { status: 'error', message: err.message ?? 'Something went wrong' },
      { status: 500 }
    )
  }
}