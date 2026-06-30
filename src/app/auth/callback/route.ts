import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieMethodsServer } from '@supabase/ssr'
import {
  COOKIE_TIPO_PERFIL,
  COOKIE_MAX_AGE,
  getDashboardUrl,
} from '@/lib/auth-utils'

function getRedirectUrl(
  tipoPerfil: string,
  roles: string[],
  perfilCompleto: boolean,
  next: string | null
): string {
  if (next) {
    if (tipoPerfil === 'STAFF' && next.startsWith('/admin')) return next
    if (tipoPerfil === 'CLIENTE' && next.startsWith('/cliente')) return next
  }

  if (tipoPerfil === 'NINGUNO') return '/auth/completar-perfil'

  if (tipoPerfil === 'CLIENTE' && !perfilCompleto)
    return '/auth/completar-perfil'

  return getDashboardUrl(roles, tipoPerfil)
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  const captured: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            captured.push({ name, value, options: options as Record<string, unknown> })
          )
        },
      } as CookieMethodsServer,
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  function withCookies(response: NextResponse): NextResponse {
    captured.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    )
    return response
  }

  if (type === 'recovery') {
    return withCookies(NextResponse.redirect(`${origin}/auth/nueva-contrasena`))
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_session`)
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const res = await fetch(`${apiUrl}/health/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (!res.ok) {
      const response = withCookies(
        NextResponse.redirect(`${origin}/auth/completar-perfil`)
      )
      response.cookies.set(COOKIE_TIPO_PERFIL, 'CLIENTE', {
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
      return response
    }

    const meData = await res.json()
    const { tipoPerfil, roles, perfilCompleto } = meData.data

    const destino = getRedirectUrl(tipoPerfil, roles, perfilCompleto, next)
    const response = withCookies(NextResponse.redirect(`${origin}${destino}`))
    response.cookies.set(COOKIE_TIPO_PERFIL, tipoPerfil, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    })
    return response
  } catch {
    return NextResponse.redirect(`${origin}/auth/login?error=backend_error`)
  }
}
