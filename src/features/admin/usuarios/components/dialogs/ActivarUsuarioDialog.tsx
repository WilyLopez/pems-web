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

export function ActivarUsuarioDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()
  const { activarUsuario } = useMutacionesUsuario()

  const open = modal === 'activar'
  const usuario = usuarios.find((u) => u.id === userId) ?? null

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activar cuenta</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción activará la cuenta de <strong>{usuario?.nombre}</strong>{' '}
            ({usuario?.rol}). El usuario podrá volver a iniciar sesión.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeModal}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={activarUsuario.isPending}
            onClick={(e) => {
              e.preventDefault()
              if (!usuario) return
              activarUsuario.mutate(usuario.id, { onSuccess: closeModal })
            }}
          >
            {activarUsuario.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activando...
              </>
            ) : (
              'Activar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
