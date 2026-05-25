'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Ticket,
  PartyPopper,
  TrendingUp,
  CalendarDays,
  LayoutGrid,
  Columns,
  CalendarCheck,
} from 'lucide-react'

import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useAuth } from '@/hooks/useAuth'
import { Disponibilidad } from '@/types/calendario.types'

import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { formatCurrency } from '@/lib/utils'

import { CalendarioCelda } from '@/components/admin/calendario/CalendarioCelda'
import { CalendarioDayDrawer } from '@/components/admin/calendario/CalendarioDayDrawer'
import { CalendarioSemana } from '@/components/admin/calendario/CalendarioSemana'
import { CalendarioDia } from '@/components/admin/calendario/CalendarioDia'
import { CalendarioAcciones } from '@/components/admin/calendario/CalendarioAcciones'
import { CalendarioLeyenda } from '@/components/admin/calendario/CalendarioLeyenda'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

type Vista = 'mes' | 'semana' | 'dia'

const VISTAS: { key: Vista; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'mes', label: 'Mes', Icon: LayoutGrid },
  { key: 'semana', label: 'Semana', Icon: Columns },
  { key: 'dia', label: 'Dia', Icon: CalendarCheck },
]

export default function CalendarioPage() {
  const { idSede } = useAuth()
  const sede = idSede ?? 1

  const [currentDate, setCurrentDate] = useState(new Date())
  const [vista, setVista] = useState<Vista>('mes')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const inicio = format(
    vista === 'mes'
      ? startOfMonth(currentDate)
      : vista === 'semana'
      ? startOfWeek(currentDate, { weekStartsOn: 0 })
      : currentDate,
    'yyyy-MM-dd'
  )
  const fin = format(
    vista === 'mes'
      ? endOfMonth(currentDate)
      : vista === 'semana'
      ? endOfWeek(currentDate, { weekStartsOn: 0 })
      : currentDate,
    'yyyy-MM-dd'
  )

  const { data: disponibilidades, isLoading } = useDisponibilidadRango(sede, inicio, fin)

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })
  const startOffset = getDay(startOfMonth(currentDate))

  const getDisp = (day: Date): Disponibilidad | undefined =>
    disponibilidades?.find((d) => isSameDay(parseISO(d.fecha), day))

  const totalReservas = disponibilidades?.reduce((a, d) => a + (d.totalReservas ?? 0), 0) ?? 0
  const totalEventos = disponibilidades?.reduce((a, d) => a + (d.totalEventos ?? 0), 0) ?? 0
  const totalIngresos = disponibilidades?.reduce((acc, d) => acc + (d.ingresoEstimado ?? 0), 0) ?? 0

  const handleSelectDay = (day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day))
  }

  const handlePrev = () => {
    if (vista === 'mes') setCurrentDate(subMonths(currentDate, 1))
    else if (vista === 'semana') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subDays(currentDate, 1))
  }

  const handleNext = () => {
    if (vista === 'mes') setCurrentDate(addMonths(currentDate, 1))
    else if (vista === 'semana') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const titleLabel = (() => {
    if (vista === 'mes') return format(currentDate, 'MMMM yyyy', { locale: es })
    if (vista === 'semana') {
      const ini = startOfWeek(currentDate, { weekStartsOn: 0 })
      const fin = endOfWeek(currentDate, { weekStartsOn: 0 })
      return `${format(ini, 'd MMM', { locale: es })} — ${format(fin, 'd MMM yyyy', { locale: es })}`
    }
    return format(currentDate, "EEEE d 'de' MMMM yyyy", { locale: es })
  })()

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
            sub: 'confirmadas este mes',
            value: String(totalReservas),
            color: 'text-brand-azul',
            bg: 'bg-brand-azul/8',
            iconColor: 'text-brand-azul',
            Icon: Ticket,
          },
          {
            label: 'Eventos privados',
            sub: 'eventos programados',
            value: String(totalEventos),
            color: 'text-brand-rosa',
            bg: 'bg-brand-rosa/8',
            iconColor: 'text-brand-rosa',
            Icon: PartyPopper,
          },
          {
            label: 'Ingresos estimados',
            sub: 'proyectado del mes',
            value: formatCurrency(totalIngresos, 0),
            color: 'text-green-700',
            bg: 'bg-green-50',
            iconColor: 'text-green-700',
            Icon: TrendingUp,
          },
        ].map(({ label, sub, value, color, bg, iconColor, Icon }) => (
          <div
            key={label}
            className={`rounded-2xl border border-gray-100 ${bg} px-4 py-3 flex items-center justify-between gap-3`}
          >
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className={`text-2xl font-black ${color} leading-tight`}>{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </div>
            <Icon className={`h-7 w-7 shrink-0 opacity-60 ${iconColor}`} />
          </div>
        ))}
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl">
        <CardHeader className="pb-0 px-5 pt-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-black text-gray-900 capitalize">{titleLabel}</h2>
              {vista === 'mes' && (
                <>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                    {days.length} dias
                  </Badge>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                        <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="start">
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const m = new Date(currentDate.getFullYear(), i, 1)
                          const isActive = i === currentDate.getMonth()
                          return (
                            <button
                              key={i}
                              onClick={() => setCurrentDate(m)}
                              className={`rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                                isActive
                                  ? 'bg-brand-azul text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {format(m, 'MMM', { locale: es })}
                            </button>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-gray-200 p-0.5 gap-0.5">
                {VISTAS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setVista(key)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      vista === key
                        ? 'bg-brand-azul text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl px-3 text-xs font-semibold"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoy
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {vista === 'mes' && (
            <>
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

              <div
                key={format(currentDate, 'yyyy-MM')}
                className="grid grid-cols-7 gap-1 animate-fade-in"
              >
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-[88px] sm:h-24 rounded-xl bg-gray-50/40" />
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
            </>
          )}

          {vista === 'semana' && (
            <CalendarioSemana
              semanaInicio={startOfWeek(currentDate, { weekStartsOn: 0 })}
              disponibilidades={disponibilidades ?? []}
              isLoading={isLoading}
              selectedDate={selectedDate}
              onSelectDay={handleSelectDay}
            />
          )}

          {vista === 'dia' && (
            <CalendarioDia fecha={currentDate} idSede={sede} />
          )}
        </CardContent>
      </Card>

      {vista !== 'dia' && (
        <CalendarioDayDrawer
          idSede={sede}
          fecha={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
