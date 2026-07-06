import Link from 'next/link'
import { PartyPopper, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CelebracionesCta({
  whatsappUrl,
}: {
  whatsappUrl: string | null
}) {
  return (
    <section className="py-16 bg-brand-gradient-dark text-white">
      <div className="container max-w-3xl mx-auto px-4 text-center space-y-5">
        <h2 className="text-3xl font-bold">¿Tienes alguna duda?</h2>
        <p className="text-white/80">
          Nuestro equipo está listo para ayudarte a planificar la celebración
          perfecta.
        </p>
        {whatsappUrl ? (
          <Button asChild size="lg" variant="whatsapp" className="px-10 gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Hablar con nosotros
            </a>
          </Button>
        ) : (
          <Button asChild size="lg" variant="brand" className="px-10 gap-2">
            <Link href="/cliente/celebraciones/solicitar">
              <PartyPopper className="h-5 w-5" />
              Solicitar información
            </Link>
          </Button>
        )}
      </div>
    </section>
  )
}
