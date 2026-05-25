'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building2,
  BadgeCheck,
  CalendarDays,
  Clock,
  Ticket,
  CreditCard,
  Crown,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
  Star,
  MessageSquare,
  Globe,
  ShoppingBag,
} from 'lucide-react'
import Link from 'next/link'

import { clienteService } from '@/services/cliente.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ClienteAvatar } from '@/components/admin/clientes/ClienteAvatar'
import {
  VipBadge,
  EstadoBadge,
  VerificadoBadge,
  TipoBadge,
  OrigenBadge,
  SegmentoBadge,
} from '@/components/admin/clientes/ClienteBadges'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

function InfoRow({
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
        <div className="text-sm text-gray-900 mt-0.5">{value}</div>
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const clienteId = Number(id)
  const queryClient = useQueryClient()

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => clienteService.obtener(clienteId),
  })

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['cliente', clienteId] })
    queryClient.invalidateQueries({ queryKey: ['clientes'] })
  }

  const toggleActivo = useMutation({
    mutationFn: () =>
      cliente!.activo
        ? clienteService.desactivar(clienteId)
        : clienteService.activar(clienteId),
    onSuccess: () => {
      invalidar()
      toast.success(cliente!.activo ? 'Cliente desactivado.' : 'Cliente activado.')
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  })

  const toggleVip = useMutation({
    mutationFn: () =>
      cliente!.esVip
        ? clienteService.quitarVip(clienteId)
        : clienteService.hacerVip(clienteId, 10),
    onSuccess: () => {
      invalidar()
      toast.success(cliente!.esVip ? 'Estado VIP removido.' : 'Cliente promovido a VIP.')
    },
    onError: () => toast.error('No se pudo actualizar estado VIP.'),
  })

  const registrarVisita = useMutation({
    mutationFn: () => clienteService.registrarVisita(clienteId),
    onSuccess: () => {
      invalidar()
      toast.success('Visita registrada.')
    },
    onError: () => toast.error('No se pudo registrar la visita.'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-azul" />
      </div>
    )
  }

  if (!cliente) return null

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Clientes', href: '/admin/clientes' },
          { label: cliente.nombre },
        ]}
      />

      <PageHeader
        title={cliente.nombre}
        description="Perfil CRM del cliente"
        actions={
          <Link href="/admin/clientes">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Hero */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
            <ClienteAvatar
              nombre={cliente.nombre}
              fotoPerfil={cliente.fotoPerfil}
              esVip={cliente.esVip}
              size="lg"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="font-black text-gray-900">{cliente.nombre}</h2>
              <p className="text-sm text-gray-500 truncate">{cliente.correo}</p>
              <div className="flex flex-wrap gap-1.5">
                <EstadoBadge activo={cliente.activo} />
                <TipoBadge tipo={cliente.tipoCliente} />
                <OrigenBadge origen={cliente.origenRegistro} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cliente.esVip && <VipBadge descuento={cliente.descuentoVip} />}
                <SegmentoBadge segmento={cliente.segmentoCliente} />
                <VerificadoBadge verificado={cliente.correoVerificado} />
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Ticket}
              label="Visitas"
              value={cliente.contadorVisitas}
              color="bg-brand-azul/10 text-brand-azul"
            />
            <StatCard
              icon={ShoppingBag}
              label="Total gastado"
              value={
                cliente.totalGastado
                  ? `S/ ${Number(cliente.totalGastado).toFixed(2)}`
                  : 'S/ 0.00'
              }
              color="bg-emerald-100 text-emerald-700"
            />
          </div>

          {/* Acciones */}
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
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-4">
          {/* Información de contacto */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Datos de contacto
            </p>
            <InfoRow icon={Mail} label="Correo" value={cliente.correo} />
            <InfoRow icon={Phone} label="Teléfono" value={cliente.telefono} />
            <InfoRow icon={BadgeCheck} label="DNI" value={cliente.dni} />
            <InfoRow icon={MapPin} label="Dirección" value={cliente.direccion} />
            {cliente.tipoCliente === 'EMPRESA' && (
              <>
                <Separator className="my-1" />
                <InfoRow icon={Building2} label="RUC" value={cliente.ruc} />
                <InfoRow icon={Building2} label="Razón social" value={cliente.razonSocial} />
              </>
            )}
          </div>

          {/* Actividad y CRM */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Actividad y CRM
            </p>
            <InfoRow
              icon={CalendarDays}
              label="Fecha de nacimiento"
              value={cliente.fechaNacimiento ? formatDate(cliente.fechaNacimiento) : null}
            />
            <InfoRow
              icon={Clock}
              label="Último acceso"
              value={cliente.ultimoLogin ? formatDate(cliente.ultimoLogin) : 'Sin acceso aún'}
            />
            <InfoRow
              icon={CalendarDays}
              label="Última visita registrada"
              value={cliente.ultimaVisita ? formatDate(cliente.ultimaVisita) : 'Sin visitas'}
            />
            <InfoRow
              icon={CalendarDays}
              label="Registrado"
              value={formatDate(cliente.fechaCreacion)}
            />
            {cliente.fechaMigracionWeb && (
              <InfoRow
                icon={Globe}
                label="Migración a web"
                value={formatDate(cliente.fechaMigracionWeb)}
              />
            )}
            <Separator className="my-1" />
            <InfoRow
              icon={Star}
              label="Descuento VIP"
              value={cliente.descuentoVip ? `${cliente.descuentoVip}%` : null}
            />
            <InfoRow
              icon={CreditCard}
              label="Total gastado"
              value={`S/ ${Number(cliente.totalGastado ?? 0).toFixed(2)}`}
            />
          </div>

          {/* Marketing y comunicaciones */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Marketing y comunicaciones
            </p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  cliente.aceptaComunicaciones ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
              <span className="text-sm text-gray-700">
                {cliente.aceptaComunicaciones
                  ? 'Acepta comunicaciones y promociones'
                  : 'No acepta comunicaciones'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  cliente.tieneAccesoWeb ? 'bg-brand-azul' : 'bg-gray-300'
                )}
              />
              <span className="text-sm text-gray-700">
                {cliente.tieneAccesoWeb ? 'Tiene acceso web activo' : 'Sin cuenta web'}
              </span>
            </div>
          </div>

          {/* Observaciones */}
          {cliente.observaciones && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Observaciones
                </p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {cliente.observaciones}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
