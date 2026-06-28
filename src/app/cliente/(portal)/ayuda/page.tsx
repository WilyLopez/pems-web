'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { SectionCard } from '@/features/cliente/shared/components/SectionCard'
import {
  HelpCircle,
  Ticket,
  PartyPopper,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle,
  MessageCircle,
  ChevronDown,
  Cake,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'

const PASOS_TICKET = [
  {
    step: '1',
    icon: Calendar,
    title: 'Entra al asistente de reserva',
    desc: 'Haz clic en "Reservar visita" desde el menú o desde la página de inicio. Se abrirá una pantalla donde podrás elegir el día que quieres visitar Kiki y Lala.',
  },
  {
    step: '2',
    icon: Layers,
    title: 'Elige el día disponible',
    desc: 'Verás un calendario con los días disponibles resaltados. Selecciona el que más te convenga — también podrás ver cuántos lugares quedan y el precio de la entrada.',
  },
  {
    step: '3',
    icon: FileCheck,
    title: 'Ingresa los datos del visitante',
    desc: 'Escribe el nombre y la edad del niño o niña que va a asistir, más el nombre y DNI del adulto acompañante responsable. Estos datos son necesarios para el ingreso al local.',
  },
  {
    step: '4',
    icon: CheckCircle,
    title: 'Guarda tu ticket y paga al llegar',
    desc: 'Tu reserva quedará guardada en "Mis reservas". Al llegar al local, muestra tu código en recepción y realiza el pago en caja. ¡Listo para jugar!',
  },
]

const PASOS_EVENTO = [
  {
    step: '1',
    icon: PartyPopper,
    title: 'Entra a solicitar tu evento',
    desc: 'Desde el menú de tu cuenta, haz clic en "Solicitar evento". Se abrirá una pantalla que te guiará paso a paso — sin complicaciones.',
  },
  {
    step: '2',
    icon: Cake,
    title: 'Elige el tipo de celebración y cómo organizarlo',
    desc: 'Primero indica qué tipo de evento vas a celebrar: cumpleaños, baby shower, evento temático u otro. Luego elige si prefieres un paquete ya armado (con todo incluido) o que te preparemos una propuesta personalizada según lo que imaginas.',
  },
  {
    step: '3',
    icon: Users,
    title: 'Elige la fecha y cuéntanos los detalles',
    desc: 'Selecciona el día y el horario que más te convenga. También puedes indicarnos el número aproximado de invitados, el nombre del cumpleañero o cumpleañera, y cualquier detalle adicional que consideres importante.',
  },
  {
    step: '4',
    icon: CheckCircle,
    title: 'Envía y espera nuestra confirmación',
    desc: 'Revisa el resumen con todos los datos antes de enviar. Una vez enviada tu solicitud, nuestro equipo te contactará en menos de 24 horas para confirmar la disponibilidad y los detalles del pago del adelanto.',
  },
]

const FAQS = [
  {
    q: '¿Puedo cancelar o cambiar la fecha de mi reserva?',
    a: 'Sí. Ve a "Mis reservas", selecciona la reserva y elige la opción que necesitas. Los cambios de fecha dependen de la disponibilidad del día que quieras.',
  },
  {
    q: '¿Cómo pago mi evento privado?',
    a: 'Después de enviar tu solicitud, nuestro equipo se contactará contigo para darte todos los detalles del pago del adelanto y confirmar la fecha.',
  },
  {
    q: '¿Con cuánto tiempo de anticipación debo pedir mi evento?',
    a: 'Te recomendamos solicitarlo con al menos 15 días de anticipación para asegurar tu fecha preferida, especialmente en fines de semana y fechas especiales.',
  },
]

function AyudaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const whatsappUrl = useWhatsAppUrl(
    'Hola, tengo una consulta sobre mi área de cliente'
  )

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const activeTab = (searchParams.get('tab') as 'ticket' | 'evento') ?? 'ticket'

  const setTab = (tab: 'ticket' | 'evento') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const pasos = activeTab === 'ticket' ? PASOS_TICKET : PASOS_EVENTO
  const color = activeTab === 'ticket' ? 'brand-azul' : 'brand-rosa'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-brand-azul" />
          Guía y Centro de ayuda
        </h1>
        <p className="text-sm text-gray-500">
          Aquí encontrarás todo lo que necesitas saber para reservar una entrada
          o solicitar tu evento privado.
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-md">
        <button
          onClick={() => setTab('ticket')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all',
            activeTab === 'ticket'
              ? 'bg-white text-brand-azul shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          )}
        >
          <Ticket className="h-4 w-4" />
          Reservar entrada
        </button>
        <button
          onClick={() => setTab('evento')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all',
            activeTab === 'evento'
              ? 'bg-white text-brand-rosa shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          )}
        >
          <PartyPopper className="h-4 w-4" />
          Solicitar evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <SectionCard
            titulo={
              activeTab === 'ticket'
                ? 'Cómo reservar tu entrada — paso a paso'
                : 'Cómo solicitar tu evento privado — paso a paso'
            }
            icon={activeTab === 'ticket' ? Ticket : PartyPopper}
          >
            <div className="space-y-5 mt-4">
              {pasos.map((item, index) => (
                <div key={item.step} className="flex gap-4 relative group">
                  {index < pasos.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-5 top-10 bottom-[-20px] w-[2px] bg-gray-100 transition-colors',
                        activeTab === 'ticket'
                          ? 'group-hover:bg-brand-azul/20'
                          : 'group-hover:bg-brand-rosa/20'
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border font-bold text-sm',
                      activeTab === 'ticket'
                        ? 'bg-brand-azul/10 border-brand-azul/10 text-brand-azul'
                        : 'bg-brand-rosa/10 border-brand-rosa/10 text-brand-rosa'
                    )}
                  >
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          {whatsappUrl && (
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0">
                  <MessageCircle className="h-4 w-4 fill-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    ¿Aún necesitas ayuda?
                  </p>
                  <p className="text-[10px] text-green-800">
                    Soporte por WhatsApp activo
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Si tienes alguna duda con tu reserva o evento, escríbenos
                directamente y te respondemos rápido.
              </p>
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

          <SectionCard titulo="Preguntas frecuentes" icon={HelpCircle}>
            <div className="divide-y divide-gray-100 mt-2">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className="py-3">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-brand-azul transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2',
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
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

export default function AyudaPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <AyudaContent />
    </Suspense>
  )
}
