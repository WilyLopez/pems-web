export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: {
    id: string
    email: string
  }
  debeCambiarPassword?: boolean
}

export interface CambiarPasswordPayload {
  passwordActual: string
  nuevoPassword: string
}
