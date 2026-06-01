import { TipoDia } from './enums'

export type TipoOcupacion = 'LIBRE' | 'PUBLICO' | 'PRIVADO' | 'BLOQUEADO' | 'FERIADO' | 'FUERA_RANGO'

export interface Disponibilidad {
  idSede: number
  fecha: string
  tipoDia: TipoDia
  esFeriado: boolean
  descripcionFeriado?: string
  accesoPublicoActivo: boolean
  turnoT1Disponible: boolean
  turnoT2Disponible: boolean
  aforoPublicoActual: number
  aforoMaximo: number
  plazasDisponibles: number
  aforoCompleto: boolean
  bloqueadoManualmente: boolean
  tipoBloqueo?: TipoBloqueo | null
  motivoBloqueo?: string | null
  totalReservas: number
  totalEventos: number
  ingresoEstimado: number
  tieneNotas: boolean
  ocupacionPorcentaje: number
  tipoOcupacion: TipoOcupacion
  disponiblePublico: boolean
  disponiblePrivado: boolean
  tituloEvento?: string | null
  idEvento?: number | null
}

export type TipoBloqueo =
  | 'MANTENIMIENTO'
  | 'LIMPIEZA'
  | 'EVENTO_CORPORATIVO'
  | 'REMODELACION'
  | 'CIERRE_ESPECIAL'

export interface ResumenDia {
  fecha: string
  totalReservas: number
  totalEventos: number
  ingresoEstimado: number
  pagosPendientes: number
  aforoPublicoActual: number
  aforoMaximo: number
  turnoT1: ResumenTurno
  turnoT2: ResumenTurno
  reservas: ResumenReserva[]
  eventos: ResumenEvento[]
  alertas: AlertaDia[]
}

export interface ResumenTurno {
  disponible: boolean
  totalReservas: number
  eventoPrivado: ResumenEvento | null
}

export interface ResumenReserva {
  id: number
  numeroTicket: string
  nombreNino: string
  nombreCliente: string
  estado: string
  totalPagado: number
}

export interface ResumenEvento {
  id: number
  tipoEvento: string
  turno: string
  horaInicio: string
  horaFin: string
  nombreCliente: string
  estado: string
  aforoDeclarado?: number
}

export interface AlertaDia {
  tipo: 'AFORO' | 'PAGO' | 'CONTRATO' | 'PROVEEDOR'
  mensaje: string
  nivel: 'INFO' | 'WARNING' | 'DANGER'
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
  tipoBloqueo: TipoBloqueo
  activo: boolean
}
