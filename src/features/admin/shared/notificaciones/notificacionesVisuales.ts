import {
  FileText,
  Info,
  PartyPopper,
  ShoppingBag,
  Ticket,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TipoVisual } from '@/types/notificaciones.types'

export const TIPO_ICON: Record<TipoVisual, LucideIcon> = {
  reserva: Ticket,
  evento: PartyPopper,
  pago: Wallet,
  contrato: FileText,
  caja: ShoppingBag,
  sistema: Info,
}

export const TIPO_BADGE: Record<TipoVisual, string> = {
  reserva: 'bg-brand-azul/10 text-brand-azul',
  evento: 'bg-brand-rosa/10 text-brand-rosa',
  pago: 'bg-amber-50 text-amber-600',
  contrato: 'bg-green-50 text-green-600',
  caja: 'bg-orange-50 text-orange-600',
  sistema: 'bg-gray-100 text-gray-500',
}

export const DOT_COLOR: Record<TipoVisual, string> = {
  reserva: 'bg-brand-azul',
  evento: 'bg-brand-rosa',
  pago: 'bg-amber-500',
  contrato: 'bg-green-500',
  caja: 'bg-orange-500',
  sistema: 'bg-gray-400',
}

export const TIPO_LABEL: Record<TipoVisual, string> = {
  reserva: 'Reservas',
  evento: 'Eventos',
  pago: 'Pagos',
  contrato: 'Contratos',
  caja: 'Caja',
  sistema: 'Sistema',
}
