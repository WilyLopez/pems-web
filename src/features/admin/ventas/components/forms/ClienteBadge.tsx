import React from 'react'
import { User, AlertCircle } from 'lucide-react'
import { Cliente } from '@/types/cliente.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ClienteBadgeProps {
  cliente: Cliente | null
  setCliente: (cliente: Cliente | null) => void
  setShowClienteModal: (show: boolean) => void
}

export const ClienteBadge = ({
  cliente,
  setCliente,
  setShowClienteModal,
}: ClienteBadgeProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        {cliente ? (
          <>
            <div className="min-w-0">
              <p className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
                {cliente.nombreCompleto}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {cliente.correo || 'Sin correo'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <button
                type="button"
                onClick={() => setShowClienteModal(true)}
                className="text-[10px] text-brand-azul hover:underline"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => setCliente(null)}
                className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Quitar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Cliente invitado
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowClienteModal(true)}
              className="text-[10px] text-brand-azul hover:underline font-bold"
            >
              Buscar cliente
            </button>
          </>
        )}
      </div>

      {cliente && !cliente.correo && (
        <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 py-3 text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <div className="grid gap-0.5">
            <AlertTitle className="text-xs font-bold">
              Cliente sin correo
            </AlertTitle>
            <AlertDescription className="text-[10px] leading-tight">
              El cliente seleccionado no tiene correo registrado.
              Puedes ingresar uno en el modal final para enviarle
              los comprobantes.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}
