// app/(public)/nosotros/page.tsx

import { Metadata } from 'next'
import {
  Heart,
  Shield,
  Star,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
  Users,
  Award,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { faqService } from '@/services/faq.service'
import { FaqAccordion } from '@/components/public/faq/FaqAccordion'

export const revalidate = 300

export const metadata: Metadata = { title: 'Nosotros | Kiki y Lala' }

async function getFaqs() {
  try {
    return await faqService.listarPublico()
  } catch {
    return []
  }
}

export default async function NosotrosPage() {
  const faqs = await getFaqs()

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-brand-rosa/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-brand-azul/20 rounded-full blur-3xl" />
        </div>
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-5 relative">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto animate-float">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-black leading-tight">
            Somos <span className="text-brand-azul">Kiki</span> y{' '}
            <span className="text-brand-rosa">Lala</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Más de 6 años creando sonrisas, aventuras y recuerdos inolvidables
            para las familias de Chiclayo.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20">
                Nuestra historia
              </Badge>
              <h2 className="text-4xl font-black text-gray-900">
                Nacimos de un sueño familiar
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Kiki y Lala nació en 2018 con una misión clara: crear un
                  espacio donde los niños pudieran ser completamente libres de
                  jugar, reír y descubrir el mundo de una manera segura y
                  divertida.
                </p>
                <p>
                  Lo que comenzó como un pequeño local con 5 atracciones, hoy es
                  uno de los centros de entretenimiento infantil más queridos de
                  Chiclayo, con más de 15 zonas de juego y cientos de eventos
                  realizados.
                </p>
                <p>
                  Nuestros personajes Kiki y Lala representan la amistad, la
                  diversión y la magia de la infancia.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Users,
                  n: '+500',
                  label: 'Familias atendidas',
                  bg: 'bg-brand-azul/10',
                },
                {
                  icon: Award,
                  n: '+200',
                  label: 'Eventos realizados',
                  bg: 'bg-brand-rosa/10',
                },
                {
                  icon: Star,
                  n: '6+',
                  label: 'Años de experiencia',
                  bg: 'bg-brand-amarillo/15',
                },
                {
                  icon: Heart,
                  n: '4.9',
                  label: 'Calificación promedio',
                  bg: 'bg-brand-menta/20',
                },
              ].map(({ icon: Icon, n, label, bg }) => (
                <div
                  key={label}
                  className={`${bg} rounded-2xl p-6 text-center`}
                >
                  <Icon className="h-6 w-6 text-brand-azul mx-auto mb-2" />
                  <div className="text-3xl font-black text-gray-900">{n}</div>
                  <div className="text-xs text-gray-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">
              Nuestros valores
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                titulo: 'Seguridad primero',
                desc: 'Todas nuestras instalaciones cumplen estrictos estándares de seguridad. Revisión diaria de equipos y supervisión constante del personal.',
                iconColor: 'text-brand-azul',
                iconBg: 'bg-brand-azul/10',
              },
              {
                icon: Heart,
                titulo: 'Amor por los niños',
                desc: 'Cada detalle del local está pensado para que los niños se sientan felices, libres y especiales. Su sonrisa es nuestra mayor recompensa.',
                iconColor: 'text-brand-rosa',
                iconBg: 'bg-brand-rosa/10',
              },
              {
                icon: Star,
                titulo: 'Excelencia en servicio',
                desc: 'Nos comprometemos a superar las expectativas en cada visita. Personal capacitado, instalaciones limpias y atención personalizada.',
                iconColor: 'text-yellow-600',
                iconBg: 'bg-brand-amarillo/15',
              },
            ].map(({ icon: Icon, titulo, desc, iconColor, iconBg }) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-card"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              Preguntas frecuentes
            </h2>
            <p className="text-gray-600">
              Todo lo que necesitas saber antes de visitarnos
            </p>
          </div>
          {faqs.length > 0 ? (
            <FaqAccordion faqs={faqs} showSearch={false} />
          ) : (
            <p className="text-center text-gray-500">
              No hay preguntas frecuentes disponibles.
            </p>
          )}
        </div>
      </section>

      {/* Ubicacion y contacto */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-black">¿Dónde estamos?</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: MapPin,
                    iconBg: 'bg-brand-azul/20',
                    iconColor: 'text-brand-azul',
                    label: 'Dirección',
                    content: 'Av. Principal 123, Chiclayo, Perú',
                  },
                  {
                    icon: Clock,
                    iconBg: 'bg-brand-rosa/20',
                    iconColor: 'text-brand-rosa',
                    label: 'Horarios',
                    content:
                      'Lun\u2013Vie: 10am \u2013 8pm\nSab\u2013Dom y Feriados: 9am \u2013 9pm',
                  },
                  {
                    icon: Phone,
                    iconBg: 'bg-brand-menta/20',
                    iconColor: 'text-brand-menta',
                    label: 'WhatsApp',
                    content: '+51 999 999 999',
                    href: 'https://wa.me/51999999999',
                  },
                ].map(
                  ({ icon: Icon, iconBg, iconColor, label, content, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="font-bold">{label}</p>
                        {href ? (
                          <a
                            href={href}
                            className="text-brand-azul hover:underline text-sm"
                          >
                            {content}
                          </a>
                        ) : (
                          <p className="text-white/70 text-sm whitespace-pre-line">
                            {content}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-amarillo/20 flex items-center justify-center shrink-0">
                    <Instagram className="h-5 w-5 text-brand-amarillo" />
                  </div>
                  <div>
                    <p className="font-bold">Redes sociales</p>
                    <div className="flex gap-3 mt-1">
                      <a
                        href="#"
                        className="flex items-center gap-1 text-brand-azul hover:underline text-sm"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                        Instagram
                      </a>
                      <a
                        href="#"
                        className="flex items-center gap-1 text-brand-azul hover:underline text-sm"
                      >
                        <Facebook className="h-3.5 w-3.5" />
                        Facebook
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white rounded-full font-bold gap-2"
              >
                <a
                  href="https://wa.me/51999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Escríbenos por WhatsApp
                </a>
              </Button>
            </div>

            <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[280px]">
              <div className="text-center space-y-3 p-8">
                <MapPin className="h-10 w-10 text-brand-azul mx-auto" />
                <p className="font-semibold text-white">Ubicación en el mapa</p>
                <p className="text-white/60 text-sm">
                  Av. Principal 123, Chiclayo, Perú
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 rounded-full"
                >
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir en Google Maps
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
