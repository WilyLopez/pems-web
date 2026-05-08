import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { TipoComprobante } from '@/types/enums'

export interface Comprobante {
  id: number
  numeroCompleto: string
  tipoComprobante: string
  estadoComprobante: string
  razonSocialReceptor?: string
  nroDocReceptor?: string
  montoBase: number
  montoIgv: number
  montoTotal: number
  pdfUrl?: string
  cdrEstado?: string
  fechaEmision: string
}

export interface EmitirComprobantePayload {
  idPago: number
  tipoComprobante: TipoComprobante
  tipoDocReceptor: string
  nroDocReceptor?: string
  razonSocialReceptor?: string
  direccionReceptor?: string
}

export const comprobanteService = {
  emitir: async (idSede: number, payload: EmitirComprobantePayload): Promise<Comprobante> => {
    const { data } = await api.post<ApiResponse<Comprobante>>(
      `/comprobantes/sedes/${idSede}`, payload
    )
    return data.data
  },

  anular: async (id: number, motivo: string): Promise<Comprobante> => {
    const { data } = await api.post<ApiResponse<Comprobante>>(
      `/comprobantes/${id}/anular?motivo=${encodeURIComponent(motivo)}`
    )
    return data.data
  },
}