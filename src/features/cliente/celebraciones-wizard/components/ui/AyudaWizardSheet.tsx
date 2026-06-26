'use client'

import { useState } from 'react'
import {
  HelpCircle,
  PartyPopper,
  Cake,
  Users,
  CheckCircle,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/Sheet'

const PASOS = [
  {
    step: '1',
    icon: PartyPopper,
    title: 'Entra a solicitar tu evento',
    desc: 'Desde el menú de tu cuenta, haz clic en "Solicitar evento". Se abrirá una pantalla que te guiará paso a paso.',
  },
  {
    step: '2',
    icon: Cake,
    title: 'Elige el tipo de celebración y cómo organizarlo',
    desc: 'Indica qué tipo de evento vas a celebrar. Luego elige si prefieres un paquete ya armado o que te preparemos una propuesta personalizada según lo que imaginas.',
  },
  {
    step: '3',
    icon: Users,
    title: 'Elige la fecha y cuéntanos los detalles',
    desc: 'Selecciona el día y el horario. También puedes indicarnos el número de invitados, el nombre del cumpleañero y cualquier detalle adicional.',
  },
  {
    step: '4',
    icon: CheckCircle,
    title: 'Envía y espera nuestra confirmación',
    desc: 'Revisa el resumen antes de enviar. Nuestro equipo te contactará en menos de 24 horas para confirmar la disponibilidad y los detalles del pago.',
  },
]

const FAQS = [
  {
    q: '¿Cómo pago mi evento privado?',
    a: 'Después de enviar tu solicitud, nuestro equipo se contactará contigo para darte todos los detalles del pago del adelanto y confirmar la fecha.',
  },
  {
    q: '¿Con cuánto tiempo de anticipación debo pedirlo?',
    a: 'Te recomendamos solicitarlo con al menos 15 días de anticipación para asegurar tu fecha, especialmente en fines de semana y fechas especiales.',
  },
  {
    q: '¿Puedo cambiar el paquete después de enviar?',
    a: 'Sí. Al contactarte, el equipo puede ajustar los detalles del paquete o cambiar a cotización personalizada según lo que necesites.',
  },
]

export function AyudaWizardSheet() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const whatsappUrl = useWhatsAppUrl('Hola, tengo una consulta sobre mi solicitud de evento privado')

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-brand-rosa/5 hover:border-brand-rosa/30 hover:text-brand-rosa transition-all lg:bottom-6 lg:right-6 bottom-[72px]"
        >
          <HelpCircle className="h-4 w-4" />
          Ayuda
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-rosa shrink-0" />
            Cómo solicitar tu evento
          </SheetTitle>
          <SheetCloseButton />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="space-y-5">
            {PASOS.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="flex gap-4 relative group">
                  {index < PASOS.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-20px] w-[2px] bg-gray-100 group-hover:bg-brand-rosa/20 transition-colors" />
                  )}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-brand-rosa/10 border-brand-rosa/10 text-brand-rosa font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-brand-rosa shrink-0" />
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Preguntas frecuentes</p>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="border-b border-gray-100 last:border-0 py-2.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-brand-rosa transition-colors gap-2"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0',
                        isOpen && 'rotate-180 text-brand-rosa'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
                  )}
                </div>
              )
            })}
          </div>

          {whatsappUrl && (
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-4 w-4 text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">¿Necesitas más ayuda?</p>
                  <p className="text-[10px] text-green-800">Soporte por WhatsApp activo</p>
                </div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-xs font-bold text-white transition-colors shadow-sm"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Chatear ahora
              </a>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
