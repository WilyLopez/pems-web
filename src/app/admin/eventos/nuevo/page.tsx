'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  format,
  addDays,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { BotonTurno } from '@/components/admin/eventos/BotonTurno'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const DAYS_HEADER = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

export default function NuevoEventoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { idSede } = useAuth()
  const sede = idSede ?? 1

  const { data: config } = useConfiguracionCalendario(sede)
  const diasMin = config?.diasMinEventoPrivado ?? 15
  const diasMax = config?.diasMaxEventoPrivado ?? 365

  const fechaParam = searchParams.get('fecha')
  const turnoParam = searchParams.get('turno') as 'T1' | 'T2' | null

  const [currentDate, setCurrentDate] = useState(() => {
    if (fechaParam) return parseISO(fechaParam)
    return addDays(new Date(), diasMin)
  })
  const [fechaSel, setFechaSel] = useState<string | null>(fechaParam)
  const [turnoSel, setTurnoSel] = useState<'T1' | 'T2' | null>(turnoParam)

  const minDate = format(addDays(new Date(), diasMin), 'yyyy-MM-dd')
  const maxDate = format(addDays(new Date(), diasMax), 'yyyy-MM-dd')

  const inicio = format(
    startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
    'yyyy-MM-dd'
  )
  const fin = format(
    endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
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

  const esFechaHabilitada = (day: Date): boolean => {
    const f = format(day, 'yyyy-MM-dd')
    if (f < minDate || f > maxDate) return false
    const disp = getDisp(day)
    if (!disp) return false
    return disp.turnoT1Disponible || disp.turnoT2Disponible
  }

  const dispSel = fechaSel
    ? disponibilidades?.find((d) => d.fecha === fechaSel)
    : undefined

  const handleContinuar = () => {
    if (!fechaSel || !turnoSel) return
    router.push(`/admin/eventos/nuevo/formulario?fecha=${fechaSel}&turno=${turnoSel}`)
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Eventos', href: '/admin/eventos' },
          { label: 'Nuevo evento' },
        ]}
      />
      <PageHeader
        title="Nuevo evento privado"
        description="Selecciona la fecha y el turno para el evento"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-gray-900 capitalize text-base">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Disponible desde {format(addDays(new Date(), diasMin), "d 'de' MMMM", { locale: es })} hasta{' '}
            {format(addDays(new Date(), diasMax), "d 'de' MMMM yyyy", { locale: es })}.
          </p>

          <div className="grid grid-cols-7 gap-px mb-1">
            {DAYS_HEADER.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`e-${i}`} className="h-12 rounded-xl bg-gray-50/40" />
            ))}
            {days.map((day) => {
              const habilitado = esFechaHabilitada(day)
              const f = format(day, 'yyyy-MM-dd')
              const seleccionado = fechaSel === f
              const hoy = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  disabled={!habilitado || isLoading}
                  onClick={() => {
                    setFechaSel(f)
                    setTurnoSel(null)
                  }}
                  className={cn(
                    'h-12 w-full rounded-xl border text-sm font-bold transition-all',
                    seleccionado
                      ? 'bg-brand-rosa text-white border-brand-rosa'
                      : habilitado
                      ? 'border-gray-200 hover:border-brand-rosa/50 hover:bg-brand-rosa/5 text-gray-800'
                      : 'border-transparent bg-gray-50/60 text-gray-300 cursor-not-allowed',
                    hoy && !seleccionado && habilitado && 'border-brand-azul/40'
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          {fechaSel && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Fecha seleccionada</p>
                <p className="font-black text-gray-900 capitalize mt-1">
                  {format(parseISO(fechaSel), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Selecciona el turno</p>
                <div className="space-y-2">
                  <BotonTurno
                    label="Manana"
                    horario={`${config?.turnoT1Inicio ?? '10:00'}-${config?.turnoT1Fin ?? '14:00'}`}
                    turnoKey="T1"
                    disponible={dispSel?.turnoT1Disponible ?? false}
                    seleccionado={turnoSel === 'T1'}
                    onClick={() => setTurnoSel('T1')}
                  />
                  <BotonTurno
                    label="Tarde"
                    horario={`${config?.turnoT2Inicio ?? '16:00'}-${config?.turnoT2Fin ?? '20:00'}`}
                    turnoKey="T2"
                    disponible={dispSel?.turnoT2Disponible ?? false}
                    seleccionado={turnoSel === 'T2'}
                    onClick={() => setTurnoSel('T2')}
                  />
                </div>
              </div>
            </div>
          )}

          {!fechaSel && (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 flex flex-col items-center justify-center gap-2 min-h-[160px]">
              <PartyPopper className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400 text-center">Selecciona una fecha en el calendario para ver los turnos disponibles.</p>
            </div>
          )}

          <Button
            className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-2xl font-bold py-3"
            disabled={!fechaSel || !turnoSel}
            onClick={handleContinuar}
          >
            Continuar al formulario
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
