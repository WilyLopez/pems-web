import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/admin') && token?.rol !== 'ADMIN') {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', req.url)
      )
    }

    if (pathname.startsWith('/cliente') && token?.rol !== 'CLIENTE') {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', req.url)
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isProtected =
          pathname.startsWith('/admin') || pathname.startsWith('/cliente')
        if (isProtected) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/cliente/:path*'],
}
