import api from './api'
import {
  CrearTipoEgresoPayload,
  GastoEvento,
  GastoOperativo,
  RegistrarEgresoPayload,
  RegistrarGastoEventoPayload,
  RegistrarGastoOperativoPayload,
  RegistroEgreso,
  ResumenDiario,
  ResumenEventoFinanciero,
  ResumenFinanciero,
  TipoEgreso,
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
}
