import { Metadata } from 'next'
import {
  Heart,
  Shield,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Users,
  Award,
  Mail,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { faqService } from '@/services/faq.service'
import { FaqAccordion } from '@/components/public/faq/FaqAccordion'
import type { ConfiguracionPublica } from '@/types/configuracion-publica.types'

export const revalidate = 300

export const metadata: Metadata = { title: 'Nosotros | Kiki y Lala' }

async function getFaqs() {
  try {
    return await faqService.listarPublico()
  } catch {
    return []
  }
}

async function getConfig(): Promise<ConfiguracionPublica | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/configuracion/publica`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export default async function NosotrosPage() {
  const [faqs, config] = await Promise.all([getFaqs(), getConfig()])

  const direccion = config?.direccion ?? 'Chiclayo, Perú'
  const whatsappNumero = config?.whatsapp?.replace(/\D/g, '')
  const whatsappUrl = whatsappNumero ? `https://wa.me/${whatsappNumero}` : null
  const telefono = config?.telefono
  const correo = config?.correo
  const horarioSemana = config?.horarioSemana ?? 'Lun–Vie: 10am – 8pm'
  const horarioFinDeSemana = config?.horarioFinDeSemana ?? 'Sáb–Dom: 9am – 9pm'

  const mapsUrl =
    config?.googleMapsUrl
      ? config.googleMapsUrl
      : `https://maps.google.com?q=${encodeURIComponent(direccion)}`

  return (
    <>
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
                  Kiki y Lala nació en 2018 con una misión clara: crear un espacio donde los niños
                  pudieran ser completamente libres de jugar, reír y descubrir el mundo de una
                  manera segura y divertida.
                </p>
                <p>
                  Lo que comenzó como un pequeño local con 5 atracciones, hoy es uno de los
                  centros de entretenimiento infantil más queridos de Chiclayo, con
                  más de 15 zonas de juego y cientos de eventos realizados.
                </p>
                <p>
                  Nuestros personajes Kiki y Lala representan la amistad, la diversión y la magia
                  de la infancia.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, n: '+500', label: 'Familias atendidas', bg: 'bg-brand-azul/10' },
                { icon: Award, n: '+200', label: 'Eventos realizados', bg: 'bg-brand-rosa/10' },
                { icon: Star, n: '2+', label: 'Años de experiencia', bg: 'bg-brand-amarillo/15' },
                { icon: Heart, n: '4.9', label: 'Calificación promedio', bg: 'bg-brand-menta/20' },
              ].map(({ icon: Icon, n, label, bg }) => (
                <div key={label} className={`${bg} rounded-2xl p-6 text-center`}>
                  <Icon className="h-6 w-6 text-brand-azul mx-auto mb-2" />
                  <div className="text-3xl font-black text-gray-900">{n}</div>
                  <div className="text-xs text-gray-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">Nuestros valores</h2>
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
              <div key={titulo} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-card">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-white">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-2">Preguntas frecuentes</h2>
            <p className="text-gray-600">Todo lo que necesitas saber antes de visitarnos</p>
          </div>
          {faqs.length > 0 ? (
            <FaqAccordion faqs={faqs} showSearch={false} />
          ) : (
            <p className="text-center text-gray-500">No hay preguntas frecuentes disponibles.</p>
          )}
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-black">¿Dónde estamos?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-azul/20 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-brand-azul" />
                  </div>
                  <div>
                    <p className="font-bold">Dirección</p>
                    <p className="text-white/70 text-sm">
                      {direccion}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-rosa/20 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-brand-rosa" />
                  </div>
                  <div>
                    <p className="font-bold">Horarios</p>
                    <p className="text-white/70 text-sm whitespace-pre-line">
                      {horarioSemana}{'\n'}{horarioFinDeSemana}
                    </p>
                  </div>
                </div>

                {(telefono || whatsappUrl) && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-menta/20 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-brand-menta" />
                    </div>
                    <div>
                      <p className="font-bold">Teléfono / WhatsApp</p>
                      {whatsappUrl ? (
                        <a href={whatsappUrl} className="text-brand-azul hover:underline text-sm">
                          {telefono ?? config?.whatsapp}
                        </a>
                      ) : (
                        <p className="text-white/70 text-sm">{telefono}</p>
                      )}
                    </div>
                  </div>
                )}

                {correo && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-amarillo/20 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-brand-amarillo" />
                    </div>
                    <div>
                      <p className="font-bold">Correo</p>
                      <a href={`mailto:${correo}`} className="text-brand-azul hover:underline text-sm">
                        {correo}
                      </a>
                    </div>
                  </div>
                )}

                {(config?.instagramUrl || config?.facebookUrl) && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-rosa/20 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-brand-rosa" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Redes sociales</p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {config?.instagramUrl && (
                          <a
                            href={config.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-azul hover:underline text-sm"
                          >
                            Instagram
                          </a>
                        )}
                        {config?.facebookUrl && (
                          <a
                            href={config.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-azul hover:underline text-sm"
                          >
                            Facebook
                          </a>
                        )}
                        {config?.tiktokUrl && (
                          <a
                            href={config.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-azul hover:underline text-sm"
                          >
                            TikTok
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {whatsappUrl && (
                <Button
                  asChild
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full font-bold gap-2"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Escríbenos por WhatsApp
                  </a>
                </Button>
              )}
            </div>

            <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[280px]">
              <div className="text-center space-y-3 p-8">
                <MapPin className="h-10 w-10 text-brand-azul mx-auto" />
                <p className="font-semibold text-white">Ubicación en el mapa</p>
                <p className="text-white/60 text-sm">
                  {direccion}
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 rounded-full"
                >
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
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
