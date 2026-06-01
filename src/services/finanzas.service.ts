import api from './api'
import {
  ActualizarEgresoPayload,
  ActualizarGastoOperativoPayload,
  AbrirCajaPayload,
  AperturaCaja,
  CerrarCajaPayload,
  CrearTipoEgresoPayload,
  CrearTipoIngresoPayload,
  DashboardFinanciero,
  EjecutarPresupuestoPayload,
  GastoEvento,
  GastoOperativo,
  GuardarPresupuestoPayload,
  MetricasReservas,
  MovimientoCaja,
  PresupuestoEvento,
  RegistrarEgresoPayload,
  RegistrarGastoEventoPayload,
  RegistrarGastoOperativoPayload,
  RegistrarIngresoManualPayload,
  RegistrarMovimientoManualPayload,
  RegistroEgreso,
  RegistroIngreso,
  ResumenDiario,
  ResumenEventoFinanciero,
  ResumenFinanciero,
  ResumenRango,
  TipoEgreso,
  TipoIngreso,
} from '@/types/finanzas.types'
import { ApiResponse, PagedResponse } from '@/types/api.types'

export const finanzasService = {
  listarTiposEgreso: async (): Promise<TipoEgreso[]> => {
    const { data } = await api.get<ApiResponse<TipoEgreso[]>>('/tipos-egreso')
    return data.data
  },

  listarTiposEgresoPorCategoria: async (cat: string): Promise<TipoEgreso[]> => {
    const { data } = await api.get<ApiResponse<TipoEgreso[]>>(`/tipos-egreso/categoria/${cat}`)
    return data.data
  },

  crearTipoEgreso: async (payload: CrearTipoEgresoPayload): Promise<TipoEgreso> => {
    const { data } = await api.post<ApiResponse<TipoEgreso>>('/tipos-egreso', payload)
    return data.data
  },

  desactivarTipoEgreso: async (id: number): Promise<void> => {
    await api.delete(`/tipos-egreso/${id}`)
  },

  listarEgresos: async (
    idSede: number,
    page = 0,
    size = 20
  ): Promise<PagedResponse<RegistroEgreso>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<RegistroEgreso>>>(
      `/egresos/sedes/${idSede}`,
      { params: { page, size } }
    )
    return data.data
  },

  listarEgresosPorPeriodo: async (
    idSede: number,
    anio: number,
    mes: number
  ): Promise<RegistroEgreso[]> => {
    const { data } = await api.get<ApiResponse<RegistroEgreso[]>>(
      `/egresos/sedes/${idSede}/periodo`,
      { params: { anio, mes } }
    )
    return data.data
  },

  registrarEgreso: async (
    idSede: number,
    payload: RegistrarEgresoPayload
  ): Promise<RegistroEgreso> => {
    const { data } = await api.post<ApiResponse<RegistroEgreso>>(
      `/egresos/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  listarEgresosPorRango: async (
    idSede: number,
    inicio: string,
    fin: string
  ): Promise<RegistroEgreso[]> => {
    const { data } = await api.get<ApiResponse<RegistroEgreso[]>>(
      `/egresos/sedes/${idSede}/rango`,
      { params: { inicio, fin } }
    )
    return data.data
  },

  actualizarEgreso: async (id: number, payload: ActualizarEgresoPayload): Promise<RegistroEgreso> => {
    const { data } = await api.put<ApiResponse<RegistroEgreso>>(`/egresos/${id}`, payload)
    return data.data
  },

  eliminarEgreso: async (id: number): Promise<void> => {
    await api.delete(`/egresos/${id}`)
  },

  listarGastosEvento: async (idEvento: number): Promise<GastoEvento[]> => {
    const { data } = await api.get<ApiResponse<GastoEvento[]>>(
      `/eventos-privados/${idEvento}/gastos`
    )
    return data.data
  },

  registrarGastoEvento: async (
    idEvento: number,
    payload: RegistrarGastoEventoPayload
  ): Promise<GastoEvento> => {
    const { data } = await api.post<ApiResponse<GastoEvento>>(
      `/eventos-privados/${idEvento}/gastos`,
      payload
    )
    return data.data
  },

  eliminarGastoEvento: async (idEvento: number, idGasto: number): Promise<void> => {
    await api.delete(`/eventos-privados/${idEvento}/gastos/${idGasto}`)
  },

  listarGastosOperativos: async (
    idSede: number,
    fecha: string
  ): Promise<GastoOperativo[]> => {
    const { data } = await api.get<ApiResponse<GastoOperativo[]>>(
      `/gastos-operativos/sedes/${idSede}/fecha`,
      { params: { fecha } }
    )
    return data.data
  },

  registrarGastoOperativo: async (
    idSede: number,
    payload: RegistrarGastoOperativoPayload
  ): Promise<GastoOperativo> => {
    const { data } = await api.post<ApiResponse<GastoOperativo>>(
      `/gastos-operativos/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  listarGastosOperativosPorRango: async (
    idSede: number,
    inicio: string,
    fin: string
  ): Promise<GastoOperativo[]> => {
    const { data } = await api.get<ApiResponse<GastoOperativo[]>>(
      `/gastos-operativos/sedes/${idSede}/rango`,
      { params: { inicio, fin } }
    )
    return data.data
  },

  actualizarGastoOperativo: async (
    id: number,
    payload: ActualizarGastoOperativoPayload
  ): Promise<GastoOperativo> => {
    const { data } = await api.put<ApiResponse<GastoOperativo>>(`/gastos-operativos/${id}`, payload)
    return data.data
  },

  eliminarGastoOperativo: async (id: number): Promise<void> => {
    await api.delete(`/gastos-operativos/${id}`)
  },

  resumenMensual: async (
    idSede: number,
    anio: number,
    mes: number
  ): Promise<ResumenFinanciero> => {
    const { data } = await api.get<ApiResponse<ResumenFinanciero>>(
      `/finanzas/sedes/${idSede}/resumen-mensual`,
      { params: { anio, mes } }
    )
    return data.data
  },

  resumenEvento: async (idEvento: number): Promise<ResumenEventoFinanciero> => {
    const { data } = await api.get<ApiResponse<ResumenEventoFinanciero>>(
      `/finanzas/eventos/${idEvento}/resumen`
    )
    return data.data
  },

  resumenDiario: async (
    idSede: number,
    inicio: string,
    fin: string
  ): Promise<ResumenDiario[]> => {
    const { data } = await api.get<ApiResponse<ResumenDiario[]>>(
      `/finanzas/sedes/${idSede}/resumen-diario`,
      { params: { inicio, fin } }
    )
    return data.data
  },

  resumenPorRango: async (
    idSede: number,
    inicio: string,
    fin: string
  ): Promise<ResumenRango> => {
    const { data } = await api.get<ApiResponse<ResumenRango>>(
      `/finanzas/sedes/${idSede}/resumen-rango`,
      { params: { inicio, fin } }
    )
    return data.data
  },

  metricasReservas: async (
    idSede: number,
    anio: number,
    mes: number
  ): Promise<MetricasReservas> => {
    const { data } = await api.get<ApiResponse<MetricasReservas>>(
      `/finanzas/sedes/${idSede}/metricas-reservas`,
      { params: { anio, mes } }
    )
    return data.data
  },

  listarTiposIngreso: async (): Promise<TipoIngreso[]> => {
    const { data } = await api.get<ApiResponse<TipoIngreso[]>>('/tipos-ingreso')
    return data.data
  },

  crearTipoIngreso: async (payload: CrearTipoIngresoPayload): Promise<TipoIngreso> => {
    const { data } = await api.post<ApiResponse<TipoIngreso>>('/tipos-ingreso', payload)
    return data.data
  },

  desactivarTipoIngreso: async (id: number): Promise<void> => {
    await api.delete(`/tipos-ingreso/${id}`)
  },

  listarIngresos: async (
    idSede: number,
    page = 0,
    size = 20
  ): Promise<PagedResponse<RegistroIngreso>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<RegistroIngreso>>>(
      `/ingresos/sedes/${idSede}`,
      { params: { page, size } }
    )
    return data.data
  },

  registrarIngresoManual: async (
    idSede: number,
    payload: RegistrarIngresoManualPayload
  ): Promise<RegistroIngreso> => {
    const { data } = await api.post<ApiResponse<RegistroIngreso>>(
      `/ingresos/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  eliminarIngreso: async (id: number): Promise<void> => {
    await api.delete(`/ingresos/${id}`)
  },

  obtenerCaja: async (idSede: number, fecha: string): Promise<AperturaCaja | null> => {
    try {
      const { data } = await api.get<ApiResponse<AperturaCaja>>(
        `/caja/sedes/${idSede}/fecha/${fecha}`
      )
      return data.data
    } catch {
      return null
    }
  },

  abrirCaja: async (idSede: number, payload: AbrirCajaPayload): Promise<AperturaCaja> => {
    const { data } = await api.post<ApiResponse<AperturaCaja>>(
      `/caja/sedes/${idSede}/abrir`,
      payload
    )
    return data.data
  },

  cerrarCaja: async (idApertura: number, payload: CerrarCajaPayload): Promise<AperturaCaja> => {
    const { data } = await api.put<ApiResponse<AperturaCaja>>(
      `/caja/${idApertura}/cerrar`,
      payload
    )
    return data.data
  },

  listarMovimientosCaja: async (idApertura: number): Promise<MovimientoCaja[]> => {
    const { data } = await api.get<ApiResponse<MovimientoCaja[]>>(
      `/caja/${idApertura}/movimientos`
    )
    return data.data
  },

  registrarMovimientoManual: async (
    idApertura: number,
    payload: RegistrarMovimientoManualPayload
  ): Promise<MovimientoCaja> => {
    const { data } = await api.post<ApiResponse<MovimientoCaja>>(
      `/caja/${idApertura}/movimientos`,
      payload
    )
    return data.data
  },

  listarPresupuestosEvento: async (idEvento: number): Promise<PresupuestoEvento[]> => {
    const { data } = await api.get<ApiResponse<PresupuestoEvento[]>>(
      `/presupuesto-eventos/eventos/${idEvento}`
    )
    return data.data
  },

  guardarPresupuesto: async (
    idEvento: number,
    payload: GuardarPresupuestoPayload
  ): Promise<PresupuestoEvento> => {
    const { data } = await api.post<ApiResponse<PresupuestoEvento>>(
      `/presupuesto-eventos/eventos/${idEvento}`,
      payload
    )
    return data.data
  },

  ejecutarPresupuesto: async (
    id: number,
    payload: EjecutarPresupuestoPayload
  ): Promise<PresupuestoEvento> => {
    const { data } = await api.put<ApiResponse<PresupuestoEvento>>(
      `/presupuesto-eventos/${id}/ejecutar`,
      payload
    )
    return data.data
  },

  eliminarPresupuesto: async (id: number): Promise<void> => {
    await api.delete(`/presupuesto-eventos/${id}`)
  },

  dashboardFinanciero: async (
    idSede: number,
    anio: number,
    mes: number
  ): Promise<DashboardFinanciero> => {
    const { data } = await api.get<ApiResponse<DashboardFinanciero>>(
      `/dashboard-financiero/sedes/${idSede}`,
      { params: { anio, mes } }
    )
    return data.data
  },
}
