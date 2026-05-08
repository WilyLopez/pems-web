'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react'

import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useAuth } from '@/hooks/useAuth'
import { Disponibilidad } from '@/types/calendario.types'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function DisponibilidadCell({ disp }: { disp?: Disponibilidad }) {
  if (!disp) return null
  if (!disp.accesoPublicoActivo || disp.bloqueadoManualmente) {
    return (
      <div className="flex items-center gap-0.5 mt-0.5">
        <Lock className="h-2.5 w-2.5 text-red-500" />
        <span className="text-xs text-red-500">Bloqueado</span>
      </div>
    )
  }
  if (disp.aforoCompleto) {
    return <Badge variant="secondary" className="text-xs py-0 bg-red-100 text-red-700">Lleno</Badge>
  }
  return (
    <span className="text-xs text-green-600 font-medium">
      {disp.plazasDisponibles} plazas
    </span>
  )
}

export default function CalendarioPage() {
  const { idSede } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const inicio = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const fin = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

  const { data: disponibilidades, isLoading } = useDisponibilidadRango(
    idSede ?? 1, inicio, fin
  )

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startDayOfWeek = getDay(startOfMonth(currentMonth))

  const getDisp = (day: Date): Disponibilidad | undefined =>
    disponibilidades?.find((d) => isSameDay(parseISO(d.fecha), day))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Calendario"
        description="Disponibilidad y gestión del calendario del local"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Lock className="mr-2 h-4 w-4" />
              Bloquear fechas
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar feriado
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentMonth(new Date())}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                {d}
              </div>
            ))}

            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 bg-muted/20 rounded-md" />
            ))}

            {days.map((day) => {
              const disp = getDisp(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const today = isToday(day)
              const bloqueado = disp && (!disp.accesoPublicoActivo || disp.bloqueadoManualmente)

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'h-20 rounded-md p-1.5 border transition-colors cursor-pointer hover:border-primary/50',
                    !isCurrentMonth && 'opacity-30',
                    today && 'border-primary bg-primary/5',
                    bloqueado && 'bg-red-50 border-red-200',
                  )}
                >
                  {isLoading ? (
                    <Skeleton className="h-4 w-4 rounded" />
                  ) : (
                    <>
                      <span className={cn(
                        'text-sm font-medium',
                        today && 'text-primary',
                        bloqueado && 'text-red-500',
                      )}>
                        {format(day, 'd')}
                      </span>
                      <DisponibilidadCell disp={disp} />
                      {disp && !bloqueado && (
                        <div className="mt-1 space-y-0.5">
                          {!disp.turnoT1Disponible && (
                            <span className="block text-xs text-amber-600">T1 ocupado</span>
                          )}
                          {!disp.turnoT2Disponible && (
                            <span className="block text-xs text-amber-600">T2 ocupado</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-primary/20 border border-primary" /> Hoy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-50 border border-red-200" /> Bloqueado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-background border" /> Disponible
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}