import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useActividadesPublico } from '@/hooks/useComercial'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'
import { fileUrl } from '@/lib/utils'

export function HomeActividades() {
  const { data: actividades, isLoading } = useActividadesPublico()

  if (isLoading) return null
  if (!actividades?.length) return null

  const mostrar = actividades.slice(0, 6)

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeader
          badge="Actividades"
          badgeColor="menta"
          title="Siempre hay algo divertido pasando"
          description="Actividades y dinámicas dentro de la zona de juegos, pensadas para cada edad."
          className="mb-12"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mostrar.map((actividad) => (
            <div
              key={actividad.id}
              className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-card transition-shadow flex flex-col"
            >
              <div className="relative h-40 w-full bg-brand-menta/10">
                {actividad.imagenUrl ? (
                  <Image
                    src={fileUrl(actividad.imagenUrl) ?? actividad.imagenUrl}
                    alt={actividad.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-brand-menta/40" />
                  </div>
                )}
                {actividad.esEspecial && (
                  <Badge className="absolute top-3 right-3 bg-brand-menta/20 text-emerald-700 border-brand-menta/30 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Especial
                  </Badge>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 leading-tight">
                  {actividad.nombre}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                  {actividad.descripcion}
                </p>
                {actividad.nombreZona && (
                  <span className="mt-3 text-xs font-semibold text-brand-azul self-start">
                    {actividad.nombreZona}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
