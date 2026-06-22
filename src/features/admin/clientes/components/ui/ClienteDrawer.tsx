'use client'

import { useRouter } from 'next/navigation'
import { X, Crown, Phone, Mail, BadgeCheck, CalendarDays, Clock, Ticket, PartyPopper, CreditCard, Star, RefreshCw, Loader2 } from 'lucide-react'
import { Cliente } from '../../types'
import { useMutacionesCliente } from '../../hooks/useClientesData'
import { ClienteAvatar } from './ClienteAvatar'
import { VipBadge, VisitasBadge, OrigenBadge, SegmentoBadge } from './ClienteBadges'
import { DetalleRow } from './DetalleRow'
import { StatCard } from './StatCard'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ClienteDrawerProps {
  cliente: Cliente | null
  onClose: () => void
}

export function ClienteDrawer({ cliente, onClose }: ClienteDrawerProps) {
  const router = useRouter()
  const { toggleVip, registrarVisita } = useMutacionesCliente(cliente?.id)

  const handleToggleVip = () => {
    if (!cliente) return
    toggleVip.mutate(
      { id: cliente.id, esVip: cliente.esVip },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const handleRegistrarVisita = () => {
    if (!cliente) return
    router.push(`/admin/ventas?tab=nueva&clienteId=${cliente.id}`)
  }

  if (!cliente) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 h-full w-[400px] max-w-full bg-gray-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in border-l border-gray-100">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-gray-900">Perfil del cliente</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
            <ClienteAvatar
              nombre={cliente.nombreCompleto}
              fotoPerfil={undefined}
              esVip={cliente.esVip}
              size="lg"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-gray-900 truncate">
                  {cliente.nombreCompleto}
                </h3>
                {cliente.esVip && <VipBadge descuento={cliente.descuentoVip} />}
              </div>
              <p className="text-sm text-gray-500 truncate">{cliente.correo}</p>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <OrigenBadge origen={cliente.origen} />
                <SegmentoBadge segmento={cliente.segmentoCodigo} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Ticket}
              label="Visitas"
              value={cliente.contadorVisitas}
              color="bg-brand-azul/10 text-brand-azul"
            />
            <StatCard
              icon={PartyPopper}
              label="Eventos"
              value={0}
              color="bg-brand-rosa/10 text-brand-rosa"
            />
            <StatCard
              icon={CreditCard}
              label="Pagos"
              value={0}
              color="bg-brand-menta/20 text-emerald-700"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Acciones
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'rounded-xl gap-1.5 text-xs font-semibold',
                  cliente.esVip
                    ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'
                    : 'border-brand-amarillo/40 text-yellow-700 hover:bg-brand-amarillo/10'
                )}
                onClick={handleToggleVip}
                disabled={toggleVip.isPending}
              >
                {toggleVip.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Crown className="h-3.5 w-3.5" />
                )}
                {cliente.esVip ? 'Quitar VIP' : 'Hacer VIP'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 text-xs font-semibold col-span-2 border-brand-azul/30 text-brand-azul hover:bg-brand-azul/8"
                onClick={handleRegistrarVisita}
                disabled={registrarVisita.isPending}
              >
                {registrarVisita.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Registrar visita manual
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Información
            </p>
            <DetalleRow icon={Phone} label="Teléfono" value={cliente.telefono} />
            <DetalleRow icon={Mail} label="Correo" value={cliente.correo} />
            <DetalleRow
              icon={BadgeCheck}
              label={cliente.tipoDocumentoCodigo}
              value={cliente.numeroDocumento}
            />
            <Separator className="my-1" />
            <DetalleRow
              icon={Star}
              label="Descuento VIP"
              value={cliente.descuentoVip ? `${cliente.descuentoVip}%` : null}
            />
            <DetalleRow
              icon={Clock}
              label="Última visita"
              value={cliente.ultimaVisitaAt ? formatDate(cliente.ultimaVisitaAt) : null}
            />
            <DetalleRow
              icon={CalendarDays}
              label="Registrado"
              value={formatDate(cliente.creadoEn)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Visitas
            </p>
            <VisitasBadge visitas={cliente.contadorVisitas} />
          </div>
        </div>
      </aside>
    </>
  )
}
