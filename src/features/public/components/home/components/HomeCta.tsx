import Link from 'next/link'
import { Zap, Ticket, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function HomeCta() {
  return (
    <section className="py-20 bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-azul/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-rosa/20 rounded-full blur-3xl" />
      </div>
      <div className="container max-w-3xl mx-auto px-4 text-center relative space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto animate-float">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-black">
          ¿Listo para la diversión?
        </h2>
        <p className="text-white/70 text-lg">
          Reserva tu próxima visita o empieza a planificar la celebración
          perfecta.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-10 h-12 text-base gap-2"
          >
            <Link href="/cliente/reservar">
              <Ticket className="h-5 w-5" />
              Reservar ahora
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full px-10 h-12 text-base gap-2"
          >
            <Link href="/celebraciones">
              <PartyPopper className="h-5 w-5" />
              Ver Celebraciones
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
