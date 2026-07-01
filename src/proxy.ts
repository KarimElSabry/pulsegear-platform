import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin-login')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const secret = process.env.ADMIN_SECRET

    if (!secret) {
      console.error('ADMIN_SECRET is not set in .env.local!')
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    if (!token || token !== secret) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
}