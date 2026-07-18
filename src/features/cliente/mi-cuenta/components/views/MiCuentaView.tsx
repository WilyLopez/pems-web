'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle } from 'lucide-react'
import { useMiCuentaData } from '../../hooks/useMiCuentaData'
import { InfoPersonalForm } from '../forms/InfoPersonalForm'
import { PreferenciasForm } from '../forms/PreferenciasForm'
import { PhotoUploadDialog } from '../dialogs/PhotoUploadDialog'
import { CompletarDniModal } from '../dialogs/CompletarDniModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'

import { ProfileHeader } from '../ui/ProfileHeader'
import { BeneficiosVip } from '../ui/BeneficiosVip'
import { SeguridadSection } from '../ui/SeguridadSection'

function MiCuentaSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full space-y-4 sm:space-y-5">
      <Skeleton className="h-48 sm:h-52 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  )
}

export function MiCuentaView() {
  const { clientePerfilId } = useAuth()
  const [modalFotoAbierto, setModalFotoAbierto] = useState(false)
  const [modalDniAbierto, setModalDniAbierto] = useState(false)

  const {
    cliente,
    isLoading,
    isError,
    refetch,
    updateProfileAsync,
    isUpdatingProfile,
    updatePreferences,
    isUpdatingPreferences,
    uploadPhotoAsync,
    isUploadingPhoto,
    deletePhotoAsync,
    isDeletingPhoto,
    completarDocumentoAsync,
    isCompletandoDocumento,
  } = useMiCuentaData(clientePerfilId ?? undefined)

  if (isLoading) return <MiCuentaSkeleton />

  if (isError || !cliente) {
    return (
      <div className="max-w-2xl mx-auto w-full p-4">
        <ErrorState
          message="Ocurrió un error al cargar los datos de tu cuenta. Por favor, intenta de nuevo."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4 sm:space-y-5">
      <ProfileHeader
        cliente={cliente}
        onAvatarClick={() => setModalFotoAbierto(true)}
      />

      {!cliente.numeroDocumento && (
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
                Falta tu documento de identidad para poder hacer reservas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalDniAbierto(true)}
            className="w-full sm:w-auto shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
          >
            Completar ahora
          </button>
        </div>
      )}

      <BeneficiosVip cliente={cliente} />

      <InfoPersonalForm
        cliente={cliente}
        onSave={updateProfileAsync}
        isSaving={isUpdatingProfile}
      />

      <SeguridadSection />

      <PreferenciasForm
        cliente={cliente}
        onSave={updatePreferences}
        isSaving={isUpdatingPreferences}
      />

      <PhotoUploadDialog
        open={modalFotoAbierto}
        onClose={() => setModalFotoAbierto(false)}
        cliente={cliente}
        onUpload={uploadPhotoAsync}
        isUploading={isUploadingPhoto}
        onDelete={deletePhotoAsync}
        isDeleting={isDeletingPhoto}
      />

      <CompletarDniModal
        open={modalDniAbierto}
        onClose={() => setModalDniAbierto(false)}
        onSave={completarDocumentoAsync}
        isSaving={isCompletandoDocumento}
      />
    </div>
  )
}
