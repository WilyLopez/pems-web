// app/(public)/reservar/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, isSameMonth, isToday, parseISO,
  isSameDay, isBefore, startOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, CalendarDays, Lock,
  Users, Ticket, PartyPopper, CheckCircle,
} from 'lucide-react'

import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { Disponibilidad } from '@/types/calendario.types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const DAYS_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const SEDE_ID = 1

interface DayCellProps {
  day: Date
  disp?: Disponibilidad
  selected: boolean
  onSelect: (date: Date) => void
}

function DayCell({ day, disp, selected, onSelect }: DayCellProps) {
  const hoy = startOfDay(new Date())
  const pasado = isBefore(day, hoy)
  const bloqueado = !disp?.accesoPublicoActivo || disp?.bloqueadoManualmente
  const lleno = disp?.aforoCompleto
  const disabled = pasado || bloqueado || lleno || !disp

  return (
    <button
      disabled={disabled}
      onClick={() => onSelect(day)}
      className={cn(
        'relative h-16 sm:h-20 w-full rounded-xl border p-1.5 flex flex-col gap-0.5 transition-all text-left',
        selected && 'border-brand-azul bg-brand-azul/8 ring-1 ring-brand-azul',
        !selected && !disabled && 'hover:border-brand-azul/40 hover:bg-brand-azul/4',
        disabled && 'opacity-35 cursor-not-allowed bg-gray-50',
        isToday(day) && !selected && 'border-brand-rosa/50',
      )}
    >
      <span
        className={cn(
          'text-sm font-bold leading-none',
          selected && 'text-brand-azul',
          isToday(day) && !selected && 'text-brand-rosa',
          !selected && !isToday(day) && 'text-gray-700',
        )}
      >
        {format(day, 'd')}
      </span>

      {disp && !disabled && (
        <span className="text-[10px] text-green-600 font-semibold leading-none">
          {disp.plazasDisponibles} pl.
        </span>
      )}
      {bloqueado && !pasado && (
        <Lock className="h-3 w-3 text-gray-400 mt-auto" />
      )}
      {lleno && !pasado && !bloqueado && (
        <span className="text-[10px] text-red-500 font-semibold leading-none">
          Lleno
        </span>
      )}
    </button>
  )
}


export default function ReservarPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const inicio = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const fin    = format(endOfMonth(currentMonth),   'yyyy-MM-dd')

  const { data: disponibilidades, isLoading } = useDisponibilidadRango(
    SEDE_ID, inicio, fin,
  )

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end:   endOfMonth(currentMonth),
  })
  const startOffset = getDay(startOfMonth(currentMonth))

  const getDisp = (day: Date) =>
    disponibilidades?.find((d) => isSameDay(parseISO(d.fecha), day))

  const selectedDisp = selectedDate ? getDisp(selectedDate) : null

  const handleContinuar = () => {
    if (!selectedDate) return
    const fechaStr = format(selectedDate, 'yyyy-MM-dd')
    if (!session) {
      router.push(`/auth/login?callbackUrl=/reservar/${fechaStr}`)
      return
    }
    router.push(`/reservar/${fechaStr}`)
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 pt-24 pb-12">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Selecciona una fecha
        </h1>
        <p className="text-gray-500">
          Elige el dia en que deseas visitar Kiki y Lala
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-100 shadow-card rounded-2xl">
            <CardContent className="p-4 sm:p-6 relative">
              {/* Cabecera del mes */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Grilla */}
              <div className="grid grid-cols-7 gap-1">
                {DAYS_LABELS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[11px] font-semibold text-gray-400 py-1.5 uppercase tracking-wide"
                  >
                    {d}
                  </div>
                ))}

                {/* Celdas vacias al inicio */}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Dias del mes */}
                {days.map((day) => (
                  <DayCell
                    key={day.toISOString()}
                    day={day}
                    disp={getDisp(day)}
                    selected={!!selectedDate && isSameDay(day, selectedDate)}
                    onSelect={setSelectedDate}
                  />
                ))}
              </div>

              {/* Overlay de carga */}
              {isLoading && (
                <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              )}

              {/* Leyenda */}
              <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-green-100 border border-green-300 shrink-0" />
                  Disponible
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-gray-100 border border-gray-200 shrink-0" />
                  Sin plazas / cerrado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-brand-azul/15 border border-brand-azul shrink-0" />
                  Seleccionado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-white border border-brand-rosa/50 shrink-0" />
                  Hoy
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <Card
            className={cn(
              'border border-gray-100 shadow-card rounded-2xl transition-opacity',
              !selectedDate && 'opacity-60',
            )}
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-azul/10 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-brand-azul" />
                </div>
                <h3 className="font-bold text-gray-900">Resumen</h3>
              </div>

              {selectedDate ? (
                <>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Tipo de dia</span>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-brand-azul/10 text-brand-azul border-brand-azul/20"
                      >
                        {selectedDisp?.tipoDia === 'SEMANA' ? 'Semana' : 'Fin de semana'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plazas</span>
                      <span className="font-semibold text-green-600">
                        {selectedDisp?.plazasDisponibles ?? 0} disponibles
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold gap-2"
                    onClick={handleContinuar}
                  >
                    Continuar
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {!session && (
                    <p className="text-xs text-center text-gray-400">
                      Necesitaras iniciar sesion para completar la reserva
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Selecciona un dia disponible en el calendario para continuar.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bloque informativo */}
          <Card className="border border-gray-100 shadow-card rounded-2xl bg-brand-azul/4">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Ticket className="h-4 w-4 text-brand-azul" />
                Como funciona
              </div>
              <ul className="space-y-2 text-xs text-gray-600">
                {[
                  'Elige la fecha disponible',
                  'Completa los datos del nino',
                  'Firma el consentimiento',
                  'Recibe tu ticket digital',
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-brand-azul text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* CTA evento privado */}
          <Card className="border border-brand-rosa/20 shadow-card rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <PartyPopper className="h-4 w-4 text-brand-rosa" />
                ¿Quieres el local completo?
              </div>
              <p className="text-xs text-gray-500">
                Organiza un cumpleaños exclusivo con decoración personalizada
                para hasta 60 personas.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5"
                asChild
              >
                <Link href="/eventos">Ver paquetes de eventos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}