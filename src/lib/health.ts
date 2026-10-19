// src/lib/health.ts
// Setup checks for Admin > Health. Reports only whether something is set and whether the service accepts it;
// secret values are never read back or shown.

export interface Check { name: string; state: 'ok' | 'warn' | 'bad'; detail: string }

const has = (v: string | undefined) => !!v && v.trim().length > 0

export function envChecks(env: Record<string, string | undefined> = process.env): Check[] {
  const need = (name: string, keys: string[], why: string, optional = false): Check => {
    const missing = keys.filter((k) => !has(env[k]))
    if (missing.length === 0) return { name, state: 'ok', detail: 'Set' }
    return { name, state: optional ? 'warn' : 'bad', detail: `Missing ${missing.join(', ')}. ${why}` }
  }
  return [
    need('Admin login', ['ADMIN_SECRET'], 'Admin pages cannot be protected without it.'),
    need('Scheduled jobs', ['CRON_SECRET'], 'Vercel cannot run the newsletter, Meta sync and reservation release without it.'),
    need('Database', ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'], 'The site cannot read or write data.'),
    need('Telegram alerts', ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'], 'You will not be told about new reservations, requests or failed jobs.'),
    need('Newsletter (Brevo)', ['BREVO_API_KEY', 'BREVO_NEWSLETTER_LIST_ID', 'BREVO_SENDER_EMAIL'], 'Newsletter and subscriber counts will not work.'),
    need('Meta ad spend', ['META_AD_ACCOUNT_ID', 'META_ACCESS_TOKEN'], 'Ad spend must then be typed in by hand.', true),
    need('Site address', ['NEXT_PUBLIC_SITE_URL'], 'Links in emails and share previews fall back to localhost.', true),
  ]
}

type FetchLike = (url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number }>

/** Asks Brevo whether the key is accepted. A 401 almost always means an SMTP key (xsmtpsib-) was used instead of an API key (xkeysib-). */
export async function checkBrevo(key: string | undefined, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<Check> {
  if (!has(key)) return { name: 'Brevo key accepted', state: 'bad', detail: 'No BREVO_API_KEY set.' }
  try {
    const res = await fetchImpl('https://api.brevo.com/v3/account', { headers: { 'api-key': key as string, accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(6000) })
    if (res.ok) return { name: 'Brevo key accepted', state: 'ok', detail: 'Brevo accepted the key.' }
    if (res.status === 401) return { name: 'Brevo key accepted', state: 'bad', detail: 'Brevo rejected the key (401). Use an API key from SMTP & API > API Keys (starts xkeysib-), not an SMTP key (xsmtpsib-).' }
    return { name: 'Brevo key accepted', state: 'warn', detail: `Brevo answered with status ${res.status}.` }
  } catch {
    return { name: 'Brevo key accepted', state: 'warn', detail: 'Could not reach Brevo just now.' }
  }
}

export async function checkTelegram(token: string | undefined, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<Check> {
  if (!has(token)) return { name: 'Telegram bot accepted', state: 'bad', detail: 'No TELEGRAM_BOT_TOKEN set.' }
  try {
    const res = await fetchImpl(`https://api.telegram.org/bot${token}/getMe`, { cache: 'no-store', signal: AbortSignal.timeout(6000) })
    if (res.ok) return { name: 'Telegram bot accepted', state: 'ok', detail: 'Telegram accepted the bot token.' }
    return { name: 'Telegram bot accepted', state: 'bad', detail: `Telegram rejected the bot token (status ${res.status}).` }
  } catch {
    return { name: 'Telegram bot accepted', state: 'warn', detail: 'Could not reach Telegram just now.' }
  }
}
