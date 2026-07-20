'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTurnoDisponibleParaFecha } from '../../hooks/useTurnoDisponibleParaFecha'
import { BotonTurno } from '@/components/admin/eventos/BotonTurno'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'

interface SelectorTurnoInlineProps {
  idSede: number
  fecha: string
  idTurnoSel: number
  onTurnoChange: (idTurno: number) => void
}

export function SelectorTurnoInline({
  idSede,
  fecha,
  idTurnoSel,
  onTurnoChange,
}: SelectorTurnoInlineProps) {
  const [open, setOpen] = useState(false)
  const { turnos, loading } = useTurnoDisponibleParaFecha(
    open ? idSede : null,
    open ? fecha : null
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-brand-azul transition-colors"
          aria-label="Cambiar turno"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2">
          Cambiar turno
        </p>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-2">
            {turnos.map((turno) => (
              <BotonTurno
                key={turno.id}
                label={turno.nombre}
                horario={`${turno.horaInicio}-${turno.horaFin}`}
                turnoKey={turno.codigo as 'T1' | 'T2'}
                disponible={turno.disponible || turno.id === idTurnoSel}
                seleccionado={turno.id === idTurnoSel}
                onClick={() => {
                  onTurnoChange(turno.id)
                  setOpen(false)
                }}
              />
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full mt-2 rounded-lg text-xs"
          onClick={() => setOpen(false)}
        >
          Cerrar
        </Button>
      </PopoverContent>
    </Popover>
  )
}
