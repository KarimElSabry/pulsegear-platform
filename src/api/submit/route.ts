import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_NOTIFIER_TOKEN!
const TELEGRAM_CHAT  = process.env.TELEGRAM_NOTIFIER_CHAT_ID!

async function sendTelegram(message: string) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    TELEGRAM_CHAT,
        text:       message,
        parse_mode: 'Markdown',
      }),
    }
  )
  const data = await res.json()
  console.log('Telegram:', JSON.stringify(data))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, governorate, city, street, product, budget, notes } = body

    if (!name || !email || !phone || !product || !budget) {
      return NextResponse.json({ status: 'error', message: 'Missing required fields' }, { status: 400 })
    }

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
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

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
    return NextResponse.json({ status: 'error', message: 'Unexpected server error' }, { status: 500 })
  }
}