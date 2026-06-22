'use client'

import { useState } from 'react'
import { Check, PartyPopper } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { fixMediaUrl } from '@/lib/media'
import { PaqueteEvento } from '@/types/comercial.types'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useGaleria } from '@/hooks/useGaleria'

interface GaleriaProps {
  paquete: PaqueteEvento
}

function GaleriaPaquete({ paquete }: GaleriaProps) {
  const [activa, setActiva] = useState(0)
  const { data: galeriaFallback } = useGaleria(0, 8, true)

  const imagenes: string[] = paquete.imagenUrl
    ? [paquete.imagenUrl]
    : (galeriaFallback?.content ?? []).slice(0, 5).map((g) => g.url)

  if (imagenes.length === 0) {
    return (
      <div className="h-[200px] xs:h-[240px] sm:h-auto sm:aspect-video w-full bg-gradient-to-br from-brand-rosa/20 to-brand-azul/20 flex items-center justify-center">
        <PartyPopper className="h-12 w-12 text-white/60 animate-bounce" />
      </div>
    )
  }

  return (
    <div className="relative h-[200px] xs:h-[240px] sm:h-auto sm:aspect-video w-full bg-gray-100 overflow-hidden">
      <img
        src={fixMediaUrl(imagenes[activa])}
        alt={paquete.nombre}
        className="w-full h-full object-cover"
      />
      {imagenes.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
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
        className={cn(
          "max-w-lg w-[calc(100vw-1.5rem)] sm:w-full rounded-2xl p-0 overflow-hidden max-h-[92vh] sm:max-h-[90vh] overflow-y-auto gap-0",
          // Give Radix's default close button a premium, contrasty, circular backdrop blur styling on top of the image
          "[&>button]:bg-black/50 [&>button]:text-white [&>button]:backdrop-blur-md [&>button]:rounded-full [&>button]:p-2 [&>button]:shadow-lg [&>button]:hover:bg-black/75 [&>button]:transition-all [&>button]:duration-200 [&>button]:top-3 [&>button]:right-3 [&>button]:border [&>button]:border-white/10 [&>button>svg]:h-4 [&>button>svg]:w-4"
        )} 
        aria-describedby={undefined}
      >
        <VisuallyHidden.Root>
          <DialogTitle>{paquete.nombre}</DialogTitle>
        </VisuallyHidden.Root>
        
        <GaleriaPaquete paquete={paquete} />

        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 border-b border-gray-50 pb-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight leading-snug">{paquete.nombre}</h3>
              <p className="text-sm text-gray-500 leading-normal">{paquete.descripcionCorta}</p>
            </div>
            <span className="text-brand-azul font-black text-2xl sm:text-xl shrink-0">
              {formatCurrency(paquete.precio)}
            </span>
          </div>

          {paquete.beneficios && paquete.beneficios.length > 0 && (
            <div className="space-y-3 bg-gray-50/50 p-3 sm:p-4 rounded-xl border border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">¿Qué incluye el paquete?</p>
              <ul className="grid grid-cols-1 gap-2.5">
                {paquete.beneficios.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600 font-bold" />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {paquete.descripcionLarga && (
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Detalles adicionales</p>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">{paquete.descripcionLarga}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => { onElegir(paquete.id); onClose() }}
              className="w-full py-3.5 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-md shadow-brand-rosa/15"
            >
              Elegir este paquete
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
