'use client'

import { useFaqs } from '../hooks/useFaqs'
import { FaqSkeleton } from '@/features/public/shared/components/Skeletons'
import { EmptyState } from '@/features/public/shared/components/EmptyState'
import { FaqAccordion } from '@/features/public/shared/components/FaqAccordion'
import { Faq } from '@/types/faq.types'

export function NosotrosFaqs() {
  const { data: faqs, isLoading } = useFaqs()
  const visibles = faqs?.filter((f: Faq) => f.visible).slice(0, 5) ?? []

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-600">
            Todo lo que necesitas saber antes de visitarnos
          </p>
        </div>
        {isLoading ? (
          <FaqSkeleton />
        ) : visibles.length > 0 ? (
          <FaqAccordion faqs={visibles} />
        ) : (
          <EmptyState
            title="No hay preguntas frecuentes"
            description="No hay preguntas frecuentes disponibles en este momento."
          />
        )}
      </div>
    </section>
  )
}
