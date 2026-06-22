import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  EventoPrivado,
  ChecklistItem,
  SolicitarEventoPayload,
  ConfirmarEventoPayload,
  ExtraPaquete,
  ServicioCotizacion,
  Turno,
} from '@/types/evento.types'

export interface BuscarEventosParams {
  page?: number
  size?: number
  idSede?: number
  estado?: string
  fecha?: string
  search?: string
  sort?: string
}

export const eventoService = {
  listar: async (params: {
    page?: number
    size?: number
    estado?: string
    idSede?: number
  }): Promise<PagedResponse<EventoPrivado>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<EventoPrivado>>>(
      '/eventos-privados',
      { params }
    )
    return data.data
  },

  buscarAdmin: async (
    params: BuscarEventosParams
  ): Promise<PagedResponse<EventoPrivado>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<EventoPrivado>>>(
      '/eventos-privados/admin',
      { params }
    )
    return data.data
  },

  obtener: async (id: number): Promise<EventoPrivado> => {
    const { data } = await api.get<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}`
    )
    return data.data
  },

  solicitar: async (
    idCliente: number,
    idSede: number,
    payload: SolicitarEventoPayload
  ): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/clientes/${idCliente}/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  confirmar: async (
    id: number,
    payload: ConfirmarEventoPayload
  ): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/confirmar`,
      payload
    )
    return data.data
  },

  completar: async (id: number): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/completar`
    )
    return data.data
  },

  registrarSaldo: async (
    id: number,
    monto: number,
    medioPago: string
  ): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/registrar-saldo`,
      null,
      { params: { monto, medioPago } }
    )
    return data.data
  },

  cancelar: async (id: number, motivo: string): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/cancelar?motivoCancelacion=${encodeURIComponent(motivo)}`
    )
    return data.data
  },

  listarChecklist: async (idEvento: number): Promise<ChecklistItem[]> => {
    const { data } = await api.get<ApiResponse<ChecklistItem[]>>(
      `/eventos-privados/${idEvento}/checklist`
    )
    return data.data
  },

  completarTarea: async (
    idEvento: number,
    idChecklist: number
  ): Promise<ChecklistItem> => {
    const { data } = await api.post<ApiResponse<ChecklistItem>>(
      `/eventos-privados/${idEvento}/checklist/${idChecklist}/completar`
    )
    return data.data
  },

  descompletarTarea: async (
    idEvento: number,
    idChecklist: number
  ): Promise<ChecklistItem> => {
    const { data } = await api.post<ApiResponse<ChecklistItem>>(
      `/eventos-privados/${idEvento}/checklist/${idChecklist}/descompletar`
    )
    return data.data
  },

  listarExtrasPaquete: async (idPaquete: number): Promise<ExtraPaquete[]> => {
    const { data } = await api.get<ApiResponse<ExtraPaquete[]>>(
      `/paquetes/${idPaquete}/extras`
    )
    return data.data
  },

  listarTurnos: async (idSede: number): Promise<Turno[]> => {
    const { data } = await api.get<ApiResponse<Turno[]>>(
      `/calendario/sedes/${idSede}/turnos`
    )
    return data.data
  },

  listarServiciosCotizacion: async (): Promise<ServicioCotizacion[]> => {
    const { data } = await api.get<ApiResponse<ServicioCotizacion[]>>(
      '/servicios-cotizacion'
    )
    return data.data
  },
}
