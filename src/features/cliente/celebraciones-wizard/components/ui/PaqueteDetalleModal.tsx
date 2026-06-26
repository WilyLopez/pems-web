'use client'

import { useState } from 'react'
import { Check, PartyPopper, X, Users, Clock } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { fixMediaUrl } from '@/lib/media'
import { PaqueteEvento } from '@/types/comercial.types'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/Dialog'
import { useGaleria } from '@/features/admin/cms/galeria/hooks/useGaleria'

function GaleriaPaquete({ paquete }: { paquete: PaqueteEvento }) {
  const [activa, setActiva] = useState(0)
  const { data: galeriaFallback } = useGaleria(0, 8, true)

  const imagenes: string[] = paquete.imagenUrl
    ? [paquete.imagenUrl]
    : (galeriaFallback?.content ?? []).slice(0, 5).map((g) => g.url)

  if (imagenes.length === 0) {
    return (
      <div className="h-44 w-full bg-gradient-to-br from-brand-rosa/20 to-brand-azul/20 flex items-center justify-center shrink-0">
        <PartyPopper className="h-10 w-10 text-brand-rosa/40" />
      </div>
    )
  }

  return (
    <div className="relative h-44 sm:h-52 w-full bg-gray-100 overflow-hidden shrink-0">
      <img
        src={fixMediaUrl(imagenes[activa])}
        alt={paquete.nombre}
        className="w-full h-full object-cover"
      />
      {imagenes.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {imagenes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiva(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === activa ? 'bg-white w-4' : 'bg-white/50 w-1.5'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  paquete: PaqueteEvento | null
  open: boolean
  onClose: () => void
  onElegir: (id: number) => void
}

export function PaqueteDetalleModal({ paquete, open, onClose, onElegir }: Props) {
  if (!paquete) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        className="flex flex-col max-w-lg w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 max-h-[90vh] sm:max-h-[85vh] gap-0 [&>button:last-child]:hidden"
        aria-describedby={undefined}
      >
        {/* ── Header fijo ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0">
            {paquete.badge && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 mb-2">
                {paquete.badge}
              </span>
            )}
            <DialogTitle className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
              {paquete.nombre}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-0.5 leading-snug line-clamp-2">
              {paquete.descripcionCorta}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {paquete.limitepersonas && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Users className="h-3 w-3 shrink-0" />
                  Hasta {paquete.limitepersonas} personas
                </span>
              )}
              {paquete.duracionMinutos && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3 shrink-0" />
                  {paquete.duracionMinutos >= 60
                    ? `${Math.floor(paquete.duracionMinutos / 60)}h${paquete.duracionMinutos % 60 ? ` ${paquete.duracionMinutos % 60}min` : ''}`
                    : `${paquete.duracionMinutos} min`}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] text-gray-400 font-medium leading-none">desde</p>
            <p className="text-2xl font-black text-brand-rosa leading-tight">
              {formatCurrency(paquete.precio)}
            </p>
            {paquete.color && (
              <div
                className="h-1 w-full rounded-full mt-1.5"
                style={{ backgroundColor: paquete.color }}
              />
            )}
          </div>

          <DialogClose
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors -mt-0.5"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </div>

        {/* ── Contenido scrollable ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <GaleriaPaquete paquete={paquete} />

          <div className="p-5 space-y-5">
            {paquete.beneficios && paquete.beneficios.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  ¿Qué incluye?
                </p>
                <ul className="grid grid-cols-1 gap-2">
                  {paquete.beneficios.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {paquete.descripcionLarga && (
              <div className="space-y-1.5 pt-1 border-t border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Detalles adicionales
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {paquete.descripcionLarga}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer fijo ─────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={() => { onElegir(paquete.id); onClose() }}
            className="w-full py-3.5 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm shadow-brand-rosa/20"
          >
            Elegir este paquete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
