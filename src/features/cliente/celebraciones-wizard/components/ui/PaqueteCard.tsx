'use client'

import { Check, ExternalLink, Users, Clock } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { PaqueteEvento } from '@/types/comercial.types'

interface Props {
  paquete: PaqueteEvento
  seleccionado: boolean
  onSeleccionar: () => void
  onVerDetalle: () => void
}

export function PaqueteCard({ paquete, seleccionado, onSeleccionar, onVerDetalle }: Props) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all cursor-pointer',
        seleccionado
          ? 'border-brand-rosa bg-brand-rosa/5 ring-1 ring-brand-rosa'
          : 'border-gray-200 hover:border-brand-rosa/40 bg-white'
      )}
      onClick={onSeleccionar}
    >
      {/* Color strip */}
      {paquete.color && (
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ backgroundColor: paquete.color }}
        />
      )}

      {seleccionado && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-rosa flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {paquete.badge && (
        <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-amarillo/20 text-amber-700">
          {paquete.badge}
        </span>
      )}

      <div>
        <p className="font-black text-gray-900">{paquete.nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{paquete.descripcionCorta}</p>
      </div>

      {/* Capacity & duration chips */}
      {(paquete.limitepersonas || paquete.duracionMinutos) && (
        <div className="flex flex-wrap gap-2">
          {paquete.limitepersonas && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <Users className="h-3 w-3" />
              Hasta {paquete.limitepersonas} personas
            </span>
          )}
          {paquete.duracionMinutos && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" />
              {paquete.duracionMinutos >= 60
                ? `${Math.floor(paquete.duracionMinutos / 60)}h${paquete.duracionMinutos % 60 ? ` ${paquete.duracionMinutos % 60}min` : ''}`
                : `${paquete.duracionMinutos} min`}
            </span>
          )}
        </div>
      )}

      {paquete.beneficios && paquete.beneficios.length > 0 && (
        <ul className="space-y-1">
          {paquete.beneficios.slice(0, 3).map((b, i) => (
            <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="h-2.5 w-2.5 text-green-600" />
              </div>
              {b}
            </li>
          ))}
          {(paquete.beneficios?.length ?? 0) > 3 && (
            <li className="text-xs text-gray-400 pl-5.5">
              +{paquete.beneficios.length - 3} más incluidos
            </li>
          )}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-lg font-black" style={{ color: paquete.color ?? '#1e3a5f' }}>
          {formatCurrency(paquete.precio)}
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onVerDetalle() }}
          className="flex items-center gap-1 text-xs text-brand-azul font-semibold hover:underline"
        >
          Ver detalle
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
