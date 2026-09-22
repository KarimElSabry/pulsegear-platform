// src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname, origin } = request.nextUrl

  if (pathname.startsWith('/admin-login')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const secret = process.env.ADMIN_SECRET

    if (!secret) {
      console.error('ADMIN_SECRET is not set in environment')
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    if (!token || token !== secret) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  if (pathname.startsWith('/account')) {
    const hasSupabaseAuthCookies =
      request.cookies.get('sb-access-token') ||
      request.cookies.get('sb-refresh-token') ||
      [...request.cookies.getAll()].some((cookie) => cookie.name.startsWith('sb-'))

    if (!hasSupabaseAuthCookies) {
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login', '/account/:path*'],
}