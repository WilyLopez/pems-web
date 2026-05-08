import api from './api'
import { ApiResponse } from '@/types/api.types'

export interface Contrato {
  id: number
  idEventoPrivado: number
  estado: string
  archivoPdfUrl?: string
  fechaFirma?: string
  fechaCreacion: string
  fechaActualizacion: string
}

export const contratoService = {
  obtenerPorEvento: async (idEvento: number): Promise<Contrato> => {
    const { data } = await api.get<ApiResponse<Contrato>>(`/contratos/eventos/${idEvento}`)
    return data.data
  },

  generar: async (idEvento: number, contenidoTexto: string): Promise<Contrato> => {
    const { data } = await api.post<ApiResponse<Contrato>>(
      `/contratos/eventos/${idEvento}`,
      { contenidoTexto }
    )
    return data.data
  },

  firmar: async (idContrato: number): Promise<Contrato> => {
    const { data } = await api.post<ApiResponse<Contrato>>(`/contratos/${idContrato}/firmar`)
    return data.data
  },
}