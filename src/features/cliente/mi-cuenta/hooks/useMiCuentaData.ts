import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clienteService } from '@/services/cliente.service'
import { clienteKeys } from '../../shared/queryKeys'
import { InfoPersonalValues } from '../schema/mi-cuenta.schema'
import { toast } from 'sonner'

export function useMiCuentaData(clientePerfilId?: number) {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: clienteKeys.perfil(clientePerfilId),
    queryFn: () => clienteService.obtener(clientePerfilId!),
    enabled: !!clientePerfilId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  })

  const updateProfileMutation = useMutation({
    mutationFn: (values: InfoPersonalValues) =>
      clienteService.actualizar(clientePerfilId!, {
        nombres: values.nombres,
        apellidoPaterno: values.apellidoPaterno,
        apellidoMaterno: values.apellidoMaterno || undefined,
        telefono: values.telefono,
      }),
    onSuccess: () => {
      toast.success('Datos personales actualizados correctamente.')
      queryClient.invalidateQueries({ queryKey: clienteKeys.perfil(clientePerfilId) })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudieron actualizar los datos personales.')
    },
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (aceptaComunicaciones: boolean) =>
      clienteService.actualizar(clientePerfilId!, { aceptaComunicaciones }),
    onSuccess: () => {
      toast.success('Preferencias de comunicación actualizadas.')
      queryClient.invalidateQueries({ queryKey: clienteKeys.perfil(clientePerfilId) })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudieron actualizar las preferencias.')
    },
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => clienteService.subirFoto(clientePerfilId!, file),
    onSuccess: () => {
      toast.success('Foto de perfil actualizada correctamente.')
      queryClient.invalidateQueries({ queryKey: clienteKeys.perfil(clientePerfilId) })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo subir la foto de perfil.')
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: () => clienteService.eliminarFoto(clientePerfilId!),
    onSuccess: () => {
      toast.success('Foto de perfil eliminada correctamente.')
      queryClient.invalidateQueries({ queryKey: clienteKeys.perfil(clientePerfilId) })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo eliminar la foto de perfil.')
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
