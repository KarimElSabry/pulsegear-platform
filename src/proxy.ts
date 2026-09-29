// src/proxy.ts
// Runs before every matched request. Protects:
//   /admin/*        → redirect to /admin-login without a valid admin cookie
//   /api/*          → 401 JSON unless the route is in PUBLIC_API below
// Public routes still do their own checks (Supabase session, CRON_SECRET).

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'admin_token'

type PublicRule = { pattern: RegExp; methods?: string[] }

const PUBLIC_API: PublicRule[] = [
  { pattern: /^\/api\/products$/, methods: ['GET'] },
  { pattern: /^\/api\/products\/likes$/, methods: ['GET', 'POST'] },
  { pattern: /^\/api\/products\/[^/]+$/, methods: ['GET'] },
  { pattern: /^\/api\/products\/[^/]+\/images$/, methods: ['GET'] },
  { pattern: /^\/api\/products\/[^/]+\/reserve$/, methods: ['POST'] },
  { pattern: /^\/api\/submit$/, methods: ['POST'] },
  { pattern: /^\/api\/contact$/, methods: ['POST'] },
  { pattern: /^\/api\/discount\/validate$/, methods: ['POST'] },
  { pattern: /^\/api\/newsletter\/(subscribe|unsubscribe)$/, methods: ['POST'] },
  { pattern: /^\/api\/newsletter\/send-weekly$/ }, // checks CRON_SECRET itself
  { pattern: /^\/api\/check-vinted-status$/ }, // checks CRON_SECRET itself
  { pattern: /^\/api\/reservations\/release-expired$/ }, // checks CRON_SECRET itself
  { pattern: /^\/api\/admin-(login|logout)$/ },
  { pattern: /^\/api\/account\/profile$/ }, // checks the Supabase session itself
]

function isPublicApi(pathname: string, method: string): boolean {
  return PUBLIC_API.some(
    (rule) =>
      rule.pattern.test(pathname) &&
      (!rule.methods || rule.methods.includes(method) || method === 'OPTIONS')
  )
}

// Constant-time compare without Node's crypto so this file stays runtime-agnostic.
function safeEqual(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const isAdmin = safeEqual(token, process.env.ADMIN_SECRET)

  if (pathname.startsWith('/admin-login')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) {
    if (isAdmin || isPublicApi(pathname, method)) {
      return NextResponse.next()
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login', '/api/:path*'],
}
