import Link from 'next/link'
import { Ticket, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function JuegosCta() {
  return (
    <section className="py-16 bg-brand-azul-dark text-white">
      <div className="container max-w-3xl mx-auto px-4 text-center space-y-5">
        <Gamepad2 className="h-12 w-12 mx-auto text-white/80" />
        <h2 className="text-3xl font-bold">¿Listo para jugar?</h2>
        <p className="text-white/80">
          Compra tu entrada en línea y garantiza tu ingreso.
        </p>
        <Button asChild size="lg" variant="brand" className="px-10 gap-2">
          <Link href="/cliente/reservar">
            <Ticket className="h-5 w-5" />
            Reservar ahora
          </Link>
        </Button>
      </div>
    </section>
  )
}
