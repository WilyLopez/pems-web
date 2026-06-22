import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useEstadosReserva } from '../../hooks/useReservasData'
import { ReservaStatusBadge } from '../shared/ReservaStatusBadge'
import { EstadoReserva } from '../../types'
import { Info, HelpCircle } from 'lucide-react'

interface EstadoReservaInfoModalProps {
  open: boolean
  onClose: () => void
}

export const EstadoReservaInfoModal = ({ open, onClose }: EstadoReservaInfoModalProps) => {
  const { data: estados, isLoading } = useEstadosReserva()

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-gray-900">
            <div className="p-2 bg-brand-azul/10 rounded-xl">
              <Info className="h-5 w-5 text-brand-azul" />
            </div>
            Guía de Estados
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 leading-relaxed">
            Consulte el significado de cada estado para una gestión operativa correcta de las reservas.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 px-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="h-8 w-8 border-4 border-brand-azul/20 border-t-brand-azul rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-400">Cargando catálogo...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {estados?.map((estado) => (
                <div 
                  key={estado.nombre} 
                  className="group flex gap-4 p-3.5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="pt-1">
                    <ReservaStatusBadge estado={estado.nombre as EstadoReserva} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                      {estado.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-xl font-bold border-gray-200 hover:bg-gray-50 text-gray-600 px-6"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
