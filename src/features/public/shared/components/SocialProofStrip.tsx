'use client'

import { Star } from 'lucide-react'
import { useTestimonios } from '@/features/public/shared/hooks/useTestimonios'
import { useContenidoPublico } from '@/features/public/shared/hooks/useContenidoPublico'
import { cn } from '@/lib/utils'

export function SocialProofStrip({ className }: { className?: string }) {
  const { texto } = useContenidoPublico()
  const { data } = useTestimonios(0, 6)

  const calificacion = texto('home.hero.stats.calificacion', '4.9')
  const familias = texto('home.hero.stats.familias', '+500')
  const citas = (data?.content ?? [])
    .filter((t) => t.mostrarHome && t.calificacion >= 4)
    .slice(0, 2)

  return (
    <div
      className={cn(
        'rounded-2xl bg-gray-50 border border-gray-100 px-6 py-5 flex flex-col md:flex-row md:items-center gap-5 md:gap-8',
        className
      )}
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-brand-amarillo text-brand-amarillo"
            />
          ))}
        </div>
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">{calificacion}</strong> ·{' '}
          {familias} familias felices
        </p>
      </div>

      {citas.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 md:border-l md:border-gray-200 md:pl-8">
          {citas.map((t, i) => (
            <blockquote
              key={t.id}
              className={cn(
                'text-sm text-gray-600 leading-relaxed',
                i === 1 && 'hidden lg:block'
              )}
            >
              <p className="line-clamp-2 italic">&ldquo;{t.contenido}&rdquo;</p>
              <footer className="mt-1 text-xs font-semibold text-gray-900 not-italic">
                — {t.nombreAutor}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  )
}
