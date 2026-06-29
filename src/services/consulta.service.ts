import api from './api'
import { ApiResponse } from '@/types/api.types'

export interface DniResponse {
  numero: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombres: string
  nombreCompleto: string
}

export interface RucResponse {
  numero: string
  razonSocial: string
  estado: string
  condicion: string
  direccion: string
  viaTipo: string
  viaNombre: string
  numeroCalle: string
  distrito: string
  provincia: string
  departamento: string
}

export const consultaService = {
  consultarDni: async (dni: string, idSede: number): Promise<DniResponse> => {
    const { data } = await api.get<ApiResponse<any>>(`/consultas/dni/${dni}`, {
      params: { idSede },
    })
    const raw = data.data
    return {
      numero: raw.document_number || '',
      nombre: raw.first_name || '',
      nombres: raw.first_name || '',
      apellidoPaterno: raw.first_last_name || '',
      apellidoMaterno: raw.second_last_name || '',
      nombreCompleto: raw.full_name || '',
    }
  },

  consultarRuc: async (ruc: string, idSede: number): Promise<RucResponse> => {
    const { data } = await api.get<ApiResponse<any>>(`/consultas/ruc/${ruc}`, {
      params: { idSede },
    })
    const raw = data.data
    return {
      numero: raw.numero_documento || '',
      razonSocial: raw.razon_social || '',
      estado: raw.estado || '',
      condicion: raw.condicion || '',
      direccion: raw.direccion || '',
      viaTipo: raw.via_tipo || '',
      viaNombre: raw.via_nombre || '',
      numeroCalle: raw.numero || '',
      distrito: raw.distrito || '',
      provincia: raw.provincia || '',
      departamento: raw.departamento || '',
    }
  },
}
