'use client'

import { PartyPopper, ChevronUp, Plus, X } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { PaqueteEvento } from '@/types/comercial.types'
import { ExtraPaquete, ServicioCotizacion, Turno } from '@/types/evento.types'
import { Camino } from '../../../shared/types'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetClose,
} from '@/components/ui/Sheet'

interface Props {
  tipoEvento: string | null
  tipoEventoLabel: string | null
  camino: Camino
  paquete: PaqueteEvento | null
  extras: ExtraPaquete[]
  extrasSeleccionados: number[]
  serviciosCotizacion: number[]
  servicios: ServicioCotizacion[]
  presupuestoEstimado: number
  presupuestoCliente?: number | null
  fecha: string | null
  turno: Turno | null
}

export function ResumenMovilExpandible({
  tipoEvento,
  tipoEventoLabel,
  camino,
  paquete,
  extras,
  extrasSeleccionados,
  serviciosCotizacion,
  servicios,
  presupuestoEstimado,
  presupuestoCliente,
  fecha,
  turno,
}: Props) {
  const nombresExtras = extrasSeleccionados
    .map((id) => extras.find((e) => e.id === id)?.nombre)
    .filter(Boolean) as string[]

  const nombresServicios = serviciosCotizacion
    .map((id) => servicios.find((s) => s.id === id)?.nombre)
    .filter(Boolean) as string[]

  const resumenCorto = [
    tipoEventoLabel,
    camino === 'paquete' && paquete ? paquete.nombre : null,
    fecha ? formatDate(fecha) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Sheet>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
        <SheetTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4 text-brand-rosa" />
              <span className="text-sm font-bold text-gray-900">Tu evento</span>
              {resumenCorto && (
                <span className="text-xs text-gray-400 truncate max-w-[160px]">
                  {resumenCorto}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {camino === 'cotizacion' && presupuestoEstimado > 0 && (
                <span className="text-sm font-black text-brand-azul">
                  {formatCurrency(presupuestoEstimado)}
                </span>
              )}
              <ChevronUp className="h-4 w-4 text-gray-400" />
            </div>
          </button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="bottom"
        className="max-h-[65vh] flex flex-col lg:hidden"
        aria-describedby={undefined}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-4 w-4 text-brand-rosa" />
            <SheetTitle className="text-sm font-bold text-gray-900">
              Resumen de tu evento
            </SheetTitle>
          </div>
          <SheetClose className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tipoEventoLabel && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Tipo
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {tipoEventoLabel}
              </p>
            </div>
          )}

          {camino === 'paquete' && paquete && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Paquete
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {paquete.nombre}
              </p>
              <p className="text-xs text-brand-azul font-bold mt-0.5">
                {formatCurrency(paquete.precio)}
              </p>
            </div>
          )}

          {camino === 'cotizacion' && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Modalidad
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Cotización personalizada
              </p>
            </div>
          )}

          {nombresExtras.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                Extras
              </p>
              <ul className="space-y-0.5">
                {nombresExtras.map((n) => (
                  <li
                    key={n}
                    className="flex items-center gap-1.5 text-xs text-gray-700"
                  >
                    <Plus className="h-3 w-3 text-brand-azul shrink-0" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nombresServicios.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                Servicios
              </p>
              <ul className="space-y-0.5">
                {nombresServicios.map((n) => (
                  <li
                    key={n}
                    className="flex items-center gap-1.5 text-xs text-gray-700"
                  >
                    <Plus className="h-3 w-3 text-brand-azul shrink-0" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fecha && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Fecha
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(fecha)}
              </p>
            </div>
          )}

          {turno && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Turno
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {turno.nombre} · {turno.horaInicio}–{turno.horaFin}
              </p>
            </div>
          )}

          {camino === 'cotizacion' && presupuestoEstimado > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Estimado orientativo
              </p>
              <p className="text-lg font-black text-brand-azul">
                {formatCurrency(presupuestoEstimado)}
              </p>
            </div>
          )}

          {presupuestoCliente && presupuestoCliente > 0 && (
            <div
              className={cn(
                'pt-3',
                camino !== 'cotizacion' || presupuestoEstimado === 0
                  ? 'border-t border-gray-100'
                  : ''
              )}
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Tu presupuesto
              </p>
              <p className="text-lg font-black text-green-700">
                {formatCurrency(presupuestoCliente)}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
