export type {
  Reserva,
  EstadoReserva,
  BuscarReservasParams,
  PageableResponse,
} from '@/features/admin/reservas/types'

export type {
  EventoPrivado,
  EstadoEvento,
  SolicitarEventoPayload,
} from '@/types/evento.types'

export type { Cliente, ActualizarClientePayload } from '@/types/cliente.types'

export type TipoEvento = string
export type Camino = 'paquete' | 'cotizacion' | null

export interface CrearReservaPayload {
  fechaEvento: string
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  dniAcompanante: string
  firmoConsentimiento: boolean
  medioPago?: string | null
  canalReserva?: string
}

export * from '../constants'
