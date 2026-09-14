'use client'

import Link from 'next/link'
import {
  ShoppingCart,
  ScanLine,
  CalendarDays,
  Calendar,
  Lock,
  Unlock,
  PartyPopper,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCajaHoy } from '@/features/admin/finanzas'
import { useMetricasReservas } from '@/features/admin/reservas/hooks/useReservasData'
import { useDisponibilidad } from '@/features/admin/calendario/hooks/useCalendarData'
import { ReservasMetrics } from '@/features/admin/reservas/components/ui/ReservasMetrics'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/Button'
import { fechaHoyEnZonaNegocio, formatDate, cn } from '@/lib/utils'

const ACCESOS_RAPIDOS = [
  { href: '/cajero/ventas/nueva', label: 'Nueva venta', icon: ShoppingCart },
  { href: '/cajero/accesos', label: 'Control de acceso', icon: ScanLine },
  { href: '/cajero/reservas', label: 'Reservas de hoy', icon: CalendarDays },
  { href: '/cajero/calendario', label: 'Calendario', icon: Calendar },
]

export default function CajeroHomePage() {
  const { idSede, nombre } = useAuth()
  const hoy = fechaHoyEnZonaNegocio()

  const { data: caja, isLoading: cargandoCaja } = useCajaHoy(
    idSede ?? undefined
  )
  const { data: metricas } = useMetricasReservas(idSede ?? undefined, hoy)
  const { data: disponibilidadHoy } = useDisponibilidad(idSede ?? 0, hoy)

  const estaAbierta = caja?.estado === 'ABIERTA'
  const primerNombre = nombre?.split(' ')[0] ?? ''
  const hayEventoHoy =
    disponibilidadHoy?.tipoOcupacion === 'PRIVADO_PARCIAL' ||
    disponibilidadHoy?.tipoOcupacion === 'PRIVADO_LLENO'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          Hola{primerNombre ? `, ${primerNombre}` : ''}
        </h1>
        <p
          className="text-sm text-gray-500 dark:text-gray-400 capitalize"
          suppressHydrationWarning
        >
          {formatDate(hoy, "EEEE d 'de' MMMM")}
        </p>
      </div>

      {!cargandoCaja && (
        <div
          className={cn(
            'flex items-center justify-between gap-4 rounded-2xl border p-5',
            estaAbierta
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                estaAbierta
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
              )}
            >
              {estaAbierta ? (
                <Unlock className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {estaAbierta ? 'Tu caja está abierta' : 'Tu caja está cerrada'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {estaAbierta
                  ? 'Puedes registrar ventas y movimientos.'
                  : 'Ábrela para empezar a registrar ventas.'}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className={cn(
              'gap-1.5 shrink-0',
              !estaAbierta && 'bg-brand-azul hover:bg-brand-azul/90 text-white'
            )}
            variant={estaAbierta ? 'outline' : 'default'}
          >
            <Link href="/cajero/caja">
              {estaAbierta ? 'Ver caja' : 'Abrir caja'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {hayEventoHoy && (
        <Alert className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800">
          <PartyPopper className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <AlertTitle className="text-violet-900 dark:text-violet-300">
            Hoy hay un evento privado
          </AlertTitle>
          <AlertDescription className="text-violet-700 dark:text-violet-400">
            {disponibilidadHoy?.tituloEvento
              ? `"${disponibilidadHoy.tituloEvento}" `
              : ''}
            {disponibilidadHoy?.tipoOcupacion === 'PRIVADO_LLENO'
              ? 'ocupa todo el local hoy — no hay aforo público disponible.'
              : 'ocupa parte del local hoy — el aforo público puede estar reducido.'}
          </AlertDescription>
        </Alert>
      )}

      <ReservasMetrics metricas={metricas} />

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5 px-1">
          Accesos rápidos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ACCESOS_RAPIDOS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-brand-azul/30 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-azul/10 text-brand-azul flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {label}
              </span>
              <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 ml-auto shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
