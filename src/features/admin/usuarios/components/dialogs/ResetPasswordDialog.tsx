'use client'

import { Loader2, Mail } from 'lucide-react'
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

export function ResetPasswordDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()
  const { resetPassword } = useMutacionesUsuario()

  const open = modal === 'reset'
  const usuario = usuarios.find((u) => u.id === userId) || null

  const handleConfirm = () => {
    if (!usuario) return
    resetPassword.mutate(usuario.id, {
      onSuccess: () => {
        closeModal()
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Restablecer contraseña
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se procesará el envío de un email de recuperación de contraseña a{' '}
            <strong>{usuario?.correo}</strong>. El usuario podrá crear una
            nueva contraseña desde ese email en cuanto le llegue; esta
            confirmación indica que la solicitud fue procesada por Supabase
            Auth, no que el correo ya fue entregado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              'Enviar email'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
