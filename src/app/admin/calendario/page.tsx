'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'

import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useAuth } from '@/hooks/useAuth'
import { Disponibilidad } from '@/types/calendario.types'

import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import { CalendarioCelda } from '@/components/admin/calendario/CalendarioCelda'
import { CalendarioDayDrawer } from '@/components/admin/calendario/CalendarioDayDrawer'
import { CalendarioAcciones } from '@/components/admin/calendario/CalendarioAcciones'
import { CalendarioLeyenda } from '@/components/admin/calendario/CalendarioLeyenda'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

export default function CalendarioPage() {
  const { idSede } = useAuth()
  const sede = idSede ?? 1

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const inicio = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const fin = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

  const { data: disponibilidades, isLoading } = useDisponibilidadRango(
    sede,
    inicio,
    fin
  )

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })
  const startOffset = getDay(startOfMonth(currentMonth))

  const getDisp = (day: Date): Disponibilidad | undefined =>
    disponibilidades?.find((d) => isSameDay(parseISO(d.fecha), day))

  const totalReservas =
    disponibilidades?.reduce((a, d) => a + (d.totalReservas ?? 0), 0) ?? 0
  const totalEventos =
    disponibilidades?.reduce((a, d) => a + (d.totalEventos ?? 0), 0) ?? 0

  const handleSelectDay = (day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day))
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Calendario' }]} />

      <PageHeader
        title="Calendario"
        description="Control operativo del local — reservas, eventos y disponibilidad"
        actions={<CalendarioAcciones idSede={sede} />}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Reservas del mes',
            value: totalReservas,
            color: 'text-brand-azul',
            bg: 'bg-brand-azul/8',
          },
          {
            label: 'Eventos privados',
            value: totalEventos,
            color: 'text-brand-rosa',
            bg: 'bg-brand-rosa/8',
          },
          {
            label: 'Dias del mes',
            value: days.length,
            color: 'text-gray-700',
            bg: 'bg-gray-100',
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`rounded-2xl border border-gray-100 ${bg} px-4 py-3 flex items-center justify-between`}
          >
            <span className="text-sm text-gray-600">{label}</span>
            <span className={`text-2xl font-black ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl">
        <CardHeader className="pb-0 px-5 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-gray-900 capitalize">
                {format(currentMonth, 'MMMM yyyy', {
                  locale: es,
                })}
              </h2>
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 text-xs"
              >
                {days.length} dias
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl px-3 text-xs font-semibold"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid grid-cols-7 gap-px mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 py-2"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div
                key={`e-${i}`}
                className="h-[88px] sm:h-24 rounded-xl bg-gray-50/60"
              />
            ))}

            {days.map((day) => (
              <CalendarioCelda
                key={day.toISOString()}
                day={day}
                disp={getDisp(day)}
                loading={isLoading}
                selected={!!selectedDate && isSameDay(selectedDate, day)}
                onSelect={handleSelectDay}
              />
            ))}
          </div>

          <CalendarioLeyenda />
        </CardContent>
      </Card>

      <CalendarioDayDrawer
        idSede={sede}
        fecha={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  )
}
