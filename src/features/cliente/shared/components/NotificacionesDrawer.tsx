'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Check, RefreshCw, Trash2 } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  useNotificacionesStore,
  Notificacion,
} from '@/lib/store/notificaciones.store'
import {
  TIPO_ICON,
  TIPO_BADGE,
  DOT_COLOR,
  TIPO_LABEL,
} from '@/features/admin/shared/notificaciones/notificacionesVisuales'

type Filtro = 'todas' | 'no-leidas' | 'leidas'

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'no-leidas', label: 'No leídas' },
  { value: 'leidas', label: 'Leídas' },
]

function formatFechaHora(fecha: Date): string {
  return format(fecha, 'd MMM yyyy, HH:mm', { locale: es })
}

interface NotificacionFilaProps {
  notificacion: Notificacion
  onSeleccionar: () => void
}

function NotificacionFila({
  notificacion: n,
  onSeleccionar,
}: NotificacionFilaProps) {
  const Icon = TIPO_ICON[n.tipo]

  return (
    <div
      onClick={onSeleccionar}
      className={cn(
        'flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors',
        !n.leida
          ? 'bg-brand-azul/[0.03] hover:bg-brand-azul/[0.06]'
          : 'hover:bg-gray-50'
      )}
    >
      <div className="relative shrink-0 mt-0.5">
        <div
          className={cn(
            'h-9 w-9 rounded-xl flex items-center justify-center',
            TIPO_BADGE[n.tipo]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!n.leida && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white',
              DOT_COLOR[n.tipo]
            )}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-tight',
            n.leida ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'
          )}
        >
          {n.titulo}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
          {n.mensaje}
        </p>
        <span className="text-[11px] text-gray-400 mt-1 block">
          {formatDistanceToNow(n.fecha, { addSuffix: true, locale: es })}
        </span>
      </div>
    </div>
  )
}

interface NotificacionDetalleProps {
  notificacion: Notificacion
  onVolver: () => void
  onEliminar: () => void
}

function NotificacionDetalle({
  notificacion: n,
  onVolver,
  onEliminar,
}: NotificacionDetalleProps) {
  const Icon = TIPO_ICON[n.tipo]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
        <button
          onClick={onVolver}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Volver a la lista"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-gray-900">Detalle</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
              TIPO_BADGE[n.tipo]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {n.titulo}
            </h3>
            <span
              className={cn(
                'inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                TIPO_BADGE[n.tipo]
              )}
            >
              {TIPO_LABEL[n.tipo]}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/70 border border-gray-100 rounded-xl p-4">
          {n.mensaje}
        </p>

        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Estado</dt>
            <dd
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                n.leida
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-brand-azul/10 text-brand-azul'
              )}
            >
              {n.leida ? 'Leída' : 'No leída'}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Recibida</dt>
            <dd className="text-gray-700 font-medium">
              {formatFechaHora(n.fecha)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Leída</dt>
            <dd className="text-gray-700 font-medium">
              {n.leidaEn ? formatFechaHora(n.leidaEn) : '—'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-gray-100 px-5 py-3.5 shrink-0 flex items-center gap-2">
        {n.href && (
          <Button
            asChild
            size="sm"
            className="flex-1 bg-brand-azul text-white hover:bg-brand-azul/90 rounded-xl font-bold text-xs"
          >
            <Link href={n.href}>Ver detalle</Link>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onEliminar}
          className="rounded-xl font-bold text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>
    </div>
  )
}

export function NotificacionesDrawer() {
  const {
    notificaciones,
    noLeidas,
    cargando,
    cargandoMas,
    page,
    totalPages,
    panelAbierto,
    setPanelAbierto,
    fetchNotificaciones,
    cargarMas,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
  } = useNotificacionesStore()

  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null)

  const seleccionada = useMemo(
    () => notificaciones.find((n) => n.id === seleccionadaId) ?? null,
    [notificaciones, seleccionadaId]
  )

  const filtradas = useMemo(() => {
    if (filtro === 'no-leidas') return notificaciones.filter((n) => !n.leida)
    if (filtro === 'leidas') return notificaciones.filter((n) => n.leida)
    return notificaciones
  }, [notificaciones, filtro])

  const handleOpenChange = (open: boolean) => {
    setPanelAbierto(open)
    if (open) fetchNotificaciones()
    else setSeleccionadaId(null)
  }

  const handleSeleccionar = (n: Notificacion) => {
    if (!n.leida) marcarLeida(n.id)
    setSeleccionadaId(n.id)
  }

  const handleEliminar = () => {
    if (!seleccionada) return
    eliminarNotificacion(seleccionada.id)
    setSeleccionadaId(null)
  }

  return (
    <Sheet open={panelAbierto} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        {seleccionada ? (
          <NotificacionDetalle
            notificacion={seleccionada}
            onVolver={() => setSeleccionadaId(null)}
            onEliminar={handleEliminar}
          />
        ) : (
          <>
            <SheetHeader className="shrink-0">
              <SheetTitle>Notificaciones</SheetTitle>
              <div className="flex items-center gap-2">
                {noLeidas > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-azul hover:text-brand-azul/70 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Marcar todas
                  </button>
                )}
                <SheetCloseButton />
              </div>
            </SheetHeader>

            <div className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto shrink-0 scrollbar-none">
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFiltro(f.value)}
                  className={cn(
                    'shrink-0 rounded-full text-[11px] font-semibold px-3 py-1 transition-colors',
                    filtro === f.value
                      ? 'bg-brand-azul text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div
              className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0"
              aria-live="polite"
            >
              {cargando && notificaciones.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="h-5 w-5 text-gray-300 animate-spin" />
                </div>
              ) : filtradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Bell className="h-8 w-8 text-gray-200" />
                  <p className="text-sm text-gray-400">
                    {filtro === 'no-leidas'
                      ? 'No tienes notificaciones sin leer.'
                      : filtro === 'leidas'
                        ? 'No tienes notificaciones leídas.'
                        : 'Sin notificaciones.'}
                  </p>
                </div>
              ) : (
                <>
                  {filtradas.map((n) => (
                    <NotificacionFila
                      key={n.id}
                      notificacion={n}
                      onSeleccionar={() => handleSeleccionar(n)}
                    />
                  ))}
                  {page + 1 < totalPages && (
                    <div className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cargarMas}
                        disabled={cargandoMas}
                        className="w-full rounded-xl"
                      >
                        {cargandoMas ? (
                          <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Cargar más
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
