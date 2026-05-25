import api from './api'
import { ApiResponse } from '@/types/api.types'

export type CarpetaMedia =
  | 'banners'
  | 'galeria'
  | 'logos'
  | 'paquetes'
  | 'zonas'
  | 'actividades'
  | 'novedades'
  | 'resenas'
  | 'legal'
  | 'perfiles'

export interface MediaResponse {
  url: string
  nombreArchivo: string
  tamanobytes: number
  tipoMime: string
  fechaSubida: string
}

function resolverUrl(url: string): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? ''
  const serverOrigin = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '')
  return `${serverOrigin}${url.startsWith('/') ? '' : '/'}${url}`
}

export const mediaService = {
  upload: async (archivo: File, carpeta: CarpetaMedia): Promise<MediaResponse> => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', carpeta)
    const { data } = await api.post<ApiResponse<MediaResponse>>(
      '/media/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return { ...data.data, url: resolverUrl(data.data.url) }
  },

  eliminar: async (rutaRelativa: string): Promise<void> => {
    await api.delete('/media', { params: { rutaRelativa } })
  },
}
