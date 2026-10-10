// src/lib/telegram.ts
// Sends a message to the admin's Telegram chat. Never throws: a failed notification must not break the request
// that triggered it. Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (see .env.local / Vercel env).

export function escapeTelegramHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function sendTelegramMessage(html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set, notification skipped')
    return false
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) {
      console.error('[telegram] sendMessage failed:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[telegram] sendMessage error:', err instanceof Error ? err.message : err)
    return false
  }
}
