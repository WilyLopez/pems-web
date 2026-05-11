'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { UsuarioAdmin } from '@/types/usuario-admin.types'
import { useAuth } from '@/hooks/useAuth'

function useAdminId() {
  const { user } = useAuth()
  return user?.id ? parseInt(user.id) : null
}

export function usePerfil() {
  const id = useAdminId()
  return useQuery({
    queryKey: ['perfil', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UsuarioAdmin>>(`/usuarios-admin/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useActualizarPerfil() {
  const id = useAdminId()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: { nombre: string; telefono?: string }) =>
      api.put<ApiResponse<UsuarioAdmin>>(`/usuarios-admin/${id}`, values),
    onSuccess: () => {
      toast.success('Perfil actualizado correctamente.')
      qc.invalidateQueries({ queryKey: ['perfil', id] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar el perfil.'),
  })
}

export function useCambiarContrasena() {
  const id = useAdminId()
  return useMutation({
    mutationFn: (values: { contrasenaActual: string; contrasenaNueva: string }) =>
      api.put(`/usuarios-admin/${id}/contrasena`, values),
    onSuccess: () => toast.success('Contraseña actualizada correctamente.'),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cambiar la contraseña.'),
  })
}
