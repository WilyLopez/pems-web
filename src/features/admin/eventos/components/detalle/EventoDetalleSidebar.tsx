import Link from 'next/link'
import {
  User,
  CalendarDays,
  MessageCircle,
  FileText,
  TrendingUp,
  CalendarClock,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { EventoPrivado } from '../../types'
import { buildWhatsAppLink } from '../../shared/buildWhatsAppLink'
import { InfoRow } from '@/components/common/InfoRow'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/config/routes'

interface EventoDetalleSidebarProps {
  evento: EventoPrivado
  onVerContrato: () => void
  onVerRentabilidad: () => void
  onCancelar: () => void
}

export function EventoDetalleSidebar({
  evento,
  onVerContrato,
  onVerRentabilidad,
  onCancelar,
}: EventoDetalleSidebarProps) {
  const puedeGestionar =
    evento.estado === 'SOLICITADA' || evento.estado === 'CONFIRMADA'

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Cliente
        </h3>
        <InfoRow icon={User} label="Nombre" value={evento.nombreCliente} />
        <InfoRow icon={User} label="Correo" value={evento.correoCliente} />
        <InfoRow icon={User} label="Telefono" value={evento.telefonoCliente} />
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl gap-1.5 justify-start text-xs"
          asChild
        >
          <Link
            href={`${ADMIN_ROUTES.clientes}?search=${encodeURIComponent(evento.nombreCliente)}`}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Ver cliente
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Información
        </h3>
        <InfoRow
          icon={CalendarDays}
          label="Solicitado el"
          value={evento.fechaCreacion ? formatDate(evento.fechaCreacion) : null}
        />
        {evento.usuarioGestor && (
          <InfoRow
            icon={User}
            label="Gestionado por"
            value={evento.usuarioGestor}
          />
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
          Acciones rapidas
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl gap-1.5 justify-start text-xs"
          asChild
        >
          <Link href={`${ADMIN_ROUTES.reservas}?fecha=${evento.fechaEvento}`}>
            <CalendarDays className="h-4 w-4" /> Ver reservas del dia
          </Link>
        </Button>
        {evento.telefonoCliente && (
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-xl gap-1.5 justify-start text-xs text-green-700 border-green-200 hover:bg-green-50"
            asChild
          >
            <a
              href={buildWhatsAppLink(
                evento.telefonoCliente,
                evento.nombreCliente,
                evento.fechaEvento
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp al cliente
            </a>
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl gap-1.5 justify-start text-xs"
          onClick={onVerContrato}
        >
          <FileText className="h-4 w-4" /> Ver contrato
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl gap-1.5 justify-start text-xs"
          onClick={onVerRentabilidad}
        >
          <TrendingUp className="h-4 w-4" /> Ver rentabilidad
        </Button>
        {puedeGestionar && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled
              title="Disponible próximamente"
              className="w-full rounded-xl gap-1.5 justify-start text-xs text-amber-700 border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalendarClock className="h-4 w-4" /> Reprogramar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-xl gap-1.5 justify-start text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={onCancelar}
            >
              <XCircle className="h-4 w-4" /> Cancelar evento
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
