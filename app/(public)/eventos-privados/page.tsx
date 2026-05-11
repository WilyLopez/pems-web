// app/(public)/eventos-privados/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  PartyPopper, CheckCircle, Clock, Users, Loader2,
  ChevronLeft, CalendarDays, Phone, Ticket,
} from 'lucide-react'

import { eventoService } from '@/services/evento.service'
import { EventoPrivado } from '@/types/evento.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'


const solicitudSchema = z.object({
  idTurno:            z.string().min(1, 'Selecciona un turno'),
  fechaEvento:        z.string().min(1, 'Selecciona una fecha'),
  tipoEvento:         z.string().min(2, 'Describe el tipo de evento').max(200),
  contactoAdicional:  z.string().optional(),
  aforoDeclarado:     z.string().optional(),
})

type SolicitudFormValues = z.infer<typeof solicitudSchema>


const TURNOS = [
  { id: '1', label: 'Turno manana',  horario: '10:00 - 14:00' },
  { id: '2', label: 'Turno tarde',   horario: '16:00 - 20:00' },
]

const BENEFICIOS = [
  { icon: Users,        text: 'Uso exclusivo de todo el local'    },
  { icon: PartyPopper,  text: 'Decoracion personalizada incluida'  },
  { icon: CheckCircle,  text: 'Coordinador de eventos dedicado'    },
  { icon: Users,        text: 'Hasta 60 invitados'                 },
  { icon: Ticket,       text: 'Contrato y ticket digital'          },
  { icon: CheckCircle,  text: 'Facturacion electronica'            },
]


