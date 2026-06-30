import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { COOKIE_TIPO_PERFIL } from '@/lib/auth-utils'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const { user, supabaseResponse } = await updateSession(request)

  const isAuthRoute = pathname.startsWith('/auth')
  const isAdminRoute = pathname.startsWith('/admin')
  const isClienteRoute = pathname.startsWith('/cliente')
  const isProtected = isAdminRoute || isClienteRoute

  if (isProtected && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && user && !pathname.startsWith('/auth/callback')) {
    const tipoPerfil = request.cookies.get(COOKIE_TIPO_PERFIL)?.value
    if (tipoPerfil === 'STAFF') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (tipoPerfil === 'CLIENTE') {
      return NextResponse.redirect(new URL('/cliente', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
