import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFaqs } from '../../../hooks/useFaqs'
import { FaqSkeleton } from '../../shared/Skeletons'
import { EmptyState } from '../../shared/EmptyState'
import { cn } from '../../../../../lib/utils'
import { Faq } from '../../../../../types/faq.types'

interface FaqItemProps {
  pregunta: string
  respuesta: string
  isOpen: boolean
  onClick: () => void
}

function FaqItem({ pregunta, respuesta, isOpen, onClick }: FaqItemProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-105 overflow-hidden shadow-sm">
      <button
        onClick={onClick}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-brand-azul transition-colors outline-none"
      >
        <span>{pregunta}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-300 shrink-0',
            isOpen && 'transform rotate-180 text-brand-azul'
          )}
        />
      </button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out max-h-0 opacity-0 overflow-hidden border-t border-transparent',
          isOpen && 'max-h-[300px] opacity-100 border-gray-100'
        )}
      >
        <div className="px-6 py-4 text-sm text-gray-600 leading-relaxed bg-gray-50">
          {respuesta}
        </div>
      </div>
    </div>
  )
}

export function NosotrosFaqs() {
  const { data: faqs, isLoading: loadingFaqs } = useFaqs()
  const [openFaqId, setOpenFaqId] = useState<number | null>(null)

  const visiblesFaqs = faqs?.filter((f: Faq) => f.visible).slice(0, 5) ?? []

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

        {loadingFaqs ? (
          <FaqSkeleton />
        ) : visiblesFaqs.length > 0 ? (
          <div className="space-y-4">
            {visiblesFaqs.map((faq: Faq) => (
              <FaqItem
                key={faq.id}
                pregunta={faq.pregunta}
                respuesta={faq.respuesta}
                isOpen={openFaqId === faq.id}
                onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
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
