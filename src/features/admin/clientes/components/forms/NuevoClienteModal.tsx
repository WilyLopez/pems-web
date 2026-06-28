'use client'

import { useMutacionesCliente } from '../../hooks/useClientesData'
import { ClienteForm } from './ClienteForm'
import { ClienteFormValues } from '../../schema/cliente.schema'
import { Cliente } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

function parseSearchToDefaults(search: string): Partial<ClienteFormValues> {
  const trimmed = search.trim()
  if (!trimmed) return {}

  if (/^\d{8}$/.test(trimmed)) {
    return { tipoDocumentoCodigo: 'DNI', numeroDocumento: trimmed }
  }
  if (/^\d{11}$/.test(trimmed)) {
    return { tipoDocumentoCodigo: 'RUC', numeroDocumento: trimmed }
  }
  if (trimmed.includes('@')) {
    return { correo: trimmed }
  }

  const parts = trimmed.toUpperCase().split(/\s+/)
  return {
    nombres: parts[0] ?? '',
    apellidoPaterno: parts[1] ?? '',
  }
}

interface NuevoClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (cliente: Cliente) => void
  initialSearch?: string
}

export function NuevoClienteModal({
  open,
  onOpenChange,
  onCreated,
  initialSearch,
}: NuevoClienteModalProps) {
  const { crearCliente } = useMutacionesCliente()

  const handleSubmit = (values: ClienteFormValues) => {
    crearCliente.mutate(values, {
      onSuccess: (cliente) => {
        onOpenChange(false)
        onCreated?.(cliente)
      },
    })
  }

  const defaultValues = initialSearch
    ? parseSearchToDefaults(initialSearch)
    : undefined

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
            defaultValues={defaultValues}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
