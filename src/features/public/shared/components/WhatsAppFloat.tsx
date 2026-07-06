'use client'

import { MessageCircle } from 'lucide-react'
import { usePublicConfig } from '@/features/public/shared/hooks/usePublicConfig'

export function WhatsAppFloat() {
  const { data: config } = usePublicConfig()
  const numero = config?.whatsapp?.replace(/\D/g, '')

  if (!numero) return null

  return (
    <a
      href={`https://wa.me/${numero}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
