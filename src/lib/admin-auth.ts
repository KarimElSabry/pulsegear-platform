// src/lib/admin-auth.ts
// Single source of truth for admin authorisation.
// - requireAdmin(req)  → use at the top of every admin API route handler
// - assertAdmin()      → use as the first line of every admin server action
// Never import this file from a "use client" component.

import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const ADMIN_COOKIE = 'admin_token'

/** Constant-time string comparison. Returns false when either side is empty. */
export function safeEqual(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function isAdminToken(token?: string | null): boolean {
  return safeEqual(token, process.env.ADMIN_SECRET)
}

/**
 * For route handlers. Returns a 401 response when the caller is not admin,
 * or null when the request may proceed:
 *
 *   const denied = requireAdmin(req); if (denied) return denied
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (isAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** For server actions and server components. Throws when not admin. */
export async function assertAdmin(): Promise<void> {
  const store = await cookies()
  if (!isAdminToken(store.get(ADMIN_COOKIE)?.value)) {
    throw new Error('UNAUTHORIZED')
  }
}

/** For cron routes: Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically. */
export function isCronAuthorized(req: Request): boolean {
  const header = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return safeEqual(header, `Bearer ${secret}`)
}
