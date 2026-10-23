// src/app/api/cron/reprice/route.ts
// Weekly job (Mondays, see vercel.json). Works out EUR-based price changes. With auto-apply OFF (the default) it only tells you
// on Telegram that changes are waiting on Admin > Pricing. Also callable by a logged-in admin.

import { withJobLog } from '@/lib/jobs'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminToken, isCronAuthorized, ADMIN_COOKIE } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'
import { runDaily } from '@/lib/pricing-service'

export const dynamic = 'force-dynamic'

async function run(req: NextRequest) {
  if (!isCronAuthorized(req) && !isAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const summary = await runDaily(createAdminSupabaseClient(), { notify: sendTelegramMessage })
  if (summary.changed) {
    for (const path of ['/', '/products', '/deals', '/admin/pricing']) revalidatePath(path)
    revalidatePath('/products/[slug]', 'page')
  }
  return NextResponse.json(summary, { status: summary.ok ? 200 : 502 })
}

export const GET = withJobLog('reprice', run)
