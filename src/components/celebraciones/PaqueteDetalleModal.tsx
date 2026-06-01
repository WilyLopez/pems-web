'use client'

import { useState } from 'react'
import { Check, PartyPopper } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { fixMediaUrl } from '@/lib/media'
import { PaqueteEvento } from '@/types/comercial.types'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/Dialog'
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
      <div className="aspect-video bg-gradient-to-br from-brand-rosa/20 to-brand-azul/20 flex items-center justify-center">
        <PartyPopper className="h-12 w-12 text-white/60" />
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-gray-100">
      <img
        src={fixMediaUrl(imagenes[activa])}
        alt={paquete.nombre}
        className="w-full h-full object-cover"
      />
      {imagenes.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
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
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto gap-0">
        <GaleriaPaquete paquete={paquete} />

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-gray-900">{paquete.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">{paquete.descripcionCorta}</p>
            </div>
            <span className="text-brand-azul font-black text-xl shrink-0">
              {formatCurrency(paquete.precio)}
            </span>
          </div>

          {paquete.beneficios.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Incluye</p>
              <ul className="space-y-2">
                {paquete.beneficios.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {paquete.descripcionLarga && (
            <p className="text-sm text-gray-600 leading-relaxed">{paquete.descripcionLarga}</p>
          )}

          <button
            type="button"
            onClick={() => { onElegir(paquete.id); onClose() }}
            className="w-full py-3 bg-brand-rosa text-white rounded-xl font-bold text-sm hover:bg-brand-rosa/90 transition-colors"
          >
            Elegir este paquete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
