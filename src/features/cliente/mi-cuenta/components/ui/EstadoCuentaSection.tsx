import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { Reserva } from '../../../shared/types'
import { SectionCard } from '../../../shared/components/SectionCard'
import { formatCurrency } from '@/lib/utils'

interface EstadoCuentaSectionProps {
  reservas: Reserva[]
}

export function EstadoCuentaSection({ reservas }: EstadoCuentaSectionProps) {
  const pendientes = reservas.filter((r) => r.estado === 'PENDIENTE')
  // Note: the implementation plan notes that totalPagado in reserves is the total amount (pre-payment required to complete or the total cost).
  // The client only needs to pay if they have pending bookings.
  const totalPendiente = pendientes.reduce((s, r) => s + r.totalPagado, 0)

  return (
    <SectionCard titulo="Estado de cuenta" icon={CreditCard}>
      {pendientes.length === 0 ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">
              Sin pagos pendientes
            </p>
            <p className="text-xs text-green-700">Tu cuenta está al día.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                {pendientes.length} pagos pendientes
              </p>
              <p className="text-xs text-amber-700">
                Total:{' '}
                <span className="font-bold">
                  {formatCurrency(totalPendiente)}
                </span>{' '}
                · Presenta tu ticket en caja.
              </p>
            </div>
          </div>
          <Link
            href="/cliente/mis-reservas"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-azul/40 hover:text-brand-azul transition-all"
          >
            Ver reservas pendientes <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </SectionCard>
  )
}
