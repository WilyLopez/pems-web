'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { UsuarioAdmin } from '@/features/admin/usuarios/types'
import { useAuth } from '@/hooks/useAuth'

export function usePerfilData(targetUserId?: number | null) {
  const { idUsuario } = useAuth()
  const id = targetUserId ?? idUsuario ?? null
  const queryClient = useQueryClient()

  const perfilQuery = useQuery({
    queryKey: ['perfil', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UsuarioAdmin>>(
        `/usuarios-admin/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })

  const actualizarPerfilMutation = useMutation({
    mutationFn: (values: { nombre: string; telefono?: string }) =>
      api
        .put<ApiResponse<UsuarioAdmin>>(`/usuarios-admin/${id}`, values)
        .then((r) => r.data.data),
    onSuccess: (updated) => {
      toast.success('Perfil actualizado correctamente.')
      queryClient.setQueryData(['perfil', id], updated)
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar el perfil.'),
  })

  const cambiarContrasenaMutation = useMutation({
    mutationFn: (values: {
      contrasenaActual: string
      contrasenaNueva: string
    }) => api.put(`/usuarios-admin/${id}/contrasena`, values),
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cambiar la contraseña.'),
  })

  return {
    admin: perfilQuery.data,
    isLoading: perfilQuery.isLoading,
    isError: perfilQuery.isError,
    refetch: perfilQuery.refetch,
    actualizarPerfil: actualizarPerfilMutation,
    cambiarContrasena: cambiarContrasenaMutation,
  }
}
