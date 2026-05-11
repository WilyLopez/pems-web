'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { UsuarioAdmin } from '@/types/usuario-admin.types'

const KEY = ['usuarios-admin']

export function useUsuariosAdmin() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UsuarioAdmin[]>>('/usuarios-admin')
      return data.data
    },
  })
}

interface CrearPayload {
  idSede: number
  nombre: string
  correo: string
  contrasena: string
  rol?: string
  telefono?: string
}

export function useCrearUsuarioAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ idSede, ...body }: CrearPayload) =>
      api.post(`/usuarios-admin/sedes/${idSede}`, body),
    onSuccess: () => {
      toast.success('Administrador creado correctamente.')
      qc.invalidateQueries({ queryKey: KEY })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo crear el usuario.'),
  })
}

export function useActivarUsuarioAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.post(`/usuarios-admin/${id}/activar`),
    onSuccess: () => {
      toast.success('Usuario activado.')
      qc.invalidateQueries({ queryKey: KEY })
    },
    onError: () => toast.error('No se pudo activar el usuario.'),
  })
}

export function useDesactivarUsuarioAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.post(`/usuarios-admin/${id}/desactivar`),
    onSuccess: () => {
      toast.success('Usuario desactivado.')
      qc.invalidateQueries({ queryKey: KEY })
    },
    onError: () => toast.error('No se pudo desactivar el usuario.'),
  })
}
