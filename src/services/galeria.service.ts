import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  ImagenGaleria,
  ActualizarImagenGaleriaPayload,
} from '@/types/galeria.types'

export const galeriaService = {
  listar: async (
    page = 0,
    size = 20,
    soloDestacadas = false
  ): Promise<PagedResponse<ImagenGaleria>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<ImagenGaleria>>>(
      '/galeria',
      {
        params: { page, size, soloDestacadas },
      }
    )
    return data.data
  },

  subir: async (
    archivo: File,
    titulo?: string,
    descripcion?: string
  ): Promise<ImagenGaleria> => {
    const form = new FormData()
    form.append('archivo', archivo)
    if (titulo) form.append('titulo', titulo)
    if (descripcion) form.append('descripcion', descripcion)
    const { data } = await api.post<ApiResponse<ImagenGaleria>>(
      '/galeria',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return data.data
  },

  actualizar: async (
    id: number,
    payload: ActualizarImagenGaleriaPayload
  ): Promise<ImagenGaleria> => {
    const { data } = await api.put<ApiResponse<ImagenGaleria>>(
      `/galeria/${id}`,
      payload
    )
    return data.data
  },

  destacar: async (id: number): Promise<void> => {
    await api.patch(`/galeria/${id}/destacar`)
  },

  quitarDestacado: async (id: number): Promise<void> => {
    await api.patch(`/galeria/${id}/quitar-destacado`)
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/galeria/${id}`)
  },
}
