'use client'

import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { Camino } from '../../../shared/types'
import { PaqueteEvento } from '@/types/comercial.types'
import { Turno } from '@/types/evento.types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  tipoEventoLabel: string | null
  camino: Camino
  paquete: PaqueteEvento | null
  fecha: string | null
  turno: Turno | null
  invitados: number | null
  presupuestoCliente: number | null
  className?: string
}

function buildMessage(props: Omit<Props, 'className'>): string {
  const lines: string[] = ['Hola! Me gustaría solicitar un evento privado:']

  if (props.tipoEventoLabel) lines.push(`• Tipo: ${props.tipoEventoLabel}`)

  if (props.camino === 'paquete' && props.paquete) {
    lines.push(
      `• Paquete: ${props.paquete.nombre} (${formatCurrency(props.paquete.precio)})`
    )
  } else if (props.camino === 'cotizacion') {
    lines.push('• Modalidad: Cotización personalizada')
  }

  if (props.fecha) lines.push(`• Fecha tentativa: ${formatDate(props.fecha)}`)

  if (props.turno) {
    lines.push(
      `• Turno: ${props.turno.nombre} (${props.turno.horaInicio} – ${props.turno.horaFin})`
    )
  }

  if (props.invitados && props.invitados > 0) {
    lines.push(`• Invitados aprox.: ${props.invitados} personas`)
  }

  if (props.presupuestoCliente && props.presupuestoCliente > 0) {
    lines.push(
      `• Presupuesto aprox.: ${formatCurrency(props.presupuestoCliente)}`
    )
  }

  lines.push('\n¿Podría recibir más información?')

  return lines.join('\n')
}

export function WizardWhatsAppButton({ className, ...props }: Props) {
  const mensaje = buildMessage(props)
  const url = useWhatsAppUrl(mensaje)

  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Coordinar por WhatsApp"
      className={cn(
        'fixed bottom-[72px] right-4 z-50 lg:bottom-6 lg:right-6',
        'w-14 h-14 rounded-full shadow-xl flex items-center justify-center',
        'bg-green-500 hover:bg-green-600 active:scale-95 transition-all duration-200',
        'ring-4 ring-white',
        className
      )}
    >
      <MessageCircle className="h-7 w-7 text-white fill-white" />
      <span
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-300 animate-ping opacity-75"
        aria-hidden="true"
      />
    </a>
  )
}
