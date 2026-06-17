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
  rol: string
  telefono?: string
  generarPassword: boolean
  password?: string
}

export interface CrearUsuarioResponse extends UsuarioAdmin {
  passwordTemporal?: string
}

export function useCrearUsuarioAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ idSede, ...body }: CrearPayload) => {
      const { data } = await api.post<ApiResponse<CrearUsuarioResponse>>(
        `/usuarios-admin/sedes/${idSede}`,
        body
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo crear el usuario.'),
  })
}

interface ActualizarPayload {
  id: number
  nombre: string
  telefono?: string
}

export function useActualizarUsuarioAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: ActualizarPayload) => {
      const { data } = await api.put<ApiResponse<UsuarioAdmin>>(
        `/usuarios-admin/${id}`,
        body
      )
      return data.data
    },
    onSuccess: () => {
      toast.success('Usuario actualizado.')
      qc.invalidateQueries({ queryKey: KEY })
    },
    onError: () => toast.error('No se pudo actualizar el usuario.'),
  })
}

interface CambiarRolPayload {
  id: number
  nuevoRol: string
}

export function useCambiarRolAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, nuevoRol }: CambiarRolPayload) => {
      const { data } = await api.patch<ApiResponse<UsuarioAdmin>>(
        `/usuarios-admin/${id}/rol`,
        { nuevoRol }
      )
      return data.data
    },
    onSuccess: () => {
      toast.success('Rol actualizado correctamente.')
      qc.invalidateQueries({ queryKey: KEY })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cambiar el rol.'),
  })
}

export function useResetPasswordAdmin() {
  return useMutation({
    mutationFn: (id: number) => api.post(`/usuarios-admin/${id}/reset-password`),
    onSuccess: () =>
      toast.success('Se envió el email de recuperación de contraseña.'),
    onError: () => toast.error('No se pudo enviar el email de recuperación.'),
  })
}

export function useActivarUsuarioAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.patch(`/usuarios-admin/${id}/activar`),
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
    mutationFn: (id: number) => api.patch(`/usuarios-admin/${id}/desactivar`),
    onSuccess: () => {
      toast.success('Usuario desactivado.')
      qc.invalidateQueries({ queryKey: KEY })
    },
    onError: () => toast.error('No se pudo desactivar el usuario.'),
  })
}
