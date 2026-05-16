// hooks/useDisponibilidad.ts

import { useQuery } from '@tanstack/react-query'
import { calendarioService } from '@/services/calendario.service'

export const DISPONIBILIDAD_KEY = 'disponibilidad'
export const DISPONIBILIDAD_RANGO_KEY = 'disponibilidad-rango'

export function useDisponibilidad(idSede: number, fecha: string) {
  return useQuery({
    queryKey: [DISPONIBILIDAD_KEY, idSede, fecha],
    queryFn: () => calendarioService.getDisponibilidad(idSede, fecha),
    enabled: !!idSede && !!fecha,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDisponibilidadRango(
  idSede: number,
  inicio: string,
  fin: string
) {
  return useQuery({
    queryKey: [DISPONIBILIDAD_RANGO_KEY, idSede, inicio, fin],
    queryFn: () =>
      calendarioService.getDisponibilidadRango(idSede, inicio, fin),
    enabled: !!idSede && !!inicio && !!fin,
    staleTime: 1000 * 60 * 5,
  })
}
