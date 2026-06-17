import api from './api'
import { ApiResponse } from '@/types/api.types'
import {
  TipoEvento,
  CrearTipoEventoPayload,
  ActualizarTipoEventoPayload,
  PaqueteEvento,
  ZonaJuego,
  ActividadLocal,
  NovedadLocal,
  CrearPaquetePayload,
  ActualizarPaquetePayload,
  CrearZonaPayload,
  ActualizarZonaPayload,
  CrearActividadPayload,
  ActualizarActividadPayload,
  CrearNovedadPayload,
  ActualizarNovedadPayload,
  BeneficioPaquete,
  ServicioCotizacion,
} from '@/types/comercial.types'

export const comercialService = {
  tiposEvento: {
    listarActivos: async (): Promise<TipoEvento[]> => {
      const { data } = await api.get<ApiResponse<TipoEvento[]>>('/tipos-evento')
      return data.data
    },
    listarAdmin: async (): Promise<TipoEvento[]> => {
      const { data } = await api.get<ApiResponse<TipoEvento[]>>('/tipos-evento/admin')
      return data.data
    },
    obtener: async (codigo: string): Promise<TipoEvento> => {
      const { data } = await api.get<ApiResponse<TipoEvento>>(`/tipos-evento/${codigo}`)
      return data.data
    },
    crear: async (payload: CrearTipoEventoPayload): Promise<TipoEvento> => {
      const { data } = await api.post<ApiResponse<TipoEvento>>('/tipos-evento', payload)
      return data.data
    },
    actualizar: async (codigo: string, payload: ActualizarTipoEventoPayload): Promise<TipoEvento> => {
      const { data } = await api.put<ApiResponse<TipoEvento>>(`/tipos-evento/${codigo}`, payload)
      return data.data
    },
    eliminar: async (codigo: string): Promise<void> => {
      await api.delete(`/tipos-evento/${codigo}`)
    },
  },

  paquetes: {
    listarActivos: async (): Promise<PaqueteEvento[]> => {
      const { data } = await api.get<ApiResponse<PaqueteEvento[]>>('/paquetes')
      return data.data
    },
    listarAdmin: async (): Promise<PaqueteEvento[]> => {
      const { data } = await api.get<ApiResponse<PaqueteEvento[]>>('/paquetes/admin')
      return data.data
    },
    crear: async (payload: CrearPaquetePayload): Promise<PaqueteEvento> => {
      const { data } = await api.post<ApiResponse<PaqueteEvento>>('/paquetes', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarPaquetePayload): Promise<PaqueteEvento> => {
      const { data } = await api.put<ApiResponse<PaqueteEvento>>(`/paquetes/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/paquetes/${id}`)
    },
    reordenar: async (id: number, nuevoOrden: number): Promise<void> => {
      await api.patch(`/paquetes/${id}/orden?nuevoOrden=${nuevoOrden}`)
    },
    
    // Beneficios
    beneficios: {
      listar: async (idPaquete: number): Promise<BeneficioPaquete[]> => {
        const { data } = await api.get<ApiResponse<BeneficioPaquete[]>>(`/paquetes/${idPaquete}/beneficios`)
        return data.data
      },
      crear: async (idPaquete: number, payload: Partial<BeneficioPaquete>): Promise<BeneficioPaquete> => {
        const { data } = await api.post<ApiResponse<BeneficioPaquete>>(`/paquetes/${idPaquete}/beneficios`, payload)
        return data.data
      },
      actualizar: async (idPaquete: number, id: number, payload: Partial<BeneficioPaquete>): Promise<BeneficioPaquete> => {
        const { data } = await api.put<ApiResponse<BeneficioPaquete>>(`/paquetes/${idPaquete}/beneficios/${id}`, payload)
        return data.data
      },
      eliminar: async (idPaquete: number, id: number): Promise<void> => {
        await api.delete(`/paquetes/${idPaquete}/beneficios/${id}`)
      },
    }
  },

  serviciosCotizacion: {
    listarActivos: async (): Promise<ServicioCotizacion[]> => {
      const { data } = await api.get<ApiResponse<ServicioCotizacion[]>>('/servicios-cotizacion')
      return data.data
    },
    listarAdmin: async (): Promise<ServicioCotizacion[]> => {
      const { data } = await api.get<ApiResponse<ServicioCotizacion[]>>('/servicios-cotizacion/admin')
      return data.data
    },
    crear: async (payload: Partial<ServicioCotizacion>): Promise<ServicioCotizacion> => {
      const { data } = await api.post<ApiResponse<ServicioCotizacion>>('/servicios-cotizacion', payload)
      return data.data
    },
    actualizar: async (id: number, payload: Partial<ServicioCotizacion>): Promise<ServicioCotizacion> => {
      const { data } = await api.put<ApiResponse<ServicioCotizacion>>(`/servicios-cotizacion/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/servicios-cotizacion/${id}`)
    },
  },

  zonas: {
    listarActivas: async (): Promise<ZonaJuego[]> => {
      const { data } = await api.get<ApiResponse<ZonaJuego[]>>('/zonas')
      return data.data
    },
    listarAdmin: async (): Promise<ZonaJuego[]> => {
      const { data } = await api.get<ApiResponse<ZonaJuego[]>>('/zonas/admin')
      return data.data
    },
    crear: async (payload: CrearZonaPayload): Promise<ZonaJuego> => {
      const { data } = await api.post<ApiResponse<ZonaJuego>>('/zonas', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarZonaPayload): Promise<ZonaJuego> => {
      const { data } = await api.put<ApiResponse<ZonaJuego>>(`/zonas/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/zonas/${id}`)
    },
    reordenar: async (id: number, nuevoOrden: number): Promise<void> => {
      await api.patch(`/zonas/${id}/orden?nuevoOrden=${nuevoOrden}`)
    },
  },

  actividades: {
    listarActivas: async (): Promise<ActividadLocal[]> => {
      const { data } = await api.get<ApiResponse<ActividadLocal[]>>('/actividades')
      return data.data
    },
    listarAdmin: async (): Promise<ActividadLocal[]> => {
      const { data } = await api.get<ApiResponse<ActividadLocal[]>>('/actividades/admin')
      return data.data
    },
    crear: async (payload: CrearActividadPayload): Promise<ActividadLocal> => {
      const { data } = await api.post<ApiResponse<ActividadLocal>>('/actividades', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarActividadPayload): Promise<ActividadLocal> => {
      const { data } = await api.put<ApiResponse<ActividadLocal>>(`/actividades/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/actividades/${id}`)
    },
    reordenar: async (id: number, nuevoOrden: number): Promise<void> => {
      await api.patch(`/actividades/${id}/orden?nuevoOrden=${nuevoOrden}`)
    },
  },

  novedades: {
    listarHome: async (): Promise<NovedadLocal[]> => {
      const { data } = await api.get<ApiResponse<NovedadLocal[]>>('/novedades')
      return data.data
    },
    listarAdmin: async (): Promise<NovedadLocal[]> => {
      const { data } = await api.get<ApiResponse<NovedadLocal[]>>('/novedades/admin')
      return data.data
    },
    crear: async (payload: CrearNovedadPayload): Promise<NovedadLocal> => {
      const { data } = await api.post<ApiResponse<NovedadLocal>>('/novedades', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarNovedadPayload): Promise<NovedadLocal> => {
      const { data } = await api.put<ApiResponse<NovedadLocal>>(`/novedades/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/novedades/${id}`)
    },
  },
}
