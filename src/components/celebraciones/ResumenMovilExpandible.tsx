'use client'

import { useState } from 'react'
import { PartyPopper, ChevronUp, Plus } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { PaqueteEvento } from '@/types/comercial.types'
import { ExtraPaquete, ServicioCotizacion, Turno } from '@/types/evento.types'

type TipoEvento = 'CUMPLEANOS' | 'BABY_SHOWER' | 'FIN_ANO' | 'TEMATICO' | 'FAMILIAR' | 'OTRO'
type Camino = 'paquete' | 'cotizacion' | null

const LABEL_TIPO: Record<TipoEvento, string> = {
  CUMPLEANOS: 'Cumpleaños',
  BABY_SHOWER: 'Baby Shower',
  FIN_ANO: 'Fin de año escolar',
  TEMATICO: 'Temático',
  FAMILIAR: 'Familiar',
  OTRO: 'Otro',
}

interface Props {
  tipoEvento: TipoEvento | null
  camino: Camino
  paquete: PaqueteEvento | null
  extras: ExtraPaquete[]
  extrasSeleccionados: number[]
  serviciosCotizacion: number[]
  servicios: ServicioCotizacion[]
  presupuestoEstimado: number
  fecha: string | null
  turno: Turno | null
}

export function ResumenMovilExpandible({
  tipoEvento,
  camino,
  paquete,
  extras,
  extrasSeleccionados,
  serviciosCotizacion,
  servicios,
  presupuestoEstimado,
  fecha,
  turno,
}: Props) {
  const [abierto, setAbierto] = useState(false)

  const nombresExtras = extrasSeleccionados
    .map((id) => extras.find((e) => e.id === id)?.nombre)
    .filter(Boolean) as string[]

  const nombresServicios = serviciosCotizacion
    .map((id) => servicios.find((s) => s.id === id)?.nombre)
    .filter(Boolean) as string[]

  const resumenCorto = [
    tipoEvento ? LABEL_TIPO[tipoEvento] : null,
    camino === 'paquete' && paquete ? paquete.nombre : null,
    fecha ? formatDate(fecha) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <PartyPopper className="h-4 w-4 text-brand-rosa" />
          <span className="text-sm font-bold text-gray-900">Tu evento</span>
          {resumenCorto && (
            <span className="text-xs text-gray-400 truncate max-w-[160px]">{resumenCorto}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {camino === 'cotizacion' && presupuestoEstimado > 0 && (
            <span className="text-sm font-black text-brand-azul">
              {formatCurrency(presupuestoEstimado)}
            </span>
          )}
          <ChevronUp
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform',
              abierto && 'rotate-180'
            )}
          />
        </div>
      </button>

      {abierto && (
        <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto border-t border-gray-100 pt-3 space-y-3">
          {tipoEvento && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tipo</p>
              <p className="text-sm font-semibold text-gray-900">{LABEL_TIPO[tipoEvento]}</p>
            </div>
          )}

          {camino === 'paquete' && paquete && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Paquete</p>
              <p className="text-sm font-semibold text-gray-900">{paquete.nombre}</p>
              <p className="text-xs text-brand-azul font-bold">{formatCurrency(paquete.precio)}</p>
            </div>
          )}

          {camino === 'cotizacion' && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Modalidad</p>
              <p className="text-sm font-semibold text-gray-900">Cotización personalizada</p>
            </div>
          )}

          {nombresExtras.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Extras</p>
              <ul className="space-y-0.5">
                {nombresExtras.map((n) => (
                  <li key={n} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <Plus className="h-3 w-3 text-brand-azul shrink-0" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nombresServicios.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Servicios</p>
              <ul className="space-y-0.5">
                {nombresServicios.map((n) => (
                  <li key={n} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <Plus className="h-3 w-3 text-brand-azul shrink-0" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fecha && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fecha</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(fecha)}</p>
            </div>
          )}

          {turno && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Turno</p>
              <p className="text-sm font-semibold text-gray-900">
                {turno.nombre} · {turno.horaInicio}–{turno.horaFin}
              </p>
            </div>
          )}

          {camino === 'cotizacion' && presupuestoEstimado > 0 && (
            <div className="border-t border-gray-100 pt-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Estimado orientativo</p>
              <p className="text-lg font-black text-brand-azul">{formatCurrency(presupuestoEstimado)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
