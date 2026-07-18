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
import { Cliente } from '../../types'

interface ConfirmarEstadoClienteDialogProps {
  cliente: Cliente | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmarEstadoClienteDialog({
  cliente,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: ConfirmarEstadoClienteDialogProps) {
  if (!cliente) return null
  const activo = cliente.activo

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {activo ? 'Desactivar cliente' : 'Activar cliente'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activo ? (
              <>
                Esta acción desactivará la cuenta de{' '}
                <strong>{cliente.nombreCompleto}</strong>. No podrá iniciar
                sesión hasta que sea reactivada.
              </>
            ) : (
              <>
                Esta acción activará la cuenta de{' '}
                <strong>{cliente.nombreCompleto}</strong>. Podrá volver a
                iniciar sesión con normalidad.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              activo
                ? 'bg-destructive hover:bg-destructive/90 text-white'
                : undefined
            }
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {activo ? 'Desactivando...' : 'Activando...'}
              </>
            ) : activo ? (
              'Desactivar'
            ) : (
              'Activar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
