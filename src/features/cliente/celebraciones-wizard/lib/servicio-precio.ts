import { ServicioCotizacion } from '@/features/admin/eventos/types'

export function precioServicioEfectivo(
  servicio: ServicioCotizacion,
  idVariante?: number
): number {
  if (servicio.tieneVariantes) {
    const variante = servicio.variantes.find((v) => v.id === idVariante)
    return variante?.precio ?? servicio.precioDesde ?? 0
  }
  return servicio.precioReferencial
}

export function nombreServicioSeleccionado(
  servicio: ServicioCotizacion,
  idVariante?: number
): string {
  if (!servicio.tieneVariantes) return servicio.nombre
  const variante = servicio.variantes.find((v) => v.id === idVariante)
  return variante ? `${servicio.nombre} - ${variante.nombre}` : servicio.nombre
}
