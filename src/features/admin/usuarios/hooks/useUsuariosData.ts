import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usuariosApi, CrearUsuarioPayload, ActualizarUsuarioPayload } from '../services/usuarios.api'

export const USUARIOS_KEYS = {
  LIST: 'admin-usuarios-list',
} as const

export function useUsuariosList() {
  return useQuery({
    queryKey: [USUARIOS_KEYS.LIST],
    queryFn: () => usuariosApi.listar(),
  })
}

export function useMutacionesUsuario() {
  const qc = useQueryClient()

  const invalidarLista = () => {
    qc.invalidateQueries({ queryKey: [USUARIOS_KEYS.LIST] })
  }

  const crearUsuario = useMutation({
    mutationFn: ({ idSede, payload }: { idSede: number; payload: CrearUsuarioPayload }) =>
      usuariosApi.crear(idSede, payload),
    onSuccess: () => {
      invalidarLista()
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo crear el usuario.'),
  })

  const actualizarUsuario = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarUsuarioPayload }) =>
      usuariosApi.actualizar(id, payload),
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

  return {
    crearUsuario,
    actualizarUsuario,
    cambiarRol,
    resetPassword,
    activarUsuario,
    desactivarUsuario,
  }
}
