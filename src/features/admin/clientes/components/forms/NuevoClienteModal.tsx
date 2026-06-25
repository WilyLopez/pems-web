'use client'

import { useMutacionesCliente } from '../../hooks/useClientesData'
import { ClienteForm } from './ClienteForm'
import { ClienteFormValues } from '../../schema/cliente.schema'
import { Cliente } from '../../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

interface NuevoClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (cliente: Cliente) => void
}

export function NuevoClienteModal({ open, onOpenChange, onCreated }: NuevoClienteModalProps) {
  const { crearCliente } = useMutacionesCliente()

  const handleSubmit = (values: ClienteFormValues) => {
    crearCliente.mutate(values, {
      onSuccess: (cliente) => {
        onOpenChange(false)
        onCreated?.(cliente)
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
