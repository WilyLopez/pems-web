'use client'

import { useMutacionesCliente } from '../../hooks/useClientesData'
import { ClienteForm } from './ClienteForm'
import { ClienteFormValues } from '../../schema/cliente.schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

interface NuevoClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NuevoClienteModal({ open, onOpenChange }: NuevoClienteModalProps) {
  const { crearCliente } = useMutacionesCliente()

  const handleSubmit = (values: ClienteFormValues) => {
    crearCliente.mutate(values, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>
        <div className="pt-1">
          <ClienteForm
            onSubmit={handleSubmit}
            isSubmitting={crearCliente.isPending}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
