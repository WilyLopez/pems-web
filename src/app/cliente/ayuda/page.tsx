'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AyudaPage() {
  const [activeTab, setActiveTab] = useState<'ticket' | 'evento'>('ticket')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: '¿Cómo puedo cancelar o reprogramar una reserva de juego?',
      a: 'Ve a la sección "Mis reservas", selecciona la reserva correspondiente y haz clic en "Reprogramar" o "Cancelar". Recuerda que las reprogramaciones están sujetas a disponibilidad de aforo.',
    },
    {
      q: '¿Qué formas de pago aceptan para eventos privados?',
      a: 'Aceptamos transferencias bancarias directas, pagos con tarjetas de crédito/débito y pasarelas digitales. Una vez enviada tu solicitud, nuestro equipo te proporcionará los detalles específicos.',
    },
    {
      q: '¿Con cuánta anticipación debo solicitar un evento privado?',
      a: 'Recomendamos solicitar tu evento con al menos 15 a 30 días de anticipación para asegurar la disponibilidad de salones, temáticas personalizadas y animadores.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-brand-azul" />
          Guía y Centro de ayuda
        </h1>
        <p className="text-sm text-gray-500">
          Aprende paso a paso cómo reservar tus entradas para jugar y cómo solicitar un evento privado en nuestra plataforma.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('ticket')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all',
            activeTab === 'ticket' ? 'bg-white text-brand-azul shadow-sm' : 'text-gray-500 hover:text-gray-900'
          )}
        >
          <Ticket className="h-4 w-4" />
          Comprar Entrada
        </button>
        <button
          onClick={() => setActiveTab('evento')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all',
            activeTab === 'evento' ? 'bg-white text-brand-rosa shadow-sm' : 'text-gray-500 hover:text-gray-900'
          )}
        >
          <PartyPopper className="h-4 w-4" />
          Solicitar Evento
        </button>
      </div>

      {/* Contenido interactivo según pestaña */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'ticket' ? (
            <SectionCard titulo="Guía paso a paso: Cómo comprar una entrada (Reservar)" icon={Ticket}>
              <div className="space-y-5 mt-4">
                {[
                  {
                    step: '1',
                    title: 'Inicia el proceso de reserva',
                    desc: 'Haz clic en el botón "Reservar" o "Comprar entrada" en la barra de navegación pública del sitio web, o dirígete directamente al cotizador rápido en la landing page.',
                    icon: Calendar,
                  },
                  {
                    step: '2',
                    title: 'Selecciona la fecha y el turno',
                    desc: 'Elige el día que deseas asistir y escoge uno de nuestros turnos de juego disponibles. Verifica la información del aforo restante en tiempo real.',
                    icon: Layers,
                  },
                  {
                    step: '3',
                    title: 'Registra los datos de los niños',
                    desc: 'Introduce los nombres, apellidos y edades de los menores que asistirán. Esto es indispensable para garantizar el control y seguridad dentro de las zonas de juego.',
                    icon: FileCheck,
                  },
                  {
                    step: '4',
                    title: 'Confirma y visualiza tu ticket',
                    desc: 'Finaliza el registro. Tu reserva se creará en estado "Pendiente" y podrás ver tu código QR y detalles en tu sección "Mis reservas". Al llegar a recepción, muestra tu código QR y realiza el pago en caja.',
                    icon: CheckCircle,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 relative group">
                    {item.step !== '4' && (
                      <div className="absolute left-5 top-10 bottom-[-20px] w-[2px] bg-gray-100 group-hover:bg-brand-azul/20 transition-colors" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-brand-azul/10 flex items-center justify-center shrink-0 border border-brand-azul/10 text-brand-azul font-bold text-sm">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : (
            <SectionCard titulo="Guía paso a paso: Cómo solicitar tu evento privado" icon={PartyPopper}>
              <div className="space-y-5 mt-4">
                {[
                  {
                    step: '1',
                    title: 'Explora nuestros paquetes de fiesta',
                    desc: 'Ingresa a la sección "Celebraciones" en el sitio público para revisar los paquetes disponibles (Básico, Premium, VIP), qué incluye cada uno y sus capacidades.',
                    icon: Calendar,
                  },
                  {
                    step: '2',
                    title: 'Completa el formulario wizard de cotización',
                    desc: 'Selecciona "Solicitar evento" para abrir nuestro asistente interactivo. Define la fecha deseada, salón de juego, número aproximado de invitados, temáticas favoritas y adicionales de comida o animación.',
                    icon: Layers,
                  },
                  {
                    step: '3',
                    title: 'Envía tu solicitud de evento',
                    desc: 'Finaliza los pasos del formulario wizard para registrar la solicitud. Esta quedará guardada en tu panel bajo "Mis eventos" en estado "Solicitado".',
                    icon: FileCheck,
                  },
                  {
                    step: '4',
                    title: 'Espera la confirmación de nuestro equipo',
                    desc: 'Un coordinador de eventos revisará la disponibilidad y se contactará contigo para validar detalles del anticipo/depósito para confirmar definitivamente la celebración.',
                    icon: CheckCircle,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 relative group">
                    {item.step !== '4' && (
                      <div className="absolute left-5 top-10 bottom-[-20px] w-[2px] bg-gray-100 group-hover:bg-brand-rosa/20 transition-colors" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-brand-rosa/10 flex items-center justify-center shrink-0 border border-brand-rosa/10 text-brand-rosa font-bold text-sm">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* FAQ & Soporte */}
        <div className="space-y-5">
          <SectionCard titulo="Preguntas frecuentes" icon={HelpCircle}>
            <div className="divide-y divide-gray-100 mt-2">
              {faqs.map((faq, idx) => {
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
                      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed animate-slide-down">
                        {faq.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* Banner de soporte directo */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0">
                <MessageCircle className="h-4.5 w-4.5 fill-white text-green-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">¿Aún necesitas ayuda?</p>
                <p className="text-[10px] text-green-800">Soporte por WhatsApp activo</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Si tienes problemas con tus reservas o requieres asistencia inmediata, habla directamente con nuestro equipo de atención al cliente.
            </p>
            <a
              href="https://wa.me/51987654321?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20área%20de%20cliente"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-xs font-bold text-white transition-colors shadow-sm"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              Chatear ahora
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
