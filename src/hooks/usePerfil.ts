'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { UsuarioAdmin } from '@/types/usuario-admin.types'
import { useAuth } from '@/hooks/useAuth'

function useStaffId(): number | null {
  const { idUsuario } = useAuth()
  return idUsuario ?? null
}

export function usePerfil() {
  const id = useStaffId()
  return useQuery({
    queryKey: ['perfil', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UsuarioAdmin>>(
        `/usuarios-admin/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

export function useActualizarPerfil() {
  const id = useStaffId()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: { nombre: string; telefono?: string }) =>
      api.put<ApiResponse<UsuarioAdmin>>(`/usuarios-admin/${id}`, values).then((r) => r.data.data),
    onSuccess: (updated) => {
      toast.success('Perfil actualizado correctamente.')
      qc.setQueryData(['perfil', id], updated)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar el perfil.'),
  })
}

export function useCambiarContrasena() {
  const id = useStaffId()
  return useMutation({
    mutationFn: (values: {
      contrasenaActual: string
      contrasenaNueva: string
    }) => api.put(`/usuarios-admin/${id}/contrasena`, values),
    onSuccess: () => toast.success('Contraseña actualizada correctamente.'),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cambiar la contraseña.'),
  })
}
