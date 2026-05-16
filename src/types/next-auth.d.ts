import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      token: string
      rol: string
      idSede?: number
    }
  }

  interface User {
    token: string
    rol: string
    idSede?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    token: string
    rol: string
    idSede?: number
  }
}
