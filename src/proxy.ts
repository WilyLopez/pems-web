import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { COOKIE_TIPO_PERFIL } from '@/lib/auth-utils'

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request)
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams
  const tipoPerfil = request.cookies.get(COOKIE_TIPO_PERFIL)?.value

  if (pathname.startsWith('/auth')) {
    if (user && tipoPerfil && !searchParams.has('redirect')) {
      const dashboardUrl = tipoPerfil === 'STAFF' ? '/admin/dashboard' : '/cliente'
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
    return supabaseResponse
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/cliente')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin') && tipoPerfil !== 'STAFF') {
      return NextResponse.redirect(new URL('/cliente', request.url))
    }

    if (pathname.startsWith('/cliente') && tipoPerfil !== 'CLIENTE') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/cliente/:path*', '/auth/:path*'],
}
