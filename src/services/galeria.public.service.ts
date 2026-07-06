import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { ImagenGaleria } from '@/types/galeria.types'

export const galeriaPublicaService = {
  listar: async (
    size = 12,
    soloDestacadas = false
  ): Promise<ImagenGaleria[]> => {
    const { data } = await api.get<ApiResponse<PagedResponse<ImagenGaleria>>>(
      '/galeria',
      {
        params: { page: 0, size, soloDestacadas },
      }
    )
    return data.data.content
  },
}
