'use client'

import { ChevronRight, Info, MessageCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TipoEvento, PaqueteEvento } from '@/types/comercial.types'
import { Camino } from '../../../shared/types'
import { PaqueteCard } from '../ui/PaqueteCard'
import { IconoTipoEvento } from '../ui/IconoTipoEvento'

interface Props {
  isLoadingTipos: boolean
  tiposEvento: TipoEvento[]
  tipoEvento: string | null
  onSeleccionarTipo: (codigo: string) => void
  isLoadingPaquetes: boolean
  paquetesFiltrados: PaqueteEvento[]
  idPaquete: number | null
  camino: Camino
  onSeleccionarPaquete: (paquete: PaqueteEvento) => void
  onVerDetallePaquete: (paquete: PaqueteEvento) => void
  onSeleccionarCotizacion: () => void
  canAdvance1: boolean
  onContinuar: () => void
}

export function PasoTipoEvento({
  isLoadingTipos,
  tiposEvento,
  tipoEvento,
  onSeleccionarTipo,
  isLoadingPaquetes,
  paquetesFiltrados,
  idPaquete,
  camino,
  onSeleccionarPaquete,
  onVerDetallePaquete,
  onSeleccionarCotizacion,
  canAdvance1,
  onContinuar,
}: Props) {
  return (
    <div className="space-y-6 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
      <div>
        <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
          Paso 1 de 4
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          ¿Qué celebramos?
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Elige el tipo de evento para ver las opciones disponibles.
        </p>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 mt-4">
          {isLoadingTipos ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-11 bg-gray-100 rounded-xl animate-pulse"
              />
            ))
          ) : tiposEvento.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-2">
              No hay tipos de eventos disponibles en este momento.
            </p>
          ) : (
            tiposEvento.map((t) => (
              <button
                key={t.codigo}
                type="button"
                onClick={() => onSeleccionarTipo(t.codigo)}
                className={cn(
                  'px-4 py-3 sm:py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center gap-2 justify-center sm:justify-start min-h-[44px]',
                  tipoEvento === t.codigo
                    ? 'border-brand-rosa bg-brand-rosa/10 text-brand-rosa'
                    : 'border-gray-200 text-gray-600 hover:border-brand-rosa/40 bg-white'
                )}
              >
                <IconoTipoEvento icono={t.icono} className="h-4 w-4 shrink-0" />
                <span className="leading-tight">{t.nombre}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {tipoEvento && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              ¿Cómo quieres organizarlo?
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Elige un paquete o pídenos una cotización a tu medida.
            </p>
          </div>

          {isLoadingPaquetes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {paquetesFiltrados.length === 0 && (
                <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    No hay paquetes prediseñados para este tipo de evento. Hemos
                    seleccionado la cotización personalizada para ti.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paquetesFiltrados.map((paq) => (
                  <PaqueteCard
                    key={paq.id}
                    paquete={paq}
                    seleccionado={idPaquete === paq.id && camino === 'paquete'}
                    onSeleccionar={() => onSeleccionarPaquete(paq)}
                    onVerDetalle={() => onVerDetallePaquete(paq)}
                  />
                ))}

                <button
                  type="button"
                  onClick={onSeleccionarCotizacion}
                  className={cn(
                    'p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 bg-white min-h-[160px] sm:min-h-0',
                    camino === 'cotizacion'
                      ? 'border-brand-azul bg-brand-azul/5 ring-2 ring-brand-azul/20'
                      : 'border-dashed border-gray-300 hover:border-brand-azul/40'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-brand-azul" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900">
                      Cotización personalizada
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Cuéntanos qué imaginas y te armamos una propuesta a
                      medida.
                    </p>
                  </div>
                  {camino === 'cotizacion' && (
                    <div className="flex items-center gap-1.5 text-xs text-brand-azul font-semibold">
                      <Check className="h-3.5 w-3.5" />
                      Seleccionada
                    </div>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-2 pt-2">
        {!tipoEvento && (
          <p className="text-xs text-gray-400 text-center">
            Elige un tipo de evento para continuar
          </p>
        )}
        {tipoEvento && !camino && (
          <p className="text-xs text-gray-400 text-center">
            Elige un paquete o la cotización personalizada para continuar
          </p>
        )}
        <Button
          className="w-full bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-40 text-white rounded-xl gap-2 h-12"
          disabled={!canAdvance1}
          onClick={onContinuar}
        >
          Continuar <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
