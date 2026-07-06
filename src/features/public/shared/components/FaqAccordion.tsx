'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Faq } from '@/types/faq.types'

export function FaqAccordion({
  faqs,
  className,
}: {
  faqs: Faq[]
  className?: string
}) {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div className={cn('space-y-4', className)}>
      {faqs.map((faq) => {
        const isOpen = openId === faq.id
        return (
          <div
            key={faq.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
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
  )
}
