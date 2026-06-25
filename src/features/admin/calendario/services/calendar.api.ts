import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import {
  ConfiguracionCalendario,
  ConfiguracionCalendarioPublica,
  Disponibilidad,
  ProgramacionSemanal,
  ResumenDia,
  TipoBloqueo,
} from '../types'

export const calendarApi = {
  getDisponibilidad: async (
    idSede: number,
    fecha: string
  ): Promise<Disponibilidad> => {
    const { data } = await api.get<ApiResponse<Disponibilidad>>(
      `/calendario/sedes/${idSede}/disponibilidad?fecha=${fecha}`
    )
    return data.data
  },

  getDisponibilidadRango: async (
    idSede: number,
    inicio: string,
    fin: string,
    signal?: AbortSignal
  ): Promise<Disponibilidad[]> => {
    const { data } = await api.get<ApiResponse<Disponibilidad[]>>(
      `/calendario/sedes/${idSede}/disponibilidad/rango?inicio=${inicio}&fin=${fin}`,
      { signal }
    )
    return data.data
  },

  getResumenDia: async (idSede: number, fecha: string): Promise<ResumenDia> => {
    const { data } = await api.get<ApiResponse<ResumenDia>>(
      `/calendario/sedes/${idSede}/resumen-dia?fecha=${fecha}`
    )
    return data.data
  },

  getConfiguracion: async (idSede: number): Promise<ConfiguracionCalendario> => {
    const { data } = await api.get<{ data: ConfiguracionCalendario }>(
      `/calendario/configuracion/sedes/${idSede}`
    )
    return data.data
  },

  getConfiguracionPublica: async (idSede: number): Promise<ConfiguracionCalendarioPublica> => {
    const { data } = await api.get<{ data: ConfiguracionCalendarioPublica }>(
      `/calendario/configuracion/sedes/${idSede}/publica`
    )
    return data.data
  },

  actualizarConfiguracion: async (
    idSede: number,
    payload: Omit<ConfiguracionCalendario, 'idSede'>
  ): Promise<ConfiguracionCalendario> => {
    const { data } = await api.put<{ data: ConfiguracionCalendario }>(
      `/calendario/configuracion/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  bloquearFechas: async (
    idSede: number,
    payload: {
      fechaInicio: string
      fechaFin: string
      motivo: string
      tipoBloqueo: TipoBloqueo
    },
    confirmado = false
  ): Promise<void> => {
    await api.post(
      `/calendario/sedes/${idSede}/bloqueos?confirmado=${confirmado}`,
      payload
    )
  },

  desactivarBloqueo: async (idBloque: number): Promise<void> => {
    await api.delete(`/calendario/bloqueos/${idBloque}`)
  },

  crearFeriado: async (payload: {
    tipoFeriado: string
    fecha: string
    descripcion: string
  }): Promise<void> => {
    await api.post('/feriados', payload)
  },

  eliminarFeriado: async (idFeriado: number): Promise<void> => {
    await api.delete(`/feriados/${idFeriado}`)
  },

  crearProgramacion: async (
    idSede: number,
    payload: { semanaInicio: string; semanaFin: string }
  ): Promise<ProgramacionSemanal> => {
    const { data } = await api.post<ApiResponse<ProgramacionSemanal>>(
      `/calendario/sedes/${idSede}/programaciones`,
      payload
    )
    return data.data
  },

  cancelarProgramacion: async (idSede: number, id: number): Promise<void> => {
    await api.delete(`/calendario/sedes/${idSede}/programaciones/${id}`)
  },

  listarProgramaciones: async (idSede: number): Promise<ProgramacionSemanal[]> => {
    const { data } = await api.get<ApiResponse<ProgramacionSemanal[]>>(
      `/calendario/sedes/${idSede}/programaciones`
    )
    return data.data
  },
}
