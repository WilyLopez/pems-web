import { EstadoEvento } from './enums'

export interface EventoPrivado {
  id: number
  estado: EstadoEvento
  turno: string
  horaInicio: string
  horaFin: string
  fechaEvento: string
  tipoEvento: string
  contactoAdicional?: string
  aforoDeclarado?: number
  precioTotalContrato?: number
  montoAdelanto?: number
  montoSaldo?: number
  nombreCliente: string
  correoCliente: string
  fechaCreacion: string
}

export interface SolicitarEventoPayload {
  idTurno: number
  fechaEvento: string
  tipoEvento: string
  contactoAdicional?: string
  aforoDeclarado?: number
}