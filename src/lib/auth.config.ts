import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { LoginCredentials, TokenResponse } from '@/types/auth.types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

async function loginRequest(
  endpoint: string,
  credentials: LoginCredentials
): Promise<TokenResponse> {
  const url = `${API_BASE}/${endpoint}`
  let res: Response

  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    })
  } catch (networkErr) {
    console.error(`[Auth] Network error calling ${url}:`, networkErr)
    throw new Error('No se pudo conectar con el servidor. Intenta nuevamente.')
  }

  if (!res.ok) {
    let message = 'Credenciales incorrectas'
    try {
      const error = await res.json()
      message = error.message ?? message
    } catch {}
    throw new Error(message)
  }

  const json = await res.json()
  if (!json?.data) {
    console.error('[Auth] Unexpected response shape:', json)
    throw new Error('Respuesta inesperada del servidor.')
  }
  return json.data as TokenResponse
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'cliente',
      name: 'Cliente',
      credentials: {
        correo: { label: 'Correo', type: 'email' },
        contrasena: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) return null
        try {
          const data = await loginRequest('auth/cliente/login', {
            correo: credentials.correo,
            contrasena: credentials.contrasena,
          })
          return {
            id: String(data.idUsuario),
            name: data.nombre,
            email: credentials.correo,
            token: data.token,
            rol: data.rol,
            idSede: data.idSede,
          }
        } catch (err) {
          console.error('[Auth] Cliente authorize failed:', err)
          throw err
        }
      },
    }),
    CredentialsProvider({
      id: 'admin',
      name: 'Admin',
      credentials: {
        correo: { label: 'Correo', type: 'email' },
        contrasena: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) return null
        try {
          const data = await loginRequest('auth/admin/login', {
            correo: credentials.correo,
            contrasena: credentials.contrasena,
          })
          return {
            id: String(data.idUsuario),
            name: data.nombre,
            email: credentials.correo,
            token: data.token,
            rol: data.rol,
            idSede: data.idSede,
          }
        } catch (err) {
          console.error('[Auth] Admin authorize failed:', err)
          throw err
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.token = (user as { token: string }).token
        token.rol = (user as { rol: string }).rol
        token.idSede = (user as { idSede?: number }).idSede
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.token = token.token as string
      session.user.rol = token.rol as string
      session.user.idSede = token.idSede as number | undefined
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  secret: process.env.NEXTAUTH_SECRET || 'secret-fallback-123456',
}
