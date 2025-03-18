import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')

    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }

      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    if (isAuthRoute && token) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/signin'
    }
  }
)

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*']
} 