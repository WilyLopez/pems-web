import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clienteService } from '@/services/cliente.service'
import { clienteKeys } from '../../shared/queryKeys'
import { InfoPersonalValues } from '../schema/mi-cuenta.schema'
import { ApiError } from '@/types/api.types'
import { toast } from 'sonner'

export function useMiCuentaData(clientePerfilId?: number) {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: clienteKeys.perfil(clientePerfilId),
    queryFn: () => clienteService.obtener(clientePerfilId!),
    enabled: !!clientePerfilId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  })

  const invalidarPerfil = () =>
    queryClient.invalidateQueries({
      queryKey: clienteKeys.perfil(clientePerfilId),
    })

  const updateProfileMutation = useMutation({
    mutationFn: (values: InfoPersonalValues) =>
      clienteService.actualizar(clientePerfilId!, {
        nombres: values.nombres,
        apellidoPaterno: values.apellidoPaterno || undefined,
        apellidoMaterno: values.apellidoMaterno || undefined,
        telefono: values.telefono || undefined,
        fechaNacimiento: values.fechaNacimiento || undefined,
      }),
    onSuccess: () => {
      toast.success('Datos personales actualizados correctamente.')
      invalidarPerfil()
    },
    onError: (err: ApiError) => {
      toast.error(
        err.message ?? 'No se pudieron actualizar los datos personales.'
      )
    },
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (aceptaComunicaciones: boolean) =>
      clienteService.actualizar(clientePerfilId!, { aceptaComunicaciones }),
    onSuccess: () => {
      toast.success('Preferencias de comunicación actualizadas.')
      invalidarPerfil()
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'No se pudieron actualizar las preferencias.')
    },
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) =>
      clienteService.subirFoto(clientePerfilId!, file),
    onSuccess: () => {
      toast.success('Foto de perfil actualizada correctamente.')
      invalidarPerfil()
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'No se pudo subir la foto de perfil.')
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: () => clienteService.eliminarFoto(clientePerfilId!),
    onSuccess: () => {
      toast.success('Foto de perfil eliminada correctamente.')
      invalidarPerfil()
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'No se pudo eliminar la foto de perfil.')
    },
  })

  const completarDocumentoMutation = useMutation({
    mutationFn: (numeroDocumento: string) =>
      clienteService.actualizar(clientePerfilId!, { numeroDocumento }),
    onSuccess: () => {
      toast.success('¡Documento registrado! Ya puedes hacer reservas.')
      invalidarPerfil()
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'No se pudo registrar tu documento.')
    },
  })

  return {
    cliente: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    completarDocumentoAsync: completarDocumentoMutation.mutateAsync,
    isCompletandoDocumento: completarDocumentoMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    uploadPhoto: uploadPhotoMutation.mutate,
    uploadPhotoAsync: uploadPhotoMutation.mutateAsync,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    deletePhoto: deletePhotoMutation.mutate,
    deletePhotoAsync: deletePhotoMutation.mutateAsync,
    isDeletingPhoto: deletePhotoMutation.isPending,
  }
}
