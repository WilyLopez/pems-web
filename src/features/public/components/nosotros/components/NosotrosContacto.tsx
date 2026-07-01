import { MapPin, Clock, Phone, Mail, MessageCircle } from 'lucide-react'
import { Button } from '../../../../../components/ui/Button'
import { ConfiguracionPublica } from '../../../../../types/configuracion-publica.types'
import { useSedePublica } from '../../../hooks/useSedePublica'
import { MapaLeaflet } from './MapaLeaflet'

interface NosotrosContactoProps {
  config: ConfiguracionPublica | undefined
}

export function NosotrosContacto({ config }: NosotrosContactoProps) {
  const { data: sede, isLoading: loadingSede } = useSedePublica()

  const direccion = config?.direccion ?? 'Chiclayo, Perú'
  const whatsappNumero = config?.whatsapp?.replace(/\D/g, '')
  const whatsappUrl = whatsappNumero ? `https://wa.me/${whatsappNumero}` : null
  const telefono = config?.telefono
  const correo = config?.correo
  const horarioSemana = config?.horarioSemana ?? 'Lun–Vie: 10am – 8pm'
  const horarioFinDeSemana = config?.horarioFinDeSemana ?? 'Sáb–Dom: 9am – 9pm'

  const mapsUrl = config?.googleMapsUrl
    ? config.googleMapsUrl
    : `https://maps.google.com?q=${encodeURIComponent(direccion)}`

  const latitud = sede?.latitud
  const longitud = sede?.longitud

  return (
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
                  <p className="text-white/70 text-sm">{direccion}</p>
                </div>
              </div>

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

              {(config?.instagramUrl || config?.facebookUrl || config?.tiktokUrl) && (
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
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
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
              <Button
                asChild
                className="bg-green-550 hover:bg-green-600 text-white rounded-full font-bold gap-2 transition-all hover:scale-105"
              >
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

          <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-center min-h-[340px]">
            {loadingSede ? (
              <div className="text-center space-y-3 p-8">
                <div className="w-8 h-8 border-4 border-brand-azul border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white/60 text-sm">Cargando mapa...</p>
              </div>
            ) : latitud != null && longitud != null ? (
              <MapaLeaflet
                latitud={latitud}
                longitud={longitud}
                nombre={config?.nombreNegocio ?? 'Kiki y Lala'}
                direccion={direccion}
                googleMapsUrl={mapsUrl}
                horarioSemana={horarioSemana}
                horarioFinDeSemana={horarioFinDeSemana}
              />
            ) : (
              <div className="text-center space-y-3 p-8">
                <MapPin className="h-10 w-10 text-brand-azul mx-auto" />
                <p className="font-semibold text-white">Ubicación en el mapa</p>
                <p className="text-white/60 text-sm">{direccion}</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    Abrir en Google Maps
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
