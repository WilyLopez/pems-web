'use client'

import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import {
  useUsuariosList,
  useMutacionesUsuario,
} from '../../hooks/useUsuariosData'

export function DesactivarUsuarioDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()
  const { desactivarUsuario } = useMutacionesUsuario()

  const open = modal === 'desactivar'
  const usuario = usuarios.find((u) => u.id === userId) ?? null

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desactivar cuenta</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción desactivará la cuenta de{' '}
            <strong>{usuario?.nombre}</strong> ({usuario?.rol}). El usuario no
            podrá iniciar sesión hasta que sea reactivado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeModal}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            disabled={desactivarUsuario.isPending}
            onClick={(e) => {
              e.preventDefault()
              if (!usuario) return
              desactivarUsuario.mutate(usuario.id, { onSuccess: closeModal })
            }}
          >
            {desactivarUsuario.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Desactivando...
              </>
            ) : (
              'Desactivar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
