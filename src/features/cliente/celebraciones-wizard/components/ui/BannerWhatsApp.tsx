'use client'

import { MessageCircle } from 'lucide-react'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'

interface Props {
  tipoEvento?: string | null
}

export function BannerWhatsApp({ tipoEvento }: Props) {
  const mensaje = tipoEvento
    ? `Hola, quisiera coordinar un evento tipo "${tipoEvento}"`
    : 'Hola, quisiera coordinar un evento privado'
  const whatsappUrl = useWhatsAppUrl(mensaje)

  if (!whatsappUrl) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <MessageCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">¿Prefieres que te asesoremos?</p>
          <p className="text-xs text-gray-500">Escríbenos y coordinamos todo al instante.</p>
        </div>
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
      >
        WhatsApp
      </a>
    </div>
  )
}
