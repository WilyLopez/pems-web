import { Ticket, PartyPopper, CalendarDays, History } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function QuickActions() {
  const links = [
    { href: '/reservar',         icon: Ticket,      label: 'Crear reserva',   color: 'bg-brand-azul/10 text-brand-azul' },
    { href: '/celebraciones/solicitar', icon: PartyPopper,  label: 'Solicitar evento', color: 'bg-brand-rosa/10 text-brand-rosa' },
    { href: '/cliente/mis-eventos',  icon: CalendarDays, label: 'Mis eventos',   color: 'bg-purple-100 text-purple-600' },
    { href: '/cliente/mis-reservas', icon: History,      label: 'Historial',     color: 'bg-gray-100 text-gray-600' },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <p className="text-sm font-bold text-gray-900 mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-brand-azul/30 hover:shadow-sm transition-all group"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', l.color)}>
              <l.icon className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-brand-azul text-center transition-colors leading-tight">
              {l.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
