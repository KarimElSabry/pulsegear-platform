import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ── 1️⃣ Supabase ──
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

    // ── 2️⃣ Telegram — hardcoded ──
    await fetch(
      `https://api.telegram.org/bot8997188424:AAHOqxvt7IRT0Q671yRfSksb_Jfdj6a5mmg/sendMessage`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    '2016864226',
          text:
            `📦 *New Product Request!*\n\n` +
            `👤 *Name:* ${body.name}\n` +
            `📧 *Email:* ${body.email}\n` +
            `📞 *Phone:* ${body.phone}\n\n` +
            `📍 *Address:*\n${body.governorate} — ${body.city}\n${body.street}\n\n` +
            `🛍️ *Product:* ${body.product}\n` +
            `💰 *Budget:* ${body.budget} EGP\n\n` +
            `📝 *Notes:* ${body.notes || 'N/A'}`,
          parse_mode: 'Markdown',
        }),
      }
    )

    // ── 3️⃣ Google Sheet ──
    try {
      await fetch(
        'https://script.google.com/macros/s/AKfycbw_m5sS_5s9Us1vNA1MMeSobyMwg2NnJEJNcUCGa6Vlc-zOtdWeFXGCaCw1GgBDpEhDpg/exec',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...body, formType: 'product_request' }),
        }
      )
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