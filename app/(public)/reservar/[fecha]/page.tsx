// app/(public)/reservar/[fecha]/page.tsx

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CheckCircle, ChevronLeft, ChevronRight, Loader2,
  Ticket, User, Baby, FileCheck, CalendarDays, Shield,
} from 'lucide-react'

import { reservaService } from '@/services/reserva.service'
import { useDisponibilidad } from '@/hooks/useDisponibilidad'
import { crearReservaSchema, CrearReservaFormValues } from '@/lib/validations/reserva.schema'
import { CanalReserva } from '@/types/enums'
import { Reserva } from '@/types/reserva.types'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

const SEDE_ID = 1

// ─── Vista de exito ───────────────────────────────────────────────────────────

function SuccessView({ reserva }: { reserva: Reserva }) {
  return (
    <div className="flex flex-col items-center text-center py-16 space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-900">Reserva confirmada</h2>
        <p className="text-gray-500">Tu ticket ha sido generado exitosamente</p>
      </div>

      <Card className="w-full text-left border border-gray-100 shadow-card rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">Detalle del ticket</CardTitle>
            <Badge className="bg-green-100 text-green-800 text-xs border-green-200">
              {reserva.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Numero de ticket</span>
            <span className="font-mono font-black text-gray-900">{reserva.numeroTicket}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span className="font-semibold">{formatDate(reserva.fechaEvento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nino</span>
            <span>{reserva.nombreNino}, {reserva.edadNino} anos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Acompanante</span>
            <span>{reserva.nombreAcompanante}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total pagado</span>
            <span className="text-brand-azul">{formatCurrency(reserva.totalPagado)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button variant="outline" asChild className="flex-1 rounded-full">
          <Link href="/reservar">Nueva reserva</Link>
        </Button>
        <Button
          asChild
          className="flex-1 bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full gap-2"
        >
          <Link href="/cliente/mis-entradas">
            <Ticket className="h-4 w-4" />
            Ver mis entradas
          </Link>
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Recibiras un correo con tu ticket. Presentalo el dia de tu visita.
      </p>
    </div>
  )
}

// ─── Bloque de seccion del formulario ────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <Card className="border border-gray-100 shadow-card rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900">
          <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FormularioReservaPage() {
  const { fecha } = useParams<{ fecha: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const [reservaCreada, setReservaCreada] = useState<Reserva | null>(null)

  const fechaDate = parseISO(fecha)
  const { data: disp } = useDisponibilidad(SEDE_ID, fecha)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CrearReservaFormValues>({
    resolver: zodResolver(crearReservaSchema),
    defaultValues: {
      canalReserva: CanalReserva.ONLINE,
      fechaEvento: fecha,
    },
  })

  const firmo = watch('firmoConsentimiento')

  const crear = useMutation({
    mutationFn: (values: CrearReservaFormValues) =>
      reservaService.crear(
        parseInt(session?.user?.id ?? '0'),
        SEDE_ID,
        values,
      ),
    onSuccess: (reserva) => setReservaCreada(reserva),
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo completar la reserva.')
    },
  })

  if (reservaCreada) return <SuccessView reserva={reservaCreada} />

  return (
    <div className="container max-w-2xl mx-auto px-4 pt-24 pb-12">
      {/* Cabecera */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-gray-500 hover:text-brand-azul gap-1.5 -ml-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Cambiar fecha
        </Button>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Completa tu reserva
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-brand-azul" />
              <span className="font-semibold text-gray-700 capitalize">
                {format(fechaDate, "EEEE d 'de' MMMM yyyy", { locale: es })}
              </span>
            </p>
          </div>
          {disp?.plazasDisponibles !== undefined && (
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
              {disp.plazasDisponibles} plazas disponibles
            </Badge>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit((v) => crear.mutate(v))}
        className="space-y-4"
      >
        {/* Datos del nino */}
        <Section
          icon={<Baby className="h-4 w-4 text-brand-azul" />}
          title="Datos del nino"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nombreNino" className="text-sm font-semibold">
                Nombre completo del nino
              </Label>
              <Input
                id="nombreNino"
                placeholder="Ana Garcia"
                className="h-11 rounded-xl"
                {...register('nombreNino')}
              />
              {errors.nombreNino && (
                <p className="text-xs text-destructive">{errors.nombreNino.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edadNino" className="text-sm font-semibold">
                Edad del nino
              </Label>
              <Input
                id="edadNino"
                type="number"
                min={0}
                max={17}
                placeholder="5"
                className="h-11 rounded-xl"
                {...register('edadNino', { valueAsNumber: true })}
              />
              {errors.edadNino && (
                <p className="text-xs text-destructive">{errors.edadNino.message}</p>
              )}
            </div>
          </div>
        </Section>

        {/* Datos del acompanante */}
        <Section
          icon={<User className="h-4 w-4 text-brand-azul" />}
          title="Datos del acompanante adulto"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombreAcompanante" className="text-sm font-semibold">
                Nombre completo
              </Label>
              <Input
                id="nombreAcompanante"
                placeholder="Carlos Garcia"
                className="h-11 rounded-xl"
                {...register('nombreAcompanante')}
              />
              {errors.nombreAcompanante && (
                <p className="text-xs text-destructive">{errors.nombreAcompanante.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dniAcompanante" className="text-sm font-semibold">
                DNI del acompanante
              </Label>
              <Input
                id="dniAcompanante"
                placeholder="12345678"
                maxLength={8}
                className="h-11 rounded-xl"
                {...register('dniAcompanante')}
              />
              {errors.dniAcompanante && (
                <p className="text-xs text-destructive">{errors.dniAcompanante.message}</p>
              )}
            </div>
          </div>
        </Section>

        {/* Consentimiento */}
        <Section
          icon={<FileCheck className="h-4 w-4 text-brand-azul" />}
          title="Consentimiento y confirmacion"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-brand-azul shrink-0" />
                <p className="font-bold text-gray-900">Terminos de uso del local</p>
              </div>
              <ul className="space-y-1.5 list-none">
                {[
                  'El adulto acompanante es responsable del nino en todo momento.',
                  'El local no se responsabiliza por lesiones derivadas del uso inadecuado.',
                  'Esta prohibido el ingreso con alimentos o bebidas externas.',
                  'Kiki y Lala se reserva el derecho de cancelar por fuerza mayor.',
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-azul shrink-0 mt-1.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consentimiento"
                className="mt-0.5"
                checked={!!firmo}
                onCheckedChange={(v) =>
                  setValue(
                    'firmoConsentimiento',
                    v === true ? true : (undefined as unknown as true),
                  )
                }
              />
              <Label
                htmlFor="consentimiento"
                className="text-sm leading-relaxed cursor-pointer text-gray-700"
              >
                He leido y acepto los terminos de uso. Confirmo que soy mayor de edad y
                acompanare al nino durante toda la visita.
              </Label>
            </div>
            {errors.firmoConsentimiento && (
              <p className="text-xs text-destructive">{errors.firmoConsentimiento.message}</p>
            )}
          </div>
        </Section>

        {/* Footer del formulario */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <p className="text-sm text-gray-500">
            Precio:{' '}
            <span className="font-bold text-gray-900">
              {disp?.tipoDia === 'SEMANA' ? 'S/ 25' : 'S/ 35'} por nino
            </span>
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={crear.isPending}
            className="w-full sm:w-auto bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-8 gap-2"
          >
            {crear.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
            ) : (
              <><Ticket className="h-4 w-4" /> Confirmar reserva</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}