import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { Faq, CrearFaqPayload, ActualizarFaqPayload } from '@/types/faq.types'

export const faqService = {
  listarPublico: async (): Promise<Faq[]> => {
    const { data } =
      await api.get<ApiResponse<Faq[] | PagedResponse<Faq>>>(
        '/cms/faqs/publico'
      )
    if (Array.isArray(data.data)) return data.data
    return data.data?.content || []
  },

  listarAdmin: async (): Promise<Faq[]> => {
    const { data } =
      await api.get<ApiResponse<Faq[] | PagedResponse<Faq>>>('/cms/faqs')
    if (Array.isArray(data.data)) return data.data
    return data.data?.content || []
  },

  crear: async (payload: CrearFaqPayload): Promise<Faq> => {
    const { data } = await api.post<ApiResponse<Faq>>('/cms/faqs', payload)
    return data.data
  },

  actualizar: async (
    id: number,
    payload: ActualizarFaqPayload
  ): Promise<Faq> => {
    const { data } = await api.put<ApiResponse<Faq>>(`/cms/faqs/${id}`, payload)
    return data.data
  },

  activar: async (id: number): Promise<void> => {
    await api.patch(`/cms/faqs/${id}/activar`)
  },

  desactivar: async (id: number): Promise<void> => {
    await api.patch(`/cms/faqs/${id}/desactivar`)
  },

  reordenar: async (ids: number[]): Promise<void> => {
    await api.put('/cms/faqs/reordenar', { ids })
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/cms/faqs/${id}`)
  },
}
