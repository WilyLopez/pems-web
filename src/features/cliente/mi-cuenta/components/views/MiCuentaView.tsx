'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Ticket, PartyPopper, CheckCircle2, Wallet, LayoutDashboard, User, CalendarDays, Settings, AlertCircle } from 'lucide-react'
import { useMiCuentaData } from '../../hooks/useMiCuentaData'
import { useMiCuentaEventos } from '../../hooks/useMiCuentaEventos'
import { useMiCuentaReservas } from '../../hooks/useMiCuentaReservas'
import { InfoPersonalForm } from '../forms/InfoPersonalForm'
import { PreferenciasForm } from '../forms/PreferenciasForm'
import { PhotoUploadDialog } from '../dialogs/PhotoUploadDialog'
import { EventoPrivado, Reserva } from '../../../shared/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

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
    updateProfileAsync,
    isUpdatingProfile,
    updatePreferences,
    isUpdatingPreferences,
    uploadPhotoAsync,
    isUploadingPhoto,
    deletePhotoAsync,
    isDeletingPhoto,
  } = useMiCuentaData(clientePerfilId ?? undefined)

  const {
    eventos: eventosData,
    isLoading: isEventosLoading,
    isError: isEventosError,
    refetch: refetchEventos,
  } = useMiCuentaEventos(isAuthenticated, clientePerfilId ?? undefined)

  const {
    reservas: reservasData,
    isLoading: isReservasLoading,
    isError: isReservasError,
    refetch: refetchReservas,
  } = useMiCuentaReservas(isAuthenticated, clientePerfilId ?? undefined)

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

  const eventos: EventoPrivado[] = eventosData ?? []
  const reservas: Reserva[] = reservasData ?? []

  // Componente de Estadísticas Premium
  const Estadisticas = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        {
          valor: cliente.contadorVisitas,
          label: 'Visitas',
          icon: Ticket,
          color: 'from-brand-azul/20 to-brand-azul/5 text-brand-azul',
        },
        {
          valor: eventos.length,
          label: 'Eventos',
          icon: PartyPopper,
          color: 'from-brand-rosa/20 to-brand-rosa/5 text-brand-rosa',
        },
        {
          valor: eventos.filter((e) => e.estado === 'COMPLETADA').length,
          label: 'Completados',
          icon: CheckCircle2,
          color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600',
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
          color: 'from-amber-500/20 to-amber-500/5 text-amber-600',
        },
      ].map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 ${s.color}`}
          >
            <s.icon className="h-5 w-5" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-gray-900 leading-none">
            {s.valor}
          </p>
          <p className="text-[11px] sm:text-sm font-medium text-gray-400 mt-1">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )

  // Banner para perfil incompleto
  const CompletarPerfilBanner = () => {
    if (cliente.numeroDocumento) return null

    return (
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-amber-900">
              ¡Completa tu perfil!
            </h3>
            <p className="text-xs sm:text-sm text-amber-700/80 mt-0.5">
              Faltan datos obligatorios como tu documento de identidad para realizar reservas.
            </p>
          </div>
        </div>
        <button className="w-full sm:w-auto shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors">
          Completar ahora
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-6">
      <ProfileHeader
        cliente={cliente}
        onAvatarClick={() => setModalFotoAbierto(true)}
      />

      <CompletarPerfilBanner />

      <Estadisticas />

      {/* TABS PARA MOBILE / GRID PARA DESKTOP */}
      <div className="block lg:hidden">
        <Tabs defaultValue="resumen" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-white rounded-xl p-1 mb-4 h-auto shadow-sm border border-gray-100">
            <TabsTrigger value="resumen" className="flex flex-col gap-1 py-2 data-[state=active]:bg-brand-azul/5 data-[state=active]:text-brand-azul rounded-lg">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-[10px]">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex flex-col gap-1 py-2 data-[state=active]:bg-brand-azul/5 data-[state=active]:text-brand-azul rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-[10px]">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="eventos" className="flex flex-col gap-1 py-2 data-[state=active]:bg-brand-azul/5 data-[state=active]:text-brand-azul rounded-lg">
              <CalendarDays className="w-4 h-4" />
              <span className="text-[10px]">Eventos</span>
            </TabsTrigger>
            <TabsTrigger value="ajustes" className="flex flex-col gap-1 py-2 data-[state=active]:bg-brand-azul/5 data-[state=active]:text-brand-azul rounded-lg">
              <Settings className="w-4 h-4" />
              <span className="text-[10px]">Ajustes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-4">
            <PerfilCompletado cliente={cliente} />
            <BeneficiosVip cliente={cliente} eventos={eventos} />
            <QuickActions />
            <ProximoEvento reservas={reservas} eventos={eventos} />
            <ActividadReciente reservas={reservas} eventos={eventos} />
          </TabsContent>
          <TabsContent value="perfil" className="space-y-4">
            <InfoPersonalForm
              cliente={cliente}
              onSave={updateProfileAsync}
              isSaving={isUpdatingProfile}
            />
          </TabsContent>
          <TabsContent value="eventos" className="space-y-4">
            <EstadoCuentaSection reservas={reservas} />
          </TabsContent>
          <TabsContent value="ajustes" className="space-y-4">
            <SeguridadSection />
            <PreferenciasForm
              cliente={cliente}
              onSave={updatePreferences}
              isSaving={isUpdatingPreferences}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <PerfilCompletado cliente={cliente} />
          <BeneficiosVip cliente={cliente} eventos={eventos} />
          <QuickActions />
        </div>

        <div className="lg:col-span-2 space-y-5">
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
