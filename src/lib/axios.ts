import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getSession, signOut } from 'next-auth/react'
import { ApiError } from '@/types/api.types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: '/auth/login' })
      return Promise.reject(error)
    }

    const apiError: ApiError = error.response?.data ?? {
      status: 500,
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
