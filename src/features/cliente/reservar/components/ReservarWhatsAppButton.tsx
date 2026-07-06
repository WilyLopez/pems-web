'use client'

import { MessageCircle } from 'lucide-react'
import { useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'

interface ReservarWhatsAppButtonProps {
  fechaSeleccionada: string | null
  control: any
  className?: string
}

function buildMessage(props: {
  fechaSeleccionada: string | null
  nombreNino: string
  edadNino: number | undefined
}): string {
  const lines: string[] = ['¡Hola! Me gustaría hacer una consulta sobre la reserva de una entrada para la zona de juegos de Kiki y Lala:']
  
  if (props.fechaSeleccionada) {
    lines.push(`• Fecha seleccionada: ${props.fechaSeleccionada}`)
  }
  if (props.nombreNino) {
    lines.push(`• Niño/a: ${props.nombreNino}`)
  }
  if (props.edadNino !== undefined && !isNaN(Number(props.edadNino))) {
    lines.push(`• Edad: ${props.edadNino} años`)
  }

  lines.push('\n¿Me podrían brindar soporte?')
  return lines.join('\n')
}

export function ReservarWhatsAppButton({
  fechaSeleccionada,
  control,
  className,
}: ReservarWhatsAppButtonProps) {
  const nombreNino = useWatch({ control, name: 'nombreNino' }) ?? ''
  const edadNino = useWatch({ control, name: 'edadNino' })

  const mensaje = buildMessage({ fechaSeleccionada, nombreNino, edadNino })
  const url = useWhatsAppUrl(mensaje)

  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Soporte por WhatsApp"
      className={cn(
        'fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6',
        'w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-xl flex items-center justify-center',
        'bg-green-500 hover:bg-green-600 active:scale-95 transition-all duration-200',
        'ring-4 ring-white',
        className
      )}
    >
      <MessageCircle className="h-5 w-5 lg:h-7 lg:w-7 text-white fill-white" />
      <span
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-300 animate-ping opacity-75"
        aria-hidden="true"
      />
    </a>
  )
}
