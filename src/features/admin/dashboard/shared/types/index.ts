export interface AgendaReserva {
  numeroTicket: string
  nombreNino: string
  edadNino: number
  estado: string
}

export interface AgendaEvento {
  id: number
  tipoEvento: string
  nombreCliente: string
  turno: string
  estado: string
}

export interface ReservasDia {
  fecha: string
  cantidad: number
}

export interface DisponibilidadDia {
  fecha: string
  turnoT1Disponible: boolean
  turnoT2Disponible: boolean
  totalEventos: number
}

export interface DashboardOperativo {
  fecha: string
  reservasHoy: number
  reservasAyer: number
  ingresosHoy: number
  reservasConfirmadas: number
  pendientesPago: number
  aforoMaximo: number
  plazasDisponibles: number
  eventosEstaSemana: number
  solicitudesEventoSinResponder: number
  eventosSaldoPendiente: number
  cajaAbierta: boolean
  yapesPorValidar: number
  reservasHoyDetalle: AgendaReserva[]
  eventosHoyDetalle: AgendaEvento[]
  reservasUltimos30Dias: ReservasDia[]
  disponibilidadSemana: DisponibilidadDia[]
}
