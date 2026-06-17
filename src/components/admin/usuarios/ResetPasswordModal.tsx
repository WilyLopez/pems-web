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
import { UsuarioAdmin } from '@/types/usuario-admin.types'
import { useResetPasswordAdmin } from '@/hooks/useUsuariosAdmin'

interface Props {
  usuario: UsuarioAdmin | null
  open: boolean
  onClose: () => void
}

export function ResetPasswordModal({ usuario, open, onClose }: Props) {
  const reset = useResetPasswordAdmin()

  function handleConfirm() {
    if (!usuario) return
    reset.mutate(usuario.id, { onSuccess: onClose })
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Restablecer contraseña
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se enviará un email de recuperación de contraseña a{' '}
            <strong>{usuario?.correo}</strong>. El usuario podrá crear una nueva
            contraseña desde ese email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={reset.isPending}>
            {reset.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
            ) : 'Enviar email'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
