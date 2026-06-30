'use client'

import { useState } from 'react'
import {
  HelpCircle,
  Calendar,
  UserCheck,
  CreditCard,
  QrCode,
  ChevronDown,
  MessageCircle,
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
    icon: Calendar,
    title: 'Selecciona la fecha',
    desc: 'Elige un día disponible en el calendario de acuerdo a las tarifas de Kiki y Lala.',
  },
  {
    step: '2',
    icon: UserCheck,
    title: 'Registra los datos del visitante',
    desc: 'Indica el nombre y edad del menor, así como el DNI y nombre del acompañante responsable.',
  },
  {
    step: '3',
    icon: CreditCard,
    title: 'Selecciona método de pago',
    desc: 'Puedes yapear subiendo tu comprobante de pago o elegir el pago directo en la caja física del local.',
  },
  {
    step: '4',
    icon: QrCode,
    title: 'Obtén tu ticket QR',
    desc: 'Finaliza el proceso para recibir tu ticket QR y descargarlo en PDF. También llegará a tu correo.',
  },
]

const FAQS = [
  {
    q: '¿Qué edad deben tener los niños para ingresar?',
    a: 'La edad permitida para ingresar a la zona de juegos es de 0 a 12 años de edad. Es obligatorio que ingresen acompañados de un adulto responsable.',
  },
  {
    q: '¿Cómo funciona el pago con Yape?',
    a: 'Escanea el código QR que se muestra en el Paso 3, realiza la transferencia exacta y sube la captura de pantalla de la operación para su validación manual.',
  },
  {
    q: '¿Es obligatorio firmar el Acta de Responsabilidad?',
    a: 'Sí. Por normas de seguridad y conducta del local, el acompañante adulto debe firmar el Acta de Responsabilidad físicamente en recepción al llegar al local.',
  },
  {
    q: '¿Puedo reprogramar o cancelar mi reserva?',
    a: 'Sí. Puedes reprogramar tu reserva una vez sin costo adicional desde tu perfil en la sección "Mis Reservas" antes de la fecha del evento.',
  },
]

export function AyudaReservarSheet() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const whatsappUrl = useWhatsAppUrl(
    'Hola, tengo una consulta sobre el proceso de reserva de entradas.'
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed z-40 flex items-center justify-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full transition-all hover:bg-brand-azul/5 hover:border-brand-azul/30 hover:text-brand-azul text-gray-700 bottom-24 right-20 w-12 h-12 lg:bottom-6 lg:right-24 lg:w-auto lg:h-14 lg:px-5"
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline text-sm font-semibold">Ayuda</span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col h-full"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-azul shrink-0" />
            Cómo reservar tu entrada
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
                    <div className="absolute left-5 top-10 bottom-[-20px] w-[2px] bg-gray-100 group-hover:bg-brand-azul/20 transition-colors" />
                  )}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-brand-azul/10 border-brand-azul/10 text-brand-azul font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-brand-azul shrink-0" />
                      <h3 className="text-sm font-bold text-gray-900">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Preguntas frecuentes
            </p>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="border-b border-gray-100 last:border-0 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-brand-azul transition-colors gap-2"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0',
                        isOpen && 'rotate-180 text-brand-azul'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                      {faq.a}
                    </p>
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
                  <p className="text-xs font-bold text-gray-900">
                    ¿Necesitas más ayuda?
                  </p>
                  <p className="text-[10px] text-green-800">
                    Soporte por WhatsApp activo
                  </p>
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
