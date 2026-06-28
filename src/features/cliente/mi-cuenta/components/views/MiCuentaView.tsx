'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { Ticket, PartyPopper, CheckCircle2, Wallet } from 'lucide-react'
import { useMiCuentaData } from '../../hooks/useMiCuentaData'
import { InfoPersonalForm } from '../forms/InfoPersonalForm'
import { PreferenciasForm } from '../forms/PreferenciasForm'
import { PhotoUploadDialog } from '../dialogs/PhotoUploadDialog'
import { eventoService } from '@/services/evento.service'
import { reservaApi } from '@/features/cliente/shared/services/reserva.api'
import { EventoPrivado, Reserva } from '../../../shared/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { clienteKeys } from '../../../shared/queryKeys'

// Extracted subcomponents
import { ProfileHeader } from '../ui/ProfileHeader'
import { QuickActions } from '../ui/QuickActions'
import { PerfilCompletado } from '../ui/PerfilCompletado'
import { BeneficiosVip } from '../ui/BeneficiosVip'
import { ProximoEvento } from '../ui/ProximoEvento'
import { ActividadReciente } from '../ui/ActividadReciente'
import { SeguridadSection } from '../ui/SeguridadSection'
import { EstadoCuentaSection } from '../ui/EstadoCuentaSection'

function MiCuentaSkeleton() {
  return (
    <div className="max-w-6xl mx-auto w-full space-y-5">
      <Skeleton className="h-48 sm:h-52 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function MiCuentaView() {
  const { clientePerfilId, isAuthenticated } = useAuth()
  const [modalFotoAbierto, setModalFotoAbierto] = useState(false)

  const {
    cliente,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
    updateProfile,
    updateProfileAsync,
    isUpdatingProfile,
    updatePreferences,
    isUpdatingPreferences,
    uploadPhoto,
    uploadPhotoAsync,
    isUploadingPhoto,
    deletePhoto,
    deletePhotoAsync,
    isDeletingPhoto,
  } = useMiCuentaData(clientePerfilId ?? undefined)

  const {
    data: eventosData,
    isLoading: isEventosLoading,
    isError: isEventosError,
    refetch: refetchEventos,
  } = useQuery({
    queryKey: clienteKeys.eventos.list({ page: 0, size: 50 }),
    queryFn: () => eventoService.listar({ page: 0, size: 50 }),
    enabled: isAuthenticated && !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: reservasData,
    isLoading: isReservasLoading,
    isError: isReservasError,
    refetch: refetchReservas,
  } = useQuery({
    queryKey: clienteKeys.reservas.list({ page: 0, size: 50 }),
    queryFn: () => reservaApi.listar({ page: 0, size: 50 }),
    enabled: isAuthenticated && !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = isProfileLoading || isEventosLoading || isReservasLoading
  const isError = isProfileError || isEventosError || isReservasError

  const handleRetry = () => {
    if (isProfileError) refetchProfile()
    if (isEventosError) refetchEventos()
    if (isReservasError) refetchReservas()
  }

  if (isLoading) return <MiCuentaSkeleton />

  if (isError || !cliente) {
    return (
      <div className="max-w-6xl mx-auto w-full p-4">
        <ErrorState
          message="Ocurrió un error al cargar los datos de tu cuenta. Por favor, intenta de nuevo."
          onRetry={handleRetry}
        />
      </div>
    )
  }

  const eventos: EventoPrivado[] = eventosData?.content ?? []
  const reservas: Reserva[] = reservasData?.content ?? []

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-5">
      <ProfileHeader
        cliente={cliente}
        onAvatarClick={() => setModalFotoAbierto(true)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            valor: cliente.contadorVisitas,
            label: 'Visitas',
            icon: Ticket,
            color: 'bg-brand-azul/10 text-brand-azul',
          },
          {
            valor: eventos.length,
            label: 'Eventos',
            icon: PartyPopper,
            color: 'bg-brand-rosa/10 text-brand-rosa',
          },
          {
            valor: eventos.filter((e) => e.estado === 'COMPLETADA').length,
            label: 'Completados',
            icon: CheckCircle2,
            color: 'bg-green-100 text-green-600',
          },
          {
            valor:
              cliente.totalGastado != null
                ? new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                  }).format(cliente.totalGastado)
                : '—',
            label: 'Total gastado',
            icon: Wallet,
            color: 'bg-amber-100 text-amber-600',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}
            >
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none">
              {s.valor}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="space-y-4">
          <PerfilCompletado cliente={cliente} />
          <BeneficiosVip cliente={cliente} eventos={eventos} />
          <QuickActions />
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <ProximoEvento reservas={reservas} eventos={eventos} />
          <ActividadReciente reservas={reservas} eventos={eventos} />
          <InfoPersonalForm
            cliente={cliente}
            onSave={updateProfileAsync}
            isSaving={isUpdatingProfile}
          />
          <SeguridadSection />
          <EstadoCuentaSection reservas={reservas} />
          <PreferenciasForm
            cliente={cliente}
            onSave={updatePreferences}
            isSaving={isUpdatingPreferences}
          />
        </div>
      </div>

      <PhotoUploadDialog
        open={modalFotoAbierto}
        onClose={() => setModalFotoAbierto(false)}
        cliente={cliente}
        onUpload={uploadPhotoAsync}
        isUploading={isUploadingPhoto}
        onDelete={deletePhotoAsync}
        isDeleting={isDeletingPhoto}
      />
    </div>
  )
}
