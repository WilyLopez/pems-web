'use client'

import { Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
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

export function DesbloquearUsuarioDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()
  const { desbloquearUsuario } = useMutacionesUsuario()

  const open = modal === 'desbloquear'
  const usuario = usuarios.find((u) => u.id === userId) ?? null

  const tiempoRestante =
    usuario?.bloqueadoHasta && new Date(usuario.bloqueadoHasta) > new Date()
      ? formatDistanceToNow(new Date(usuario.bloqueadoHasta), {
          locale: es,
          addSuffix: true,
        })
      : null

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desbloquear cuenta</AlertDialogTitle>
          <AlertDialogDescription>
            La cuenta de <strong>{usuario?.nombre}</strong> está bloqueada
            {tiempoRestante ? ` — expira ${tiempoRestante}` : ''}. Al
            desbloquear, el usuario podrá iniciar sesión de inmediato.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeModal}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={desbloquearUsuario.isPending}
            onClick={(e) => {
              e.preventDefault()
              if (!usuario) return
              desbloquearUsuario.mutate(usuario.id, { onSuccess: closeModal })
            }}
          >
            {desbloquearUsuario.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Desbloqueando...
              </>
            ) : (
              'Desbloquear'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
