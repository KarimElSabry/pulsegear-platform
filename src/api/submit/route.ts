// src/app/api/submit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_m5sS_5s9Us1vNA1MMeSobyMwg2NnJEJNcUCGa6Vlc-zOtdWeFXGCaCw1GgBDpEhDpg/exec"

// ============================
// 📨 SEND TELEGRAM
// ============================
async function sendTelegram(message: string) {
  try {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    )
  } catch (err) {
    console.error("Telegram error:", err)
  }
}

// ============================
// 📊 SEND TO GOOGLE SHEET
// ============================
async function sendToGoogleSheet(data: {
  name: string
  email: string
  phone: string
  governorate: string
  city: string
  street: string
  product: string
  budget: string
  notes: string
}) {
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: "product",
        ...data,
      }),
    })
  } catch (err) {
    console.error("Google Sheet error:", err)
  }
}

// ============================
// 📬 POST HANDLER
// ============================
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

    // ── 1️⃣ Insert into Supabase ──────────────────────────────────
    const { error } = await supabase.from('product_requests').insert([
      {
        customer_name: name,
        email,
        phone,
        governorate,
        city,
        street,
        requested_product: product,
        budget: Number(budget),
        notes,
        status: 'new',
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

    // ── 2️⃣ Send Telegram Notification ────────────────────────────
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

    // ── 3️⃣ Send to Google Sheet ──────────────────────────────────
    await sendToGoogleSheet({
      name,
      email,
      phone,
      governorate,
      city,
      street,
      product,
      budget,
      notes,
    })

    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { status: 'error', message: 'Unexpected server error' },
      { status: 500 }
    )
  }
}