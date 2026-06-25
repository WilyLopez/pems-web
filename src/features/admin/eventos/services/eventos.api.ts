import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  EventoPrivado,
  ChecklistItem,
  SolicitarEventoPayload,
  ConfirmarEventoPayload,
  RegistrarPagoCuotaPayload,
  ExtraPaquete,
  ServicioCotizacion,
  Turno,
} from '../types'

export interface BuscarEventosParams {
  page?: number
  size?: number
  idSede?: number
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
  tipoEvento?: string
  modalidadPago?: string
  search?: string
  sort?: string
}

export interface KpisEventos {
  solicitadas: number
  confirmadas: number
  completadasEsteMes: number
  conSaldoPendiente: number
}

export const eventosApi = {
  buscarAdmin: async (params: BuscarEventosParams): Promise<PagedResponse<EventoPrivado>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<EventoPrivado>>>(
      '/eventos-privados/admin',
      { params }
    )
    return data.data
  },

  kpis: async (idSede?: number): Promise<KpisEventos> => {
    const { data } = await api.get<ApiResponse<KpisEventos>>(
      '/eventos-privados/admin/kpis',
      { params: idSede ? { idSede } : undefined }
    )
    return data.data
  },

  obtener: async (id: number): Promise<EventoPrivado> => {
    const { data } = await api.get<ApiResponse<EventoPrivado>>(`/eventos-privados/${id}`)
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

  confirmar: async (id: number, payload: ConfirmarEventoPayload): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/confirmar`,
      {
        precioTotal: payload.precioTotal,
        montoAdelanto: payload.montoAdelanto,
        ...(payload.pagosAdelanto?.length
          ? { pagosAdelanto: payload.pagosAdelanto }
          : { medioPago: payload.medioPagoAdelanto }),
        modalidadPago: payload.modalidadPago ?? 'AL_CONTADO',
        numeroCuotas: payload.numeroCuotas,
        fechaLimitePago: payload.fechaLimitePago,
      }
    )
    return data.data
  },

  pagarCuota: async (
    idEvento: number,
    idCuota: number,
    payload: RegistrarPagoCuotaPayload
  ): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${idEvento}/cuotas/${idCuota}/pagar`,
      payload
    )
    return data.data
  },

  completar: async (id: number): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(`/eventos-privados/${id}/completar`)
    return data.data
  },

  registrarSaldo: async (
    id: number,
    monto: number,
    medioPago: string
  ): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/registrar-saldo`,
      { monto, medioPago }
    )
    return data.data
  },

  cancelar: async (id: number, motivo: string): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/cancelar`,
      { motivo }
    )
    return data.data
  },

  listarChecklist: async (idEvento: number): Promise<ChecklistItem[]> => {
    const { data } = await api.get<ApiResponse<ChecklistItem[]>>(
      `/eventos-privados/${idEvento}/checklist`
    )
    return data.data
  },

  completarTarea: async (idEvento: number, idChecklist: number): Promise<ChecklistItem> => {
    const { data } = await api.post<ApiResponse<ChecklistItem>>(
      `/eventos-privados/${idEvento}/checklist/${idChecklist}/completar`
    )
    return data.data
  },

  descompletarTarea: async (idEvento: number, idChecklist: number): Promise<ChecklistItem> => {
    const { data } = await api.post<ApiResponse<ChecklistItem>>(
      `/eventos-privados/${idEvento}/checklist/${idChecklist}/descompletar`
    )
    return data.data
  },

  agregarTarea: async (idEvento: number, tarea: string): Promise<ChecklistItem> => {
    const { data } = await api.post<ApiResponse<ChecklistItem>>(
      `/eventos-privados/${idEvento}/checklist`,
      { tarea }
    )
    return data.data
  },

  eliminarTarea: async (idEvento: number, idChecklist: number): Promise<void> => {
    await api.delete(`/eventos-privados/${idEvento}/checklist/${idChecklist}`)
  },

  listarExtrasPaquete: async (idPaquete: number): Promise<ExtraPaquete[]> => {
    const { data } = await api.get<ApiResponse<ExtraPaquete[]>>(`/paquetes/${idPaquete}/extras`)
    return data.data
  },

  listarTurnos: async (idSede: number): Promise<Turno[]> => {
    const { data } = await api.get<ApiResponse<Turno[]>>(`/calendario/sedes/${idSede}/turnos`)
    return data.data
  },

  listarServiciosCotizacion: async (): Promise<ServicioCotizacion[]> => {
    const { data } = await api.get<ApiResponse<ServicioCotizacion[]>>('/servicios-cotizacion')
    return data.data
  },
}
