import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  ImagenGaleria,
  ActualizarImagenGaleriaPayload,
  SubirImagenPayload,
} from '@/types/galeria.types'
import { CATEGORIA_POR_DEFECTO } from '@/features/admin/cms/galeria/constants/categorias'

async function postGaleria(
  payload: SubirImagenPayload
): Promise<ImagenGaleria> {
  const form = new FormData()
  form.append('archivo', payload.archivo)
  form.append('categoria', payload.categoria)
  if (payload.titulo) form.append('titulo', payload.titulo)
  if (payload.descripcion) form.append('descripcion', payload.descripcion)
  if (payload.altTexto) form.append('altTexto', payload.altTexto)
  if (payload.orden != null) form.append('orden', String(payload.orden))
  const { data } = await api.post<ApiResponse<ImagenGaleria>>(
    '/galeria',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return data.data
}

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

  subir: (
    archivo: File,
    titulo?: string,
    descripcion?: string
  ): Promise<ImagenGaleria> =>
    postGaleria({
      archivo,
      categoria: CATEGORIA_POR_DEFECTO,
      titulo,
      descripcion,
    }),

  subirImagen: (payload: SubirImagenPayload): Promise<ImagenGaleria> =>
    postGaleria(payload),

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
