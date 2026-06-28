'use client'

import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  usuariosApi,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from '../services/usuarios.api'
import { getEstadoAdmin } from '../types'
import { useUsuariosNav } from './useUsuariosNav'
import { PAGE_SIZE, REFETCH_INTERVAL, STALE_TIME } from '../constants'

export const USUARIOS_KEYS = {
  LIST: 'admin-usuarios-list',
} as const

export function useUsuariosList() {
  return useQuery({
    queryKey: [USUARIOS_KEYS.LIST],
    queryFn: () => usuariosApi.listar(),
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: STALE_TIME,
  })
}

export function useUsuariosFiltrados() {
  const {
    data: todos = [],
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
    isRefetching,
  } = useUsuariosList()
  const { search, rol, estado, page } = useUsuariosNav()

  const filtrados = useMemo(() => {
    return todos.filter((u) => {
      const matchSearch =
        !search ||
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.correo.toLowerCase().includes(search.toLowerCase())
      const matchRol = rol === 'TODOS' || u.rol === rol
      const matchEstado = estado === 'TODOS' || getEstadoAdmin(u) === estado
      return matchSearch && matchRol && matchEstado
    })
  }, [todos, search, rol, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const pageActual = Math.min(page, totalPaginas)
  const paginados = filtrados.slice(
    (pageActual - 1) * PAGE_SIZE,
    pageActual * PAGE_SIZE
  )

  return {
    todos,
    paginados,
    totalFiltrados: filtrados.length,
    totalGeneral: todos.length,
    totalPaginas,
    pageActual,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
    isRefetching,
  }
}

export function useMutacionesUsuario() {
  const qc = useQueryClient()

  const invalidarLista = () => {
    qc.invalidateQueries({ queryKey: [USUARIOS_KEYS.LIST] })
  }

  const crearUsuario = useMutation({
    mutationFn: ({
      idSede,
      payload,
    }: {
      idSede: number
      payload: CrearUsuarioPayload
    }) => usuariosApi.crear(idSede, payload),
    onSuccess: () => {
      invalidarLista()
    },
  })

  const actualizarUsuario = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarUsuarioPayload
    }) => usuariosApi.actualizar(id, payload),
    onSuccess: () => {
      toast.success('Usuario actualizado.')
      invalidarLista()
    },
    onError: () => toast.error('No se pudo actualizar el usuario.'),
  })

  const cambiarRol = useMutation({
    mutationFn: ({ id, nuevoRol }: { id: number; nuevoRol: string }) =>
      usuariosApi.cambiarRol(id, nuevoRol),
    onSuccess: () => {
      toast.success('Rol actualizado correctamente.')
      invalidarLista()
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cambiar el rol.'),
  })

  const resetPassword = useMutation({
    mutationFn: (id: number) => usuariosApi.resetPassword(id),
    onSuccess: () =>
      toast.success('Se envió el email de recuperación de contraseña.'),
    onError: () => toast.error('No se pudo enviar el email de recuperación.'),
  })

  const activarUsuario = useMutation({
    mutationFn: (id: number) => usuariosApi.activar(id),
    onSuccess: () => {
      toast.success('Usuario activado.')
      invalidarLista()
    },
    onError: () => toast.error('No se pudo activar el usuario.'),
  })

  const desactivarUsuario = useMutation({
    mutationFn: (id: number) => usuariosApi.desactivar(id),
    onSuccess: () => {
      toast.success('Usuario desactivado.')
      invalidarLista()
    },
    onError: () => toast.error('No se pudo desactivar el usuario.'),
  })

  const desbloquearUsuario = useMutation({
    mutationFn: (id: number) => usuariosApi.desbloquear(id),
    onSuccess: () => {
      toast.success('Usuario desbloqueado.')
      invalidarLista()
    },
    onError: () => toast.error('No se pudo desbloquear el usuario.'),
  })

  return {
    crearUsuario,
    actualizarUsuario,
    cambiarRol,
    resetPassword,
    activarUsuario,
    desactivarUsuario,
    desbloquearUsuario,
  }
}