function SuccessView({ evento }: { evento: EventoPrivado }) {
  return (
    <div className="flex flex-col items-center text-center py-16 space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-900">Solicitud recibida</h2>
        <p className="text-gray-500">
          Nos pondremos en contacto contigo para confirmar los detalles del evento.
        </p>
      </div>

      <Card className="w-full text-left border border-gray-100 shadow-card rounded-2xl">
        <CardContent className="p-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha solicitada</span>
            <span className="font-semibold">{formatDate(evento.fechaEvento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Turno</span>
            <span>{evento.turno}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tipo de evento</span>
            <span>{evento.tipoEvento}</span>
          </div>
          <Separator />
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 border-amber-200 text-xs"
          >
            Estado: {evento.estado}
          </Badge>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button variant="outline" asChild className="flex-1 rounded-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button
          asChild
          className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full gap-2"
        >
          <Link href="/cliente/mis-eventos">
            <PartyPopper className="h-4 w-4" />
            Ver mis eventos
          </Link>
        </Button>
      </div>
    </div>
  )
}


export default function EventosPrivadosPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const paqueteParam = searchParams.get('paquete') ?? ''
  const [eventoCreado, setEventoCreado] = useState<EventoPrivado | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: {
      tipoEvento: paqueteParam
        ? `Cumpleanos - Paquete ${paqueteParam.charAt(0).toUpperCase() + paqueteParam.slice(1)}`
        : '',
    },
  })

  const turnoSeleccionado = watch('idTurno')

  const solicitar = useMutation({
    mutationFn: (values: SolicitudFormValues) => {
      if (!session) throw new Error('Debes iniciar sesion')
      return eventoService.solicitar(
        parseInt(session.user.id),
        1,
        {
          idTurno:           parseInt(values.idTurno),
          fechaEvento:       values.fechaEvento,
          tipoEvento:        values.tipoEvento,
          contactoAdicional: values.contactoAdicional,
          aforoDeclarado:    values.aforoDeclarado
            ? parseInt(values.aforoDeclarado)
            : undefined,
        },
      )
    },
    onSuccess: (evento) => setEventoCreado(evento),
    onError: (err: { message?: string }) => {
      if (!session) {
        router.push('/auth/login?callbackUrl=/eventos-privados')
        return
      }
      toast.error(err?.message ?? 'No se pudo enviar la solicitud.')
    },
  })

  if (eventoCreado) return <SuccessView evento={eventoCreado} />

  return (
    <div className="container max-w-5xl mx-auto px-4 pt-24 pb-12">
      {/* Cabecera */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-gray-500 hover:text-brand-rosa gap-1.5 -ml-2"
          asChild
        >
          <Link href="/eventos">
            <ChevronLeft className="h-4 w-4" />
            Ver todos los paquetes
          </Link>
        </Button>

        <div className="space-y-2">
          <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20">
            Eventos Privados
          </Badge>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            Solicita tu evento privado
          </h1>
          <p className="text-gray-500 max-w-xl">
            Completa el formulario y nuestro equipo se comunicara contigo
            en menos de 24 horas para confirmar todos los detalles.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Sidebar con beneficios */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-gray-100 shadow-card rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Que incluye?</h2>
              <ul className="space-y-3">
                {BENEFICIOS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-brand-rosa/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-brand-rosa" />
                    </div>
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-card rounded-2xl">
            <CardContent className="p-6 space-y-3">
              <h2 className="font-bold text-gray-900">Turnos disponibles</h2>
              {TURNOS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center shrink-0">
                    <Clock className="h-3.5 w-3.5 text-brand-azul" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{t.label}</span>
                    <span className="text-gray-500 ml-2">{t.horario}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-brand-amarillo/30 bg-brand-amarillo/8 rounded-2xl shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-yellow-700" />
                <span className="text-sm font-bold text-yellow-800">
                  Capacidad máxima
                </span>
              </div>
              <p className="text-2xl font-black text-yellow-900">60 personas</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Niños y adultos incluidos
              </p>
            </CardContent>
          </Card>

          <div className="text-center">
            <a
              href="https://wa.me/51999999999"
              className="inline-flex items-center gap-2 text-sm text-green-600 font-semibold hover:underline"
            >
              <Phone className="h-4 w-4" />
              Prefiero coordinar por WhatsApp
            </a>
          </div>
        </div>

        {/* Formulario */}
        <Card className="lg:col-span-3 border border-gray-100 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-rosa/10 flex items-center justify-center">
                <PartyPopper className="h-4 w-4 text-brand-rosa" />
              </div>
              Datos del evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((v) => solicitar.mutate(v))}
              className="space-y-5"
            >
              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fechaEvento" className="text-sm font-semibold">
                  Fecha del evento
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    id="fechaEvento"
                    className="h-11 rounded-xl pl-9"
                    {...register('fechaEvento')}
                  />
                </div>
                {errors.fechaEvento && (
                  <p className="text-xs text-destructive">{errors.fechaEvento.message}</p>
                )}
              </div>

              {/* Turno */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Turno preferido</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TURNOS.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setValue('idTurno', t.id)}
                      className={`border rounded-xl p-3.5 text-left transition-all ${
                        turnoSeleccionado === t.id
                          ? 'border-brand-rosa bg-brand-rosa/6 ring-1 ring-brand-rosa'
                          : 'border-gray-200 hover:border-brand-rosa/40 hover:bg-brand-rosa/3'
                      }`}
                    >
                      <p className="text-sm font-bold text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.horario}</p>
                    </button>
                  ))}
                </div>
                {errors.idTurno && (
                  <p className="text-xs text-destructive">{errors.idTurno.message}</p>
                )}
              </div>

              {/* Tipo de evento */}
              <div className="space-y-2">
                <Label htmlFor="tipoEvento" className="text-sm font-semibold">
                  Tipo de evento
                </Label>
                <Input
                  id="tipoEvento"
                  placeholder="Ej: Cumpleanos de 5 anos, Baby shower..."
                  className="h-11 rounded-xl"
                  {...register('tipoEvento')}
                />
                {errors.tipoEvento && (
                  <p className="text-xs text-destructive">{errors.tipoEvento.message}</p>
                )}
              </div>

              {/* Aforo */}
              <div className="space-y-2">
                <Label htmlFor="aforoDeclarado" className="text-sm font-semibold">
                  Numero de invitados{' '}
                  <span className="text-gray-400 font-normal">(aproximado)</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="aforoDeclarado"
                    type="number"
                    min={1}
                    max={60}
                    placeholder="20"
                    className="h-11 rounded-xl pl-9"
                    {...register('aforoDeclarado')}
                  />
                </div>
              </div>

              {/* Contacto adicional */}
              <div className="space-y-2">
                <Label htmlFor="contactoAdicional" className="text-sm font-semibold">
                  Telefono adicional{' '}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactoAdicional"
                    placeholder="987654321"
                    className="h-11 rounded-xl pl-9"
                    {...register('contactoAdicional')}
                  />
                </div>
              </div>

              <Separator />

              <Button
                type="submit"
                className="w-full h-12 bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full gap-2 text-base"
                disabled={solicitar.isPending}
              >
                {solicitar.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Enviando solicitud...</>
                ) : (
                  <><PartyPopper className="h-5 w-5" /> Enviar solicitud</>
                )}
              </Button>

              {!session && (
                <p className="text-xs text-center text-gray-400">
                  Necesitaras{' '}
                  <Link href="/auth/login" className="underline text-brand-azul font-semibold">
                    iniciar sesion
                  </Link>
                  {' '}para enviar la solicitud
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 