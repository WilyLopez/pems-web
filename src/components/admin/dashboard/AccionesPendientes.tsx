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
import { DashboardAdmin } from '@/types/dashboard.types'

interface Accion {
  icon: LucideIcon
  color: string
  texto: string
  href: string
}

interface Props {
  data: DashboardAdmin
}

export function AccionesPendientes({ data }: Props) {
  const acciones: Accion[] = []

  if (data.solicitudesEventoSinResponder > 0) {
    const n = data.solicitudesEventoSinResponder
    acciones.push({
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      texto: `${n} solicitud${n > 1 ? 'es' : ''} de evento sin responder`,
      href: '/admin/eventos?estado=SOLICITADA',
    })
  }

  if (data.eventosSaldoPendiente > 0) {
    const n = data.eventosSaldoPendiente
    acciones.push({
      icon: Wallet,
      color: 'text-red-600 bg-red-50 border-red-200',
      texto: `${n} evento${n > 1 ? 's' : ''} con saldo pendiente`,
      href: '/admin/eventos?estado=CONFIRMADA',
    })
  }

  if (!data.cajaAbierta) {
    acciones.push({
      icon: Lock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      texto: 'Caja sin abrir para hoy',
      href: '/admin/finanzas/caja',
    })
  }

  if (acciones.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <p className="text-sm font-semibold text-green-800">
          Todo al día, no hay acciones pendientes.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5 text-sm sm:text-base">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
        Acciones pendientes
      </h3>
      <div className="space-y-2">
        {acciones.map((a, i) => (
          <Link
            key={i}
            href={a.href}
            className={cn(
              'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm',
              a.color
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <a.icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-semibold truncate">{a.texto}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
          </Link>
        ))}
      </div>
    </div>
  )
}
