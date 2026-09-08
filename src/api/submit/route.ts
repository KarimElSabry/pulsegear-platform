// src/app/api/submit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================
// 📨 SEND TELEGRAM
// ============================
async function sendTelegram(message: string) {
  const token  = process.env.TELEGRAM_BOT_NOTIFIER_TOKEN  // ✅ الاسم الصح
  const chatId = process.env.TELEGRAM_NOTIFIER_CHAT_ID    // ✅ الاسم الصح

  console.log('TOKEN exists:', !!token)
  console.log('CHAT_ID:', chatId)

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id:    chatId,
          text:       message,
          parse_mode: "Markdown",
        }),
      }
    )
    const data = await res.json()
    console.log('Telegram response:', JSON.stringify(data))
  } catch (err) {
    console.error("Telegram error:", err)
  }
}

// ============================
// 📬 POST HANDLER
// ============================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name, email, phone,
      governorate, city, street,
      product, budget, notes,
    } = body

    if (!name || !email || !phone || !product || !budget) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ── 1️⃣ Insert into Supabase ──
    const { error } = await supabase.from('product_requests').insert([{
      customer_name:     name,
      email,
      phone,
      governorate,
      city,
      street,
      requested_product: product,
      budget:            Number(budget),
      notes,
      status:            'new',
      created_at:        new Date().toISOString(),
    }])

    if (error) {
      console.error('Supabase error:', error.message)
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    // ── 2️⃣ Send Telegram ──
    await sendTelegram(
      `📦 *New Product Request!*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `📞 *Phone:* ${phone}\n\n` +
      `📍 *Address:*\n${governorate} — ${city}\n${street}\n\n` +
      `🛍️ *Product:* ${product}\n` +
      `💰 *Budget:* ${budget} EGP\n\n` +
      `📝 *Notes:* ${notes || 'N/A'}`
    )

    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { status: 'error', message: 'Unexpected server error' },
      { status: 500 }
    )
  }
}