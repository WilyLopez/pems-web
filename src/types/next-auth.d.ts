import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      token: string
      refreshToken: string
      rol: string
      idSede?: number
    }
    error?: 'RefreshTokenExpired'
  }

  interface User {
    token: string
    refreshToken: string
    accessExpiresIn: number
    rol: string
    idSede?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    token: string
    refreshToken: string
    accessExpires: number
    rol: string
    idSede?: number
    error?: 'RefreshTokenExpired'
  }
}
