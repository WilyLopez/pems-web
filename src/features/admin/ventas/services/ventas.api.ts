import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import {
  PrecioDia,
  RegistrarVentaMostradorPayload,
  VentaMostradorResponse,
  VentaFiltros,
  VentaResumen,
  VentaDetalleResponse,
  PagoLinea,
} from '../types'
import { PageableResponse } from '@/features/admin/reservas/types'
import { downloadFile } from '@/utils/download.utils'

export interface CobrarReservaPayload {
  pagos: PagoLinea[]
  efectivoRecibido?: number
  actaFirmada: boolean
  notas?: string
}

export const ventasApi = {
  precioDia: async (idSede: number, fecha: string): Promise<PrecioDia> => {
    const { data } = await api.get<ApiResponse<PrecioDia>>(
      `/tarifas/sedes/${idSede}`,
      { params: { fecha } }
    )
    return data.data
  },

  registrarMostrador: async (
    payload: RegistrarVentaMostradorPayload
  ): Promise<VentaMostradorResponse> => {
    const { data } = await api.post<ApiResponse<VentaMostradorResponse>>(
      '/ventas-mostrador',
      payload
    )
    return data.data
  },

  listar: async (filtros: VentaFiltros): Promise<PageableResponse<VentaResumen>> => {
    if (!filtros.idSede) throw new Error('ID Sede es requerido para listar ventas')
    
    const params = new URLSearchParams()
    if (filtros.desde) params.append('desde', filtros.desde)
    if (filtros.hasta) params.append('hasta', filtros.hasta)
    if (filtros.search) params.append('search', filtros.search)
    if (filtros.page !== undefined) params.append('page', filtros.page.toString())
    if (filtros.size !== undefined) params.append('size', filtros.size.toString())
    
    const { data } = await api.get<ApiResponse<PageableResponse<VentaResumen>>>(
      `/ventas/sedes/${filtros.idSede}?${params.toString()}`
    )
    return data.data
  },

  obtener: async (id: number): Promise<VentaResumen> => {
    const { data } = await api.get<ApiResponse<VentaResumen>>(`/ventas/${id}`)
    return data.data
  },

  obtenerDetalle: async (id: number): Promise<VentaDetalleResponse> => {
    const { data } = await api.get<ApiResponse<VentaDetalleResponse>>(`/ventas/${id}/detalle`)
    return data.data
  },

  cobrarReserva: async (reservaId: number, payload: CobrarReservaPayload): Promise<VentaResumen> => {
    const { data } = await api.post<ApiResponse<VentaResumen>>(
      `/ventas/reserva/${reservaId}/cobrar`,
      payload
    )
    return data.data
  },

  descargarNotaVenta: async (idVenta: number) => {
    return downloadFile(`/ventas/${idVenta}/nota-venta`, `nota-venta-${idVenta}.pdf`)
  },

  enviarCorreo: async (idVenta: number, correo?: string): Promise<void> => {
    const params = new URLSearchParams()
    if (correo) params.append('correo', correo)
    await api.post(`/ventas/${idVenta}/enviar-correo?${params.toString()}`)
  },

  marcarImpreso: async (idVenta: number): Promise<void> => {
    await api.post(`/ventas/${idVenta}/marcar-impreso`)
  },

  marcarDescargado: async (idVenta: number): Promise<void> => {
    await api.post(`/ventas/${idVenta}/marcar-descargado`)
  },

  descargarTicket: async (idReserva: number) => {
    return downloadFile(`/reservas/${idReserva}/ticket`, `ticket-${idReserva}.pdf`)
  },
}
