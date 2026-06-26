import Link from 'next/link'
import { Ticket } from 'lucide-react'

export function EmptyReservas() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4 px-4">
      <div className="w-14 h-14 bg-brand-azul/10 rounded-2xl flex items-center justify-center">
        <Ticket className="h-7 w-7 text-brand-azul" />
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-900">Sin reservas próximas</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Reserva tu entrada para visitar Kiki y Lala.
        </p>
      </div>
      <Link
        href="/cliente/reservar"
        className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-azul text-white rounded-xl text-sm font-bold hover:bg-brand-azul/90 transition-colors"
      >
        <Ticket className="h-4 w-4" />
        Reservar ahora
      </Link>
    </div>
  )
}
