export type Role = 'ADMIN' | 'CLIENTE'

export interface AuthUser {
  id: number
  nombre: string
  correo: string
  rol: Role
  idSede?: number
  token: string
}

export interface LoginCredentials {
  correo: string
  contrasena: string
}

export interface TokenResponse {
  token: string
  refreshToken: string
  accessExpiresIn: number
  idUsuario: number
  nombre: string
  rol: Role
  idSede?: number
}
