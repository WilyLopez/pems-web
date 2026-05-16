// components/admin/clientes/ClienteDrawer.tsx

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  X,
  Crown,
  Phone,
  Mail,
  MapPin,
  Building2,
  BadgeCheck,
  CalendarDays,
  Clock,
  Ticket,
  PartyPopper,
  CreditCard,
  UserCheck,
  UserX,
  Star,
  RefreshCw,
  Loader2,
} from 'lucide-react'

import { Cliente } from '@/types/cliente.types'
import { clienteService } from '@/services/cliente.service'
import { ClienteAvatar } from './ClienteAvatar'
import {
  VipBadge,
  EstadoBadge,
  VerificadoBadge,
  TipoBadge,
  VisitasBadge,
} from './ClienteBadges'

import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ClienteDrawerProps {
  cliente: Cliente | null
  onClose: () => void
}

function DetalleRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null | React.ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <div className="text-sm text-gray-900 mt-0.5 truncate">{value}</div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

export function ClienteDrawer({ cliente, onClose }: ClienteDrawerProps) {
  const queryClient = useQueryClient()

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ['clientes'] })

  const toggleActivo = useMutation({
    mutationFn: () =>
      cliente!.activo
        ? clienteService.desactivar(cliente!.id)
        : clienteService.activar(cliente!.id),
    onSuccess: () => {
      invalidar()
      toast.success(
        cliente!.activo ? 'Cliente desactivado.' : 'Cliente activado.'
      )
      onClose()
    },
    onError: () => toast.error('No se pudo actualizar el estado.'),
  })

  const toggleVip = useMutation({
    mutationFn: () =>
      cliente!.esVip
        ? clienteService.quitarVip(cliente!.id)
        : clienteService.hacerVip(cliente!.id, 10),
    onSuccess: () => {
      invalidar()
      toast.success(
        cliente!.esVip ? 'Estado VIP removido.' : 'Cliente promovido a VIP.'
      )
      onClose()
    },
    onError: () => toast.error('No se pudo actualizar estado VIP.'),
  })

  const registrarVisita = useMutation({
    mutationFn: () => clienteService.registrarVisita(cliente!.id),
    onSuccess: () => {
      invalidar()
      toast.success('Visita registrada manualmente.')
    },
    onError: () => toast.error('No se pudo registrar la visita.'),
  })

  if (!cliente) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[420px] bg-gray-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Cabecera */}
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

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 p-5">
          {/* Hero del cliente */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
            <ClienteAvatar
              nombre={cliente.nombre}
              fotoPerfil={cliente.fotoPerfil}
              esVip={cliente.esVip}
              size="lg"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-gray-900 truncate">
                  {cliente.nombre}
                </h3>
                {cliente.esVip && <VipBadge descuento={cliente.descuentoVip} />}
              </div>
              <p className="text-sm text-gray-500 truncate">{cliente.correo}</p>
              <div className="flex items-center gap-3 pt-0.5">
                <EstadoBadge activo={cliente.activo} />
                <TipoBadge tipo={cliente.tipoCliente} />
                <VerificadoBadge verificado={cliente.correoVerificado} />
              </div>
            </div>
          </div>

          {/* Estadisticas rapidas */}
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

          {/* Acciones rapidas */}
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
                onClick={() => toggleVip.mutate()}
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
                className={cn(
                  'rounded-xl gap-1.5 text-xs font-semibold',
                  cliente.activo
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-green-200 text-green-700 hover:bg-green-50'
                )}
                onClick={() => toggleActivo.mutate()}
                disabled={toggleActivo.isPending}
              >
                {toggleActivo.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : cliente.activo ? (
                  <UserX className="h-3.5 w-3.5" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                {cliente.activo ? 'Desactivar' : 'Activar'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 text-xs font-semibold col-span-2 border-brand-azul/30 text-brand-azul hover:bg-brand-azul/8"
                onClick={() => registrarVisita.mutate()}
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

          {/* Información de contacto */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Información
            </p>
            <DetalleRow
              icon={Phone}
              label="Teléfono"
              value={cliente.telefono}
            />
            <DetalleRow icon={Mail} label="Correo" value={cliente.correo} />
            <DetalleRow icon={BadgeCheck} label="DNI" value={cliente.dni} />
            <DetalleRow
              icon={MapPin}
              label="Dirección"
              value={cliente.direccion}
            />
            {cliente.tipoCliente === 'EMPRESA' && (
              <>
                <Separator className="my-1" />
                <DetalleRow icon={Building2} label="RUC" value={cliente.ruc} />
                <DetalleRow
                  icon={Building2}
                  label="Razón social"
                  value={cliente.razonSocial}
                />
              </>
            )}
            <Separator className="my-1" />
            <DetalleRow
              icon={Star}
              label="Descuento VIP"
              value={cliente.descuentoVip ? `${cliente.descuentoVip}%` : null}
            />
            <DetalleRow
              icon={CalendarDays}
              label="Fecha de nacimiento"
              value={
                cliente.fechaNacimiento
                  ? formatDate(cliente.fechaNacimiento)
                  : null
              }
            />
            <DetalleRow
              icon={CalendarDays}
              label="Registrado"
              value={formatDate(cliente.fechaCreacion)}
            />
            <DetalleRow
              icon={Clock}
              label="Último acceso"
              value={
                cliente.ultimoLogin ? formatDate(cliente.ultimoLogin) : 'Nunca'
              }
            />
          </div>
        </div>
      </aside>
    </>
  )
}
