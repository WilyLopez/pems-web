'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Gamepad2, Images } from 'lucide-react'
import { Badge } from '../../../../../components/ui/Badge'
import { useZonas } from '../../../hooks/useZonas'
import { Skeleton } from '../../shared/Skeletons'
import { ZonaFotosModal } from '../../shared/ZonaFotosModal'
import { fileUrl } from '../../../../../lib/utils'

export function JuegosZonas() {
  const { data: zonas, isLoading: loadingZonas } = useZonas()
  const [modal, setModal] = useState<{ imagenes: string[]; nombre: string } | null>(null)

  if (loadingZonas) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 space-y-6">
          <Skeleton className="h-10 w-48 mx-auto" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!zonas || zonas.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">
            Nuestras zonas de juego
          </h2>
          <p className="text-gray-600 mt-1">
            Cada zona tiene personal de supervisión y equipamiento certificado
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {zonas.map((zona) => {
            const imagen = zona.imagenes[0]
            const hasMultiple = zona.imagenes.length > 1
            const edades =
              zona.edadMinima != null && zona.edadMaxima != null
                ? `${zona.edadMinima}–${zona.edadMaxima} años`
                : zona.edadMinima != null
                  ? `Desde ${zona.edadMinima} años`
                  : 'Todas las edades'

            return (
              <div
                key={zona.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
              >
                <div>
                  {/* Image area — clickable if multiple photos */}
                  <div
                    className={`h-48 bg-brand-azul/10 overflow-hidden relative ${hasMultiple ? 'cursor-pointer' : ''}`}
                    onClick={
                      hasMultiple
                        ? () => setModal({ imagenes: zona.imagenes, nombre: zona.nombre })
                        : undefined
                    }
                  >
                    {imagen ? (
                      <Image
                        src={fileUrl(imagen) ?? imagen}
                        alt={zona.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Gamepad2 className="h-10 w-10 text-brand-azul/30" />
                      </div>
                    )}

                    {/* Multi-photo badge */}
                    {hasMultiple && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        <Images className="h-3 w-3" />
                        {zona.imagenes.length} fotos
                      </div>
                    )}

                    {/* Hover overlay hint */}
                    {hasMultiple && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Images className="h-3.5 w-3.5" />
                          Ver galería
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900">
                      {zona.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {zona.descripcion}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-xs border-brand-azul/30 text-brand-azul"
                  >
                    {edades}
                  </Badge>
                  {hasMultiple && (
                    <button
                      onClick={() => setModal({ imagenes: zona.imagenes, nombre: zona.nombre })}
                      className="text-xs text-brand-azul font-semibold hover:underline flex items-center gap-1"
                    >
                      <Images className="h-3 w-3" />
                      Ver {zona.imagenes.length} fotos
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Photo carousel modal */}
      {modal && (
        <ZonaFotosModal
          open={true}
          onClose={() => setModal(null)}
          imagenes={modal.imagenes}
          nombreZona={modal.nombre}
        />
      )}
    </section>
  )
}
