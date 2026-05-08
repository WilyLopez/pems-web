import api from './api'
import { ApiResponse } from '@/types/api.types'
import { Disponibilidad, Feriado } from '@/types/calendario.types'

export const calendarioService = {
  getDisponibilidad: async (idSede: number, fecha: string): Promise<Disponibilidad> => {
    const { data } = await api.get<ApiResponse<Disponibilidad>>(
      `/calendario/sedes/${idSede}/disponibilidad?fecha=${fecha}`
    )
    return data.data
  },

  getDisponibilidadRango: async (
    idSede: number,
    inicio: string,
    fin: string
  ): Promise<Disponibilidad[]> => {
    const { data } = await api.get<ApiResponse<Disponibilidad[]>>(
      `/calendario/sedes/${idSede}/disponibilidad/rango?inicio=${inicio}&fin=${fin}`
    )
    return data.data
  },

  bloquearFechas: async (
    idSede: number,
    payload: { fechaInicio: string; fechaFin: string; motivo: string }
  ): Promise<void> => {
    await api.post(`/calendario/sedes/${idSede}/bloqueos`, payload)
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
}