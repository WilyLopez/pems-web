import { PartyPopper, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/features/public/shared/components/PageHero'

export function CelebracionesHero({
  whatsappUrl,
}: {
  whatsappUrl: string | null
}) {
  return (
    <PageHero
      tone="light"
      badge="Celebraciones Privadas"
      badgeColor="rosa"
      accentClassName="bg-brand-gradient"
      backgroundClassName="bg-gradient-to-br from-brand-rosa/10 via-white to-brand-amarillo/10"
      title={
        <>
          Celebraciones mágicas en{' '}
          <span className="text-brand-rosa">Kiki y Lala</span>
        </>
      }
      description="Organizamos cada detalle para que tú solo tengas que disfrutar. Desde cumpleaños hasta eventos temáticos."
      actions={
        <>
          <Button asChild size="lg" variant="brand" className="px-8 gap-2">
            <a href="#paquetes">
              <PartyPopper className="h-5 w-5" />
              Ver paquetes
            </a>
          </Button>
          {whatsappUrl && (
            <Button
              asChild
              variant="whatsapp"
              size="lg"
              className="px-8 gap-2"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Phone className="h-5 w-5" />
                Cotizar por WhatsApp
              </a>
            </Button>
          )}
        </>
      }
    />
  )
}
