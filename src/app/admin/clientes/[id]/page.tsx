'use client'

import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Phone,
  Mail,
  BadgeCheck,
  CalendarDays,
  Clock,
  Ticket,
  Crown,
  RefreshCw,
  Loader2,
  Star,
  CreditCard,
  ShoppingBag,
} from 'lucide-react'
import Link from 'next/link'

import {
  useClienteDetail,
  useMutacionesCliente,
} from '@/features/admin/clientes/hooks/useClientesData'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ClienteAvatar } from '@/features/admin/clientes/components/ui/ClienteAvatar'
import {
  VipBadge,
  OrigenBadge,
  SegmentoBadge,
} from '@/features/admin/clientes/components/ui/ClienteBadges'
import { DetalleRow } from '@/features/admin/clientes/components/ui/DetalleRow'
import { StatCard } from '@/features/admin/clientes/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ClienteDetailPage() {
  const params = useParams()
  const clienteId = typeof params?.id === 'string' ? Number(params.id) : null

  const { data: cliente, isLoading } = useClienteDetail(clienteId)
  const { toggleVip, registrarVisita } = useMutacionesCliente(clienteId)

  const handleToggleVip = () => {
    if (!cliente) return
    toggleVip.mutate({ id: cliente.id, esVip: cliente.esVip })
  }

  const handleRegistrarVisita = () => {
    if (!clienteId) return
    registrarVisita.mutate(clienteId)
  }

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
          { label: cliente.nombreCompleto },
        ]}
      />

      <PageHeader
        title={cliente.nombreCompleto}
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
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
            <ClienteAvatar
              nombre={cliente.nombreCompleto}
              fotoPerfil={undefined}
              esVip={cliente.esVip}
              size="lg"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="font-black text-gray-900">
                {cliente.nombreCompleto}
              </h2>
              <p className="text-sm text-gray-500 truncate">{cliente.correo}</p>
              <div className="flex flex-wrap gap-1.5">
                <OrigenBadge origen={cliente.origen} />
                <SegmentoBadge segmento={cliente.segmentoCodigo} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cliente.esVip && <VipBadge descuento={cliente.descuentoVip} />}
              </div>
            </div>
          </div>

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
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Datos de contacto
            </p>
            <DetalleRow icon={Mail} label="Correo" value={cliente.correo} />
            <DetalleRow
              icon={Phone}
              label="Teléfono"
              value={cliente.telefono}
            />
            <DetalleRow
              icon={BadgeCheck}
              label={cliente.tipoDocumentoCodigo}
              value={cliente.numeroDocumento}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Actividad y CRM
            </p>
            <DetalleRow
              icon={Clock}
              label="Última visita"
              value={
                cliente.ultimaVisitaAt
                  ? formatDate(cliente.ultimaVisitaAt)
                  : 'Sin visitas'
              }
            />
            <DetalleRow
              icon={CalendarDays}
              label="Registrado"
              value={formatDate(cliente.creadoEn)}
            />
            <DetalleRow
              icon={Star}
              label="Descuento VIP"
              value={cliente.descuentoVip ? `${cliente.descuentoVip}%` : null}
            />
            <DetalleRow
              icon={CreditCard}
              label="Total gastado"
              value={`S/ ${Number(cliente.totalGastado ?? 0).toFixed(2)}`}
            />
          </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}
