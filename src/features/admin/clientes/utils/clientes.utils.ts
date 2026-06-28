import {
  FiltroCliente,
  ListarClientesParams,
  OrigenCliente,
  SegmentoCliente,
} from '../types'

export function buildParams(
  filtro: FiltroCliente,
  page: number,
  size: number,
  search?: string
): ListarClientesParams {
  return {
    page,
    size,
    search: search || undefined,
    esVip: filtro === 'vip' ? true : undefined,
    activo:
      filtro === 'activos' ? true : filtro === 'inactivos' ? false : undefined,
    frecuente: filtro === 'frecuentes' ? true : undefined,
    origen: (filtro === 'web'
      ? 'WEB'
      : filtro === 'presenciales'
        ? 'MOSTRADOR'
        : filtro === 'admin'
          ? 'ADMIN'
          : undefined) as OrigenCliente | undefined,
    segmentoCodigo: (filtro === 'nuevos'
      ? 'NUEVO'
      : filtro === 'inactivos_seg'
        ? 'INACTIVO'
        : undefined) as SegmentoCliente | undefined,
  }
}
