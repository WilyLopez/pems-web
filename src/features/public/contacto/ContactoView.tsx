'use client'

import { Clock, Phone, Mail, MessageCircle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/features/public/shared/components/PageHero'
import { usePublicConfig } from '@/features/public/shared/hooks/usePublicConfig'
import { useHorarioAtencion } from '@/features/public/shared/hooks/useHorarioAtencion'
import { useSedesPublicas } from '@/features/public/shared/hooks/useSedesPublicas'
import { GoogleMapEmbed } from '@/features/public/shared/components/GoogleMapEmbed'

export function ContactoView() {
  const { data: config } = usePublicConfig()
  const { sedeActiva } = useSedesPublicas()
  const {
    horarioSemana: horarioSemanaOperacion,
    horarioFinDeSemana: horarioFinDeSemanaOperacion,
  } = useHorarioAtencion()

  const whatsappNumero = config?.whatsapp?.replace(/\D/g, '')
  const whatsappUrl = whatsappNumero ? `https://wa.me/${whatsappNumero}` : null
  const telefono = config?.telefono
  const correo = config?.correo
  const horarioSemana = horarioSemanaOperacion ?? 'Lun–Vie: 10am – 8pm'
  const horarioFinDeSemana = horarioFinDeSemanaOperacion ?? 'Sáb–Dom: 9am – 9pm'
  const googleMapsEmbedUrl = sedeActiva?.googleMapsEmbedUrl

  return (
    <>
      <PageHero
        tone="light"
        badge="Contacto"
        badgeColor="azul"
        icon={Phone}
        accentClassName="bg-brand-gradient"
        title={
          <>
            Hablemos y{' '}
            <span className="text-brand-azul-dark">planifiquemos tu visita</span>
          </>
        }
        description="Estamos en Chiclayo, listos para resolver tus dudas y recibirte. Escríbenos o pásate a conocernos."
        actions={
          whatsappUrl ? (
            <Button asChild size="lg" variant="whatsapp" className="px-8 gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Escríbenos por WhatsApp
              </a>
            </Button>
          ) : undefined
        }
      />

      <section className="py-20 bg-gray-900 text-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">¿Dónde estamos?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-rosa/20 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-brand-rosa" />
                  </div>
                  <div>
                    <p className="font-bold">Horarios</p>
                    <p className="text-white/70 text-sm whitespace-pre-line">
                      {horarioSemana}
                      {'\n'}
                      {horarioFinDeSemana}
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
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-azul hover:underline text-sm"
                        >
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
                      <a
                        href={`mailto:${correo}`}
                        className="text-brand-azul hover:underline text-sm"
                      >
                        {correo}
                      </a>
                    </div>
                  </div>
                )}

                {(config?.instagramUrl ||
                  config?.facebookUrl ||
                  config?.tiktokUrl) && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-rosa/20 flex items-center justify-center shrink-0">
                      <svg
                        className="h-5 w-5 text-brand-rosa"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <circle cx="12" cy="12" r="4" />
                        <circle
                          cx="17.5"
                          cy="6.5"
                          r="0.5"
                          fill="currentColor"
                          stroke="none"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Redes sociales</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {config?.instagramUrl && (
                          <a
                            href={config.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-brand-azul hover:text-brand-rosa transition-colors text-sm font-semibold"
                          >
                            Instagram
                          </a>
                        )}
                        {config?.facebookUrl && (
                          <a
                            href={config.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-brand-azul hover:text-brand-azul-dark transition-colors text-sm font-semibold"
                          >
                            Facebook
                          </a>
                        )}
                        {config?.tiktokUrl && (
                          <a
                            href={config.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-brand-azul hover:text-brand-rosa transition-colors text-sm font-semibold"
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
                <Button asChild variant="whatsapp" className="gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Escríbenos por WhatsApp
                  </a>
                </Button>
              )}
            </div>

            <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 flex flex-col min-h-[340px]">
              {googleMapsEmbedUrl ? (
                <div className="flex-1 min-h-[300px]">
                  <GoogleMapEmbed
                    src={googleMapsEmbedUrl}
                    title={`Ubicación de ${config?.nombreNegocio ?? 'Kiki y Lala'}`}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-8">
                  <MapPin className="h-10 w-10 text-brand-azul" />
                  <p className="font-semibold text-white">
                    Ubicación en el mapa
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
