import { TipoDia } from '@/types/enums'

export type TipoOcupacion =
  | 'LIBRE'
  | 'PUBLICO'
  | 'PRIVADO_PARCIAL'
  | 'PRIVADO_LLENO'
  | 'BLOQUEADO'
  | 'FERIADO'

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
  idBloqueo?: number | null
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
  turnoT1Ocupado: boolean
  turnoT2Ocupado: boolean
  tituloEvento?: string | null
  idEvento?: number | null
  tituloEventoT1?: string | null
  idEventoT1?: number | null
  tituloEventoT2?: string | null
  idEventoT2?: number | null
  tieneProgramacionSemanal: boolean
}

export interface ConfiguracionCalendario {
  idSede: number
  diasMinReservaPublica: number
  diasMaxReservaPublica: number
  diasMinEventoPrivado: number
  diasMaxEventoPrivado: number
  aforoMaximo: number
  horaApertura: string
  horaCierre: string
  turnoT1Inicio: string
  turnoT1Fin: string
  turnoT2Inicio: string
  turnoT2Fin: string
  diasOperacion: string
  rangoMaxBloqueo: number
  edadMinCumple: number
  edadMaxCumple: number
}

export interface ConfiguracionCalendarioPublica {
  diasMinReservaPublica: number
  diasMaxReservaPublica: number
  diasMinEventoPrivado: number
  diasMaxEventoPrivado: number
  aforoMaximo: number
  horaApertura: string
  horaCierre: string
  diasOperacion: string
  edadMinCumple: number
  edadMaxCumple: number
}

export type TipoBloqueo =
  | 'MANTENIMIENTO'
  | 'LIMPIEZA'
  | 'EVENTO_CORPORATIVO'
  | 'REMODELACION'
  | 'CIERRE_ESPECIAL'

export interface ProgramacionSemanal {
  id: number
  idSede: number
  semanaInicio: string
  semanaFin: string
  estado: 'ACTIVA' | 'CANCELADA'
  autoGenerada: boolean
  creadoEn: string
}

export interface ResumenDia {
  fecha: string
  totalReservas: number
  totalEventos: number
  ingresoEstimado: number
  pagosPendientes: number
  aforoPublicoActual: number
  aforoMaximo: number
  tipoOcupacion: TipoOcupacion
  bloqueadoManualmente: boolean
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
