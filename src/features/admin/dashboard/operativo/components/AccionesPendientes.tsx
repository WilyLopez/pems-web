'use client'

import Link from 'next/link'
import {
  MessageSquare,
  Wallet,
  Lock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { DashboardOperativo } from '../../shared/types'
import { RUTA_ACCION } from '../config'

interface Accion {
  icon: LucideIcon
  color: string
  texto: string
  href: string
}

interface Props {
  data: DashboardOperativo
}

export function AccionesPendientes({ data }: Props) {
  const acciones: Accion[] = []

  if (data.solicitudesEventoSinResponder > 0) {
    const n = data.solicitudesEventoSinResponder
    acciones.push({
      icon: MessageSquare,
      color:
        'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800',
      texto: `${n} solicitud${n > 1 ? 'es' : ''} de evento sin responder`,
      href: RUTA_ACCION.solicitudesEvento,
    })
  }

  if (data.eventosSaldoPendiente > 0) {
    const n = data.eventosSaldoPendiente
    acciones.push({
      icon: Wallet,
      color:
        'text-red-600 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-800',
      texto: `${n} evento${n > 1 ? 's' : ''} con saldo pendiente`,
      href: RUTA_ACCION.eventosSaldoPendiente,
    })
  }

  if (data.yapesPorValidar > 0) {
    const n = data.yapesPorValidar
    acciones.push({
      icon: Wallet,
      color:
        'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800',
      texto: `${n} pago${n > 1 ? 's' : ''} Yape por validar`,
      href: RUTA_ACCION.yapesPorValidar,
    })
  }

  if (!data.cajaAbierta) {
    acciones.push({
      icon: Lock,
      color:
        'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800',
      texto: 'Caja sin abrir para hoy',
      href: RUTA_ACCION.caja,
    })
  }


  if (acciones.length === 0) {
    return (
      <DashboardCard
        variant="success"
        className="flex items-center gap-2 px-4 py-3"
        padded={false}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
          Todo al día, no hay acciones pendientes.
        </p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard>
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-900 sm:text-base dark:text-gray-100">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
        Acciones pendientes
      </h3>
      <div className="space-y-2">
        {acciones.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-all hover:shadow-sm',
              a.color
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <a.icon className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm font-semibold">{a.texto}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
          </Link>
        ))}
      </div>
    </DashboardCard>
  )
}
