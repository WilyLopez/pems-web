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
  ServicioVariante,
  ServicioImagen,
  CategoriaServicio,
  CrearCategoriaServicioPayload,
  ActualizarCategoriaServicioPayload,
} from '@/types/comercial.types'

export const comercialService = {
  tiposEvento: {
    listarActivos: async (): Promise<TipoEvento[]> => {
      const { data } = await api.get<ApiResponse<TipoEvento[]>>('/tipos-evento')
      return data.data
    },
    listarAdmin: async (): Promise<TipoEvento[]> => {
      const { data } = await api.get<ApiResponse<TipoEvento[]>>(
        '/tipos-evento/admin'
      )
      return data.data
    },
    obtener: async (codigo: string): Promise<TipoEvento> => {
      const { data } = await api.get<ApiResponse<TipoEvento>>(
        `/tipos-evento/${codigo}`
      )
      return data.data
    },
    crear: async (payload: CrearTipoEventoPayload): Promise<TipoEvento> => {
      const { data } = await api.post<ApiResponse<TipoEvento>>(
        '/tipos-evento',
        payload
      )
      return data.data
    },
    actualizar: async (
      codigo: string,
      payload: ActualizarTipoEventoPayload
    ): Promise<TipoEvento> => {
      const { data } = await api.put<ApiResponse<TipoEvento>>(
        `/tipos-evento/${codigo}`,
        payload
      )
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
      const { data } =
        await api.get<ApiResponse<PaqueteEvento[]>>('/paquetes/admin')
      return data.data
    },
    obtener: async (id: number): Promise<PaqueteEvento> => {
      const { data } = await api.get<ApiResponse<PaqueteEvento>>(
        `/paquetes/${id}`
      )
      return data.data
    },
    crear: async (payload: CrearPaquetePayload): Promise<PaqueteEvento> => {
      const { data } = await api.post<ApiResponse<PaqueteEvento>>(
        '/paquetes',
        payload
      )
      return data.data
    },
    actualizar: async (
      id: number,
      payload: ActualizarPaquetePayload
    ): Promise<PaqueteEvento> => {
      const { data } = await api.put<ApiResponse<PaqueteEvento>>(
        `/paquetes/${id}`,
        payload
      )
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
        const { data } = await api.get<ApiResponse<BeneficioPaquete[]>>(
          `/paquetes/${idPaquete}/beneficios`
        )
        return data.data
      },
      crear: async (
        idPaquete: number,
        payload: Partial<BeneficioPaquete>
      ): Promise<BeneficioPaquete> => {
        const { data } = await api.post<ApiResponse<BeneficioPaquete>>(
          `/paquetes/${idPaquete}/beneficios`,
          payload
        )
        return data.data
      },
      actualizar: async (
        idPaquete: number,
        id: number,
        payload: Partial<BeneficioPaquete>
      ): Promise<BeneficioPaquete> => {
        const { data } = await api.put<ApiResponse<BeneficioPaquete>>(
          `/paquetes/${idPaquete}/beneficios/${id}`,
          payload
        )
        return data.data
      },
      eliminar: async (idPaquete: number, id: number): Promise<void> => {
        await api.delete(`/paquetes/${idPaquete}/beneficios/${id}`)
      },
    },
  },

  categoriasServicio: {
    listarActivas: async (): Promise<CategoriaServicio[]> => {
      const { data } = await api.get<ApiResponse<CategoriaServicio[]>>(
        '/categorias-servicio'
      )
      return data.data
    },
    listarAdmin: async (): Promise<CategoriaServicio[]> => {
      const { data } = await api.get<ApiResponse<CategoriaServicio[]>>(
        '/categorias-servicio/admin'
      )
      return data.data
    },
    crear: async (
      payload: CrearCategoriaServicioPayload
    ): Promise<CategoriaServicio> => {
      const { data } = await api.post<ApiResponse<CategoriaServicio>>(
        '/categorias-servicio',
        payload
      )
      return data.data
    },
    actualizar: async (
      id: number,
      payload: ActualizarCategoriaServicioPayload
    ): Promise<CategoriaServicio> => {
      const { data } = await api.put<ApiResponse<CategoriaServicio>>(
        `/categorias-servicio/${id}`,
        payload
      )
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/categorias-servicio/${id}`)
    },
  },

  serviciosCotizacion: {
    listarActivos: async (): Promise<ServicioCotizacion[]> => {
      const { data } = await api.get<ApiResponse<ServicioCotizacion[]>>(
        '/servicios-cotizacion'
      )
      return data.data
    },
    listarAdmin: async (): Promise<ServicioCotizacion[]> => {
      const { data } = await api.get<ApiResponse<ServicioCotizacion[]>>(
        '/servicios-cotizacion/admin'
      )
      return data.data
    },
    crear: async (
      payload: Partial<ServicioCotizacion>
    ): Promise<ServicioCotizacion> => {
      const { data } = await api.post<ApiResponse<ServicioCotizacion>>(
        '/servicios-cotizacion',
        payload
      )
      return data.data
    },
    actualizar: async (
      id: number,
      payload: Partial<ServicioCotizacion>
    ): Promise<ServicioCotizacion> => {
      const { data } = await api.put<ApiResponse<ServicioCotizacion>>(
        `/servicios-cotizacion/${id}`,
        payload
      )
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/servicios-cotizacion/${id}`)
    },

    variantes: {
      listar: async (idServicio: number): Promise<ServicioVariante[]> => {
        const { data } = await api.get<ApiResponse<ServicioVariante[]>>(
          `/servicios-cotizacion/${idServicio}/variantes`
        )
        return data.data
      },
      crear: async (
        idServicio: number,
        payload: Omit<ServicioVariante, 'id' | 'idServicio'>
      ): Promise<ServicioVariante> => {
        const { data } = await api.post<ApiResponse<ServicioVariante>>(
          `/servicios-cotizacion/${idServicio}/variantes`,
          payload
        )
        return data.data
      },
      actualizar: async (
        idServicio: number,
        id: number,
        payload: Omit<ServicioVariante, 'id' | 'idServicio'>
      ): Promise<ServicioVariante> => {
        const { data } = await api.put<ApiResponse<ServicioVariante>>(
          `/servicios-cotizacion/${idServicio}/variantes/${id}`,
          payload
        )
        return data.data
      },
      eliminar: async (idServicio: number, id: number): Promise<void> => {
        await api.delete(`/servicios-cotizacion/${idServicio}/variantes/${id}`)
      },
      reordenar: async (
        idServicio: number,
        id: number,
        nuevoOrden: number
      ): Promise<void> => {
        await api.patch(
          `/servicios-cotizacion/${idServicio}/variantes/${id}/orden?nuevoOrden=${nuevoOrden}`
        )
      },
    },

    imagenes: {
      listar: async (idServicio: number): Promise<ServicioImagen[]> => {
        const { data } = await api.get<ApiResponse<ServicioImagen[]>>(
          `/servicios-cotizacion/${idServicio}/imagenes`
        )
        return data.data
      },
      subir: async (
        idServicio: number,
        archivo: File,
        opciones?: { idVariante?: number; altTexto?: string; orden?: number }
      ): Promise<ServicioImagen> => {
        const form = new FormData()
        form.append('archivo', archivo)
        if (opciones?.idVariante != null)
          form.append('idVariante', String(opciones.idVariante))
        if (opciones?.altTexto) form.append('altTexto', opciones.altTexto)
        if (opciones?.orden != null)
          form.append('orden', String(opciones.orden))
        const { data } = await api.post<ApiResponse<ServicioImagen>>(
          `/servicios-cotizacion/${idServicio}/imagenes`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data.data
      },
      eliminar: async (idServicio: number, id: number): Promise<void> => {
        await api.delete(`/servicios-cotizacion/${idServicio}/imagenes/${id}`)
      },
      reordenar: async (
        idServicio: number,
        id: number,
        nuevoOrden: number
      ): Promise<void> => {
        await api.patch(
          `/servicios-cotizacion/${idServicio}/imagenes/${id}/orden?nuevoOrden=${nuevoOrden}`
        )
      },
      marcarPrincipal: async (
        idServicio: number,
        id: number
      ): Promise<void> => {
        await api.patch(
          `/servicios-cotizacion/${idServicio}/imagenes/${id}/principal`
        )
      },
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
    actualizar: async (
      id: number,
      payload: ActualizarZonaPayload
    ): Promise<ZonaJuego> => {
      const { data } = await api.put<ApiResponse<ZonaJuego>>(
        `/zonas/${id}`,
        payload
      )
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
      const { data } =
        await api.get<ApiResponse<ActividadLocal[]>>('/actividades')
      return data.data
    },
    listarAdmin: async (): Promise<ActividadLocal[]> => {
      const { data } =
        await api.get<ApiResponse<ActividadLocal[]>>('/actividades/admin')
      return data.data
    },
    crear: async (payload: CrearActividadPayload): Promise<ActividadLocal> => {
      const { data } = await api.post<ApiResponse<ActividadLocal>>(
        '/actividades',
        payload
      )
      return data.data
    },
    actualizar: async (
      id: number,
      payload: ActualizarActividadPayload
    ): Promise<ActividadLocal> => {
      const { data } = await api.put<ApiResponse<ActividadLocal>>(
        `/actividades/${id}`,
        payload
      )
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
      const { data } =
        await api.get<ApiResponse<NovedadLocal[]>>('/novedades/admin')
      return data.data
    },
    crear: async (payload: CrearNovedadPayload): Promise<NovedadLocal> => {
      const { data } = await api.post<ApiResponse<NovedadLocal>>(
        '/novedades',
        payload
      )
      return data.data
    },
    actualizar: async (
      id: number,
      payload: ActualizarNovedadPayload
    ): Promise<NovedadLocal> => {
      const { data } = await api.put<ApiResponse<NovedadLocal>>(
        `/novedades/${id}`,
        payload
      )
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/novedades/${id}`)
    },
  },
}
