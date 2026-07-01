import Image from 'next/image'
import { Star, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useTestimonios } from '../../../hooks/useTestimonios'
import { TestimoniosSkeleton } from '../../shared/Skeletons'
import { Skeleton } from '../../shared/Skeletons'
import { fileUrl } from '@/lib/utils'

export function HomeTestimonios() {
  const { data: pagedData, isLoading } = useTestimonios(0, 6)

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-24 mx-auto mb-3" />
            <Skeleton className="h-10 w-72 mx-auto" />
          </div>
          <TestimoniosSkeleton />
        </div>
      </section>
    )
  }

  const list = pagedData?.content?.filter((r) => r.mostrarHome) ?? []
  if (list.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-brand-amarillo/20 text-yellow-700 border-brand-amarillo/30 mb-3">
            Testimonios
          </Badge>
          <h2 className="text-4xl font-black text-gray-900">
            Lo que dicen las familias
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-card transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.calificacion }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-amarillo text-brand-amarillo"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 font-medium italic">
                  &ldquo;{t.contenido}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                {t.fotoUrl ? (
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={fileUrl(t.fotoUrl) ?? t.fotoUrl}
                      alt={t.nombreAutor}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="font-bold text-sm text-gray-900">
                  {t.nombreAutor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
