'use client'

import { useQuery } from '@tanstack/react-query'
import { calendarioService } from '@/services/calendario.service'

export function useDisponibilidadRango(idSede: number, inicio: string, fin: string) {
  return useQuery({
    queryKey: ['disponibilidad', idSede, inicio, fin],
    queryFn: () => calendarioService.getDisponibilidadRango(idSede, inicio, fin),
    enabled: !!idSede && !!inicio && !!fin,
  })
}

export function useDisponibilidad(idSede: number, fecha: string) {
  return useQuery({
    queryKey: ['disponibilidad', idSede, fecha],
    queryFn: () => calendarioService.getDisponibilidad(idSede, fecha),
    enabled: !!idSede && !!fecha,
  })
}