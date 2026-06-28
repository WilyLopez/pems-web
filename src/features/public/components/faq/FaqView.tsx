'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { HelpCircle, Search, ChevronDown, MessageCircle } from 'lucide-react'
import { useFaqs } from '../../hooks/useFaqs'
import { usePublicConfig } from '../../hooks/usePublicConfig'
import { FaqSkeleton } from '../shared/Skeletons'
import { EmptyState } from '../shared/EmptyState'
import { cn } from '@/lib/utils'

export function FaqView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data: faqs, isLoading } = useFaqs()
  const { data: config } = usePublicConfig()

  const query = searchParams.get('q') ?? ''
  const [openId, setOpenId] = useState<number | null>(null)

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

  const filteredFaqs =
    faqs?.filter(
      (faq) =>
        faq.visible &&
        (faq.pregunta.toLowerCase().includes(query.toLowerCase()) ||
          faq.respuesta.toLowerCase().includes(query.toLowerCase()))
    ) ?? []

  const whatsappNumber = config?.whatsapp?.replace(/\D/g, '')
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null

  return (
    <section className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-azul/10 mb-4 animate-bounce">
            <HelpCircle className="h-7 w-7 text-brand-azul" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            Preguntas Frecuentes
          </h1>
          <p className="text-muted-foreground">
            Todo lo que necesitas saber antes de tu visita o reserva.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pregunta..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-brand-azul focus:ring-2 focus:ring-brand-azul/10 shadow-sm outline-none transition-all text-sm text-gray-900"
          />
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <FaqSkeleton />
        ) : filteredFaqs.length === 0 ? (
          <EmptyState
            title="No se encontraron preguntas"
            description={
              query
                ? `No encontramos resultados para "${query}". Intenta buscar con otros términos.`
                : 'No hay preguntas frecuentes configuradas por el momento.'
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-brand-azul transition-colors outline-none"
                  >
                    <span>{faq.pregunta}</span>
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
                      isOpen && 'max-h-[500px] opacity-100 border-gray-100/50'
                    )}
                  >
                    <div className="px-6 py-5 text-sm text-gray-600 leading-relaxed bg-gray-50/50">
                      {faq.respuesta}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <p className="font-semibold text-gray-900 mb-1">
            ¿No encontraste tu respuesta?
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Escríbenos y te responderemos a la brevedad.
          </p>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-550 hover:bg-green-600 text-white rounded-2xl px-6 py-3 text-sm font-black transition-colors shadow-sm shadow-green-100"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
