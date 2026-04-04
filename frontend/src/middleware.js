import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // if user has token and tries to visit auth pages → redirect to dashboard
  // but allow reset-password since it's a public flow
  if (token && pathname.startsWith('/auth') && !pathname.startsWith('/auth/reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // if user has no token and tries to visit dashboard → redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/auth/:path*']
}
