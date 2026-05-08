import { TipoDia } from './enums'

export interface Disponibilidad {
  idSede: number
  fecha: string
  tipoDia: TipoDia
  accesoPublicoActivo: boolean
  turnoT1Disponible: boolean
  turnoT2Disponible: boolean
  aforoPublicoActual: number
  aforoMaximo: number
  plazasDisponibles: number
  aforoCompleto: boolean
  bloqueadoManualmente: boolean
}

export interface Tarifa {
  id: number
  tipoDia: TipoDia
  precio: number
  vigenciaDesde: string
  vigenciaHasta?: string
  activo: boolean
}

export interface Feriado {
  id: number
  tipoFeriado: string
  fecha: string
  descripcion: string
  anio: number
}

export interface BloqueCalendario {
  id: number
  idSede: number
  fechaInicio: string
  fechaFin: string
  motivo: string
  activo: boolean
}