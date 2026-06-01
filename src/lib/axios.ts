import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getSession } from 'next-auth/react'
import { ApiError } from '@/types/api.types'
import { useSesionStore } from '@/lib/store/sesion.store'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Mutex: evita múltiples solicitudes de refresh simultáneas ────────────────
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: ApiError) => void
}> = []

const SESSION_EXPIRED_ERROR: ApiError = {
  status: 401,
  error: 'Sesión expirada',
  codigoError: 'SESSION_EXPIRED',
  message: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
  path: '',
  timestamp: '',
}

function makeSessionExpiredError(): ApiError {
  return { ...SESSION_EXPIRED_ERROR, timestamp: new Date().toISOString() }
}

function drainQueue(token: string | null, error: ApiError | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token !== null) resolve(token)
    else reject(error!)
  })
  pendingQueue = []
}

function expireSession(): Promise<never> {
  isRefreshing = false
  const err = makeSessionExpiredError()
  drainQueue(null, err)
  useSesionStore.getState().setModalExpirada(true)
  return Promise.reject(err)
}

// ── Request: inyectar access token ───────────────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession()
    if (session?.user?.token) {
      config.headers.Authorization = `Bearer ${session.user.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response: manejar 401 con un único intento de refresh ────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // No es 401, o ya reintentamos: rechazar con estructura ApiError normalizada
    if (error.response?.status !== 401 || original._retry) {
      const apiError: ApiError = error.response?.data ?? {
        status: error.response?.status ?? 500,
        error: 'Error de red',
        codigoError: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor.',
        path: '',
        timestamp: new Date().toISOString(),
      }
      return Promise.reject(apiError)
    }

    original._retry = true

    // Otro refresh ya está en vuelo: encolar y esperar su resultado
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    isRefreshing = true

    let session: Awaited<ReturnType<typeof getSession>>
    try {
      session = await getSession()
    } catch {
      return expireSession()
    }

    if (session?.error === 'RefreshTokenExpired' || !session?.user?.token) {
      return expireSession()
    }

    // Refresh exitoso: vaciar cola con el nuevo token y reintentar
    isRefreshing = false
    const newToken = session.user.token
    drainQueue(newToken, null)
    original.headers.Authorization = `Bearer ${newToken}`
    return api(original)
  }
)

export default api
