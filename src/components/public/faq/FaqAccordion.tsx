'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Faq } from '@/types/faq.types'

interface FaqAccordionProps {
  faqs: Faq[]
  showSearch?: boolean
}

function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: Faq
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 text-sm leading-relaxed">
          {faq.pregunta}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-5 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-gray-100">
          {faq.respuesta}
        </div>
      </div>
    </div>
  )
}

export function FaqAccordion({ faqs, showSearch = true }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? faqs.filter(
        (f) =>
          f.pregunta.toLowerCase().includes(search.toLowerCase()) ||
          f.respuesta.toLowerCase().includes(search.toLowerCase())
      )
    : faqs

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar preguntas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-azul/30 focus:border-brand-azul"
          />
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No se encontraron preguntas para &ldquo;{search}&rdquo;.
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((faq) => (
          <FaqItem
            key={faq.id}
            faq={faq}
            isOpen={openId === faq.id}
            onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
          />
        ))}
      </div>
    </div>
  )
}
