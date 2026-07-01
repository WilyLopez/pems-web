'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ticket, Gamepad2, Images } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useZonas } from '../../../hooks/useZonas'
import { fileUrl } from '@/lib/utils'
import { ZonaFotosModal } from '../../shared/ZonaFotosModal'

export function HomeZonas() {
  const { data: zonas, isLoading } = useZonas()
  const [modal, setModal] = useState<{ imagenes: string[]; nombre: string } | null>(null)

  if (isLoading) return null
  if (!zonas?.length) return null

  const destacadas = zonas.filter((z) => z.destacada).slice(0, 6)
  const mostrar = destacadas.length >= 3 ? destacadas : zonas.slice(0, 6)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 mb-3">
            Zona de Juegos
          </Badge>
          <h2 className="text-4xl font-black text-gray-900 mb-3">
            Horas de diversión garantizada
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Atracciones diseñadas para niños de todas las edades, con
            supervisión constante y medidas de seguridad en cada rincón.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mostrar.map((zona) => {
            const imagen = zona.imagenes[0]
            const hasMultiple = zona.imagenes.length > 1
            const edades =
              zona.edadMinima != null && zona.edadMaxima != null
                ? `${zona.edadMinima}–${zona.edadMaxima} años`
                : zona.edadMinima != null
                  ? `Desde ${zona.edadMinima} años`
                  : null

            return (
              <div
                key={zona.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-brand transition-all hover:-translate-y-1 group flex flex-col"
              >
                {/* Image area — clickable if multiple photos */}
                <div
                  className={`h-40 bg-brand-azul/10 overflow-hidden relative ${hasMultiple ? 'cursor-pointer' : ''}`}
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
                      <Gamepad2 className="h-12 w-12 text-brand-azul/40" />
                    </div>
                  )}

                  {/* Multi-photo badge */}
                  {hasMultiple && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      <Images className="h-3 w-3" />
                      {zona.imagenes.length} fotos
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {zona.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {zona.descripcion}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {edades && (
                      <span className="inline-block text-xs font-semibold text-brand-azul bg-brand-azul/8 rounded-full px-3 py-0.5">
                        {edades}
                      </span>
                    )}
                    {hasMultiple && (
                      <button
                        onClick={() => setModal({ imagenes: zona.imagenes, nombre: zona.nombre })}
                        className="text-xs text-brand-azul font-semibold hover:underline flex items-center gap-1"
                      >
                        <Images className="h-3 w-3" />
                        Ver galería
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            size="lg"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full px-10 font-bold gap-2"
          >
            <Link href="/zona-de-juegos">
              <Ticket className="h-5 w-5" />
              Ver zona completa y reservar
            </Link>
          </Button>
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
