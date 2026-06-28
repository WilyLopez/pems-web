import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  useFidelizacionConfig,
  useActualizarFidelizacionConfig,
} from '../../hooks/useFidelizacion'
import { Star } from 'lucide-react'

interface FidelizacionConfigModalProps {
  open: boolean
  onClose: () => void
  idSede?: number
}

export const FidelizacionConfigModal = ({
  open,
  onClose,
  idSede,
}: FidelizacionConfigModalProps) => {
  const { data: config, isLoading } = useFidelizacionConfig(idSede)
  const actualizar = useActualizarFidelizacionConfig(idSede)
  const [umbral, setUmbral] = useState<number>(6)

  useEffect(() => {
    if (config) {
      setUmbral(config.umbral)
    }
  }, [config])

  const handleSave = () => {
    actualizar.mutate(umbral, {
      onSuccess: onClose,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Configuración de Fidelización
          </DialogTitle>
          <DialogDescription>
            Establece el número de visitas necesarias para que un cliente
            obtenga una entrada gratuita.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="umbral">Número de visitas para premio</Label>
            <Input
              id="umbral"
              type="number"
              min={1}
              value={umbral}
              onChange={(e) => setUmbral(parseInt(e.target.value))}
              disabled={isLoading || actualizar.isPending}
            />
            <p className="text-[10px] text-gray-500">
              Actualmente: La visita número {umbral} será gratuita para el
              cliente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={actualizar.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={actualizar.isPending || isLoading}
            className="bg-brand-azul hover:bg-brand-azul/90 text-white"
          >
            {actualizar.isPending ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
