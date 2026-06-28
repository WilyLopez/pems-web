import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { createClient } from '@/lib/supabase/client'
import { ApiError } from '@/types/api.types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.codigoError === 'password_change_required'
    ) {
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/auth/cambiar-contrasena')
      ) {
        window.location.href = '/auth/cambiar-contrasena'
      }
    }

    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isAuthRoute = requestUrl.includes('/auth/')

      if (!isAuthRoute) {
        const supabase = createClient()
        await supabase.auth.signOut()
        const { useSesionStore } = await import('@/lib/store/sesion.store')
        useSesionStore.getState().setModalExpirada(true)
      }
    }

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
)

export default api
