import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CtaInstituciones({
  whatsappUrl,
}: {
  whatsappUrl: string | null
}) {
  if (!whatsappUrl) return null

  const url = `${whatsappUrl}?text=${encodeURIComponent(
    'Hola, quiero cotizar un evento para mi colegio, empresa o institución.'
  )}`

  return (
    <section className="py-12 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="rounded-3xl bg-brand-menta/15 border border-brand-menta/40 px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-gray-900">
              ¿Organizas para un colegio, empresa o municipalidad?
            </h2>
            <p className="text-gray-600 max-w-xl">
              Recibimos grupos de hasta 60 niños con actividades dirigidas y
              coordinación completa. Cuéntanos tu fecha y te armamos una
              propuesta.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="whatsapp"
            className="px-8 gap-2 shrink-0"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Cotizar evento grupal
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
