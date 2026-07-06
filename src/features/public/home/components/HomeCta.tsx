import Link from 'next/link'
import { Zap, Ticket } from 'lucide-react'
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
          Reserva tu entrada y vive un día de juegos, risas y aventuras sin
          límites.
        </p>
        <div className="flex justify-center">
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
        </div>
      </div>
    </section>
  )
}
