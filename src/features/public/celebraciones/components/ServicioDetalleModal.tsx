'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { ServicioCotizacion } from '@/types/evento.types'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

function GaleriaServicio({ servicio }: { servicio: ServicioCotizacion }) {
  const [activa, setActiva] = useState(0)
  const imagenes = servicio.imagenes

  if (imagenes.length === 0) {
    return (
      <div className="h-44 sm:h-52 w-full bg-gradient-to-br from-brand-azul/20 to-brand-rosa/20 flex items-center justify-center shrink-0">
        <Sparkles className="h-10 w-10 text-brand-azul/40" />
      </div>
    )
  }

  return (
    <div className="relative h-44 sm:h-52 w-full bg-gray-100 overflow-hidden shrink-0">
      <img
        src={imagenes[activa].url}
        alt={imagenes[activa].altTexto || servicio.nombre}
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
  servicio: ServicioCotizacion | null
  open: boolean
  onClose: () => void
}

export function ServicioDetalleModal({ servicio, open, onClose }: Props) {
  if (!servicio) return null

  const variantesActivas = servicio.variantes.filter((v) => v.activo)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent
        className="flex flex-col max-w-lg w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 max-h-[90vh] sm:max-h-[85vh] gap-0 [&>button:last-child]:hidden"
        aria-describedby={undefined}
      >
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0">
            {servicio.categoriaNombre && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-azul/10 text-brand-azul mb-2">
                {servicio.categoriaNombre}
              </span>
            )}
            <DialogTitle className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
              {servicio.nombre}
            </DialogTitle>
            {servicio.descripcion && (
              <p className="text-sm text-gray-500 mt-0.5 leading-snug line-clamp-2">
                {servicio.descripcion}
              </p>
            )}
          </div>

          {!servicio.tieneVariantes && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-gray-400 font-medium leading-none">
                precio
              </p>
              <p className="text-2xl font-black text-brand-azul leading-tight">
                {servicio.precioReferencial
                  ? formatCurrency(servicio.precioReferencial)
                  : 'A consultar'}
              </p>
            </div>
          )}

          <DialogClose
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors -mt-0.5"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto">
          <GaleriaServicio servicio={servicio} />

          <div className="p-5 space-y-5">
            {variantesActivas.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Opciones disponibles
                </p>
                <ul className="grid grid-cols-1 gap-2">
                  {variantesActivas.map((variante) => (
                    <li
                      key={variante.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {variante.nombre}
                        </p>
                        {variante.descripcion && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {variante.descripcion}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-black text-brand-azul shrink-0">
                        {formatCurrency(variante.precio)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {servicio.descripcion && (
              <div className="space-y-1.5 pt-1 border-t border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Descripción
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {servicio.descripcion}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0 bg-white">
          <Button asChild variant="brand" className="w-full">
            <Link href="/cliente/celebraciones/solicitar">
              Solicitar cotización
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
