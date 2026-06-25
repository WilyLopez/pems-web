'use client'

import React, { useMemo, useState } from 'react'
import { format, addDays, isToday, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Controller, useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Ticket, CreditCard, AlertCircle, User } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import { useConfiguracionCalendario, useConfiguracionVenta } from '@/hooks/useConfiguracion'
import { usePromociones } from '@/hooks/usePromocion'
import { useDebounce } from '@/hooks/useDebounce'
import {
  usePrecioDia,
  useRegistrarVentaMostrador,
} from '../../hooks/useVentasData'
import { useDisponibilidad } from '@/features/admin/calendario/hooks/useCalendarData'
import { useClienteDetail } from '@/features/admin/clientes/hooks/useClientesData'
import { VentaMostradorResponse, PagoLinea } from '../../types'
import { Cliente } from '@/types/cliente.types'
import { buildVentaMostradorSchema, VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'
import { calcularResumenVenta, VUELTO_SOSPECHOSO } from '../../utils/ventas.utils'
import { VentaExitosaModal } from '../modals/VentaExitosaModal'

import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'

import { ClienteBusqueda } from '../forms/ClienteBusqueda'
import { RegistroNinos } from '../forms/RegistroNinos'
import { PagoPosForm } from '../forms/PagoPosForm'
import { ResumenVenta } from '../forms/ResumenVenta'
import { formatCurrency, cn } from '@/lib/utils'

interface VentaMostradorViewProps {
  onClose?: () => void
}

export const VentaMostradorView = ({ onClose }: VentaMostradorViewProps) => {
  const { idSede } = useAuth()
  const { edadMin, edadMax } = useConfiguracionVenta()
  const { data: confCal } = useConfiguracionCalendario(idSede ?? null)
  const diasMaxFecha = confCal?.diasMaxReservaPublica ?? 14

  const [paso, setPaso] = useState<1 | 2>(1)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [ventaExitosa, setVentaExitosa] = useState<VentaMostradorResponse | null>(null)
  const [confirmandoVueltoAlto, setConfirmandoVueltoAlto] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlClienteId = searchParams.get('clienteId')
  const parsedClienteId = urlClienteId ? Number(urlClienteId) : null
  const { data: fetchedCliente } = useClienteDetail(parsedClienteId)

  React.useEffect(() => {
    if (fetchedCliente) {
      setCliente(fetchedCliente as any)
      setPaso(2)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('clienteId')
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [fetchedCliente, pathname, router, searchParams])

  const schema = useMemo(() => buildVentaMostradorSchema(edadMin, edadMax), [edadMin, edadMax])

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<VentaMostradorFormValues>({
    resolver: zodResolver(schema) as Resolver<VentaMostradorFormValues>,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      fechaVisita: format(new Date(), 'yyyy-MM-dd'),
      ninos: [{ nombreNino: '', edadNino: edadMin }],
      acompanante: { nombre: '', dni: '', telefono: '' },
      idPromocion: null,
      pagos: [{ medioPago: 'EFECTIVO', monto: 0 }],
      efectivoRecibido: 0,
      actaFirmada: false,
    },
  })

  const fechaVisita = watch('fechaVisita')
  const ninos = watch('ninos')
  const idPromocion = watch('idPromocion')
  const pagos = watch('pagos')
  const efectivoRecibido = watch('efectivoRecibido')

  const debouncedFecha = useDebounce(fechaVisita, 400)

  const { data: precioDia } = usePrecioDia(idSede ?? null, debouncedFecha)
  const { data: disponibilidad, isLoading: isLoadingDisp } = useDisponibilidad(idSede ?? 0, debouncedFecha)
  const { data: promociones } = usePromociones()
  const registrar = useRegistrarVentaMostrador()

  const tieneMetodoEfectivo = (pagos as PagoLinea[]).some((p) => p.medioPago === 'EFECTIVO')
  React.useEffect(() => {
    if (!tieneMetodoEfectivo) {
      setValue('efectivoRecibido', 0)
    }
  }, [tieneMetodoEfectivo, setValue])

  const precioUnit = precioDia?.precio ?? 0
  const promocionActual = promociones?.find((p) => p.id === idPromocion && p.activo)

  const {
    subtotal,
    descuento,
    total,
    sumaPagos,
    efectivoAplicado,
    vuelto,
    montosCoinciden,
  } = useMemo(
    () => calcularResumenVenta(precioUnit, ninos, promocionActual, pagos as any, efectivoRecibido),
    [precioUnit, ninos, promocionActual, pagos, efectivoRecibido]
  )

  const efectivoInsuficiente = useMemo(() => {
    return efectivoAplicado > 0 && efectivoRecibido < efectivoAplicado
  }, [efectivoAplicado, efectivoRecibido])

  const esHoy = useMemo(() => isToday(parseISO(fechaVisita)), [fechaVisita])

  const fueraDeHorario = useMemo(() => {
    if (!esHoy || !confCal) return false
    const ahora = new Date()
    const horaActual = ahora.getHours() * 100 + ahora.getMinutes()
    const [hCierra, mCierra] = confCal.turnoT2Fin.split(':').map(Number)
    const horaCierra = hCierra * 100 + mCierra
    return horaActual > horaCierra
  }, [esHoy, confCal])

  const estaBloqueado = useMemo(() => {
    if (isLoadingDisp || !disponibilidad) return false
    if (fueraDeHorario) return true
    return !disponibilidad.disponiblePublico
  }, [disponibilidad, isLoadingDisp, fueraDeHorario])

  const plazasDisponibles = disponibilidad?.plazasDisponibles
  const exceedsAforo = plazasDisponibles != null && ninos.length > plazasDisponibles
  const precioValido = !precioDia || precioDia.precio > 0

  const puedeRegistrar =
    isValid &&
    montosCoinciden &&
    !estaBloqueado &&
    !registrar.isPending &&
    !efectivoInsuficiente &&
    precioValido &&
    !exceedsAforo

  const ejecutarRegistro = async (formData: VentaMostradorFormValues) => {
    if (!idSede) return
    try {
      const res = await registrar.mutateAsync({
        tipoVenta: 'RESERVA',
        sedeId: idSede,
        clienteId: cliente?.id,
        fechaVisita: formData.fechaVisita,
        nombreAcompanante: formData.acompanante.nombre,
        dniAcompanante: formData.acompanante.dni,
        telefonoAcompanante: formData.acompanante.telefono,
        ninos: formData.ninos,
        idPromocion: formData.idPromocion ?? undefined,
        pagos: total > 0 ? formData.pagos : [],
        efectivoRecibido: formData.pagos.some((p) => p.medioPago === 'EFECTIVO') ? formData.efectivoRecibido : undefined,
        actaFirmada: formData.actaFirmada,
      })
      setVentaExitosa(res)
      toast.success('Venta registrada con éxito')
      reset({
        fechaVisita: format(new Date(), 'yyyy-MM-dd'),
        ninos: [{ nombreNino: '', edadNino: edadMin }],
        acompanante: { nombre: '', dni: '', telefono: '' },
        idPromocion: null,
        pagos: [{ medioPago: 'EFECTIVO', monto: 0 }],
        efectivoRecibido: 0,
        actaFirmada: false,
      })
      setCliente(null)
      setPaso(1)
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al registrar venta')
    }
  }

  const onSubmit = (formData: VentaMostradorFormValues) => {
    if (!montosCoinciden) {
      toast.error('El monto pagado no coincide con el total')
      return
    }
    if (efectivoInsuficiente) {
      toast.error('El efectivo recibido es menor que el monto cobrado en efectivo')
      return
    }
    if (vuelto > VUELTO_SOSPECHOSO) {
      setConfirmandoVueltoAlto(true)
      return
    }
    ejecutarRegistro(formData)
  }

  const resetVenta = () => {
    setVentaExitosa(null)
    setCliente(null)
    setPaso(1)
    reset()
  }

  const STEPS = [
    { n: 1, label: 'Cliente' },
    { n: 2, label: 'Detalle' },
    { n: 3, label: 'Pago' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      {/* ── PASO 1: selección de cliente (centrado, sin sidebar) ── */}
      {paso === 1 && (
        <div className="flex flex-col items-center gap-8 py-6">
          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                {i > 0 && <div className="h-px w-10 bg-gray-200 dark:bg-gray-700" />}
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    'h-6 w-6 rounded-full text-[10px] font-black flex items-center justify-center',
                    s.n === 1
                      ? 'bg-brand-azul text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  )}>
                    {s.n}
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold',
                    s.n === 1 ? 'text-brand-azul' : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-gray-800 dark:text-gray-100">¿El cliente tiene cuenta?</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                Busca su perfil para cargar sus datos automáticamente,<br />o continúa como visitante.
              </p>
            </div>
            <ClienteBusqueda
              onClienteSelect={(c) => {
                setCliente(c)
                setPaso(2)
              }}
            />
          </div>
        </div>
      )}

      {/* ── PASO 2: formulario completo con sidebar ── */}
      {paso === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* Columna izquierda */}
          <div className="order-last lg:order-first space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-brand-azul/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-brand-azul" />
                </div>
                <h2 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase">Proceso de venta</h2>
              </div>

              <Card className="shadow-none border-gray-100 dark:border-gray-800 dark:bg-gray-900">
                <CardContent className="p-5 space-y-6 divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Badge del cliente seleccionado */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      {cliente ? (
                        <>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">{cliente.nombreCompleto}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{cliente.correo || 'Sin correo'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setCliente(null); setPaso(1) }}
                            className="text-[10px] text-brand-azul hover:underline shrink-0 ml-3"
                          >
                            Cambiar
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Cliente invitado</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPaso(1)}
                            className="text-[10px] text-brand-azul hover:underline"
                          >
                            Cambiar
                          </button>
                        </>
                      )}
                    </div>

                    {cliente && !cliente.correo && (
                      <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 py-3 text-amber-800 dark:text-amber-300">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <div className="grid gap-0.5">
                          <AlertTitle className="text-xs font-bold">Cliente sin correo</AlertTitle>
                          <AlertDescription className="text-[10px] leading-tight">
                            El cliente seleccionado no tiene correo registrado. Puedes ingresar uno en el modal final para enviarle los comprobantes.
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}
                  </div>

                  <div className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Fecha de visita</Label>
                        <div className="relative">
                          <Input
                            type="date"
                            {...register('fechaVisita')}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            max={format(addDays(new Date(), diasMaxFecha), 'yyyy-MM-dd')}
                            className={cn('h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', estaBloqueado && 'border-red-500 dark:border-red-600')}
                          />
                          {isLoadingDisp && (
                            <div className="absolute right-3 top-2.5">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full',
                              esHoy
                                ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                            )}
                          >
                            {esHoy ? 'Visita hoy: ingreso inmediato' : 'Visita anticipada'}
                          </span>
                          {plazasDisponibles != null && !estaBloqueado && (
                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                              {plazasDisponibles} lugar{plazasDisponibles !== 1 ? 'es' : ''} disponible{plazasDisponibles !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {precioDia && !estaBloqueado && (
                        <div className="flex flex-col justify-end pb-1">
                          <span className="text-[10px] font-bold text-brand-azul uppercase">
                            Precio base: {formatCurrency(precioDia.precio)}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-gray-500">
                            {precioDia.tipoDia === 'FIN_SEMANA_FERIADO'
                              ? 'Fin de Semana / Feriado'
                              : precioDia.tipoDia === 'SEMANA'
                                ? 'Día de Semana'
                                : precioDia.tipoDia}
                          </span>
                        </div>
                      )}
                    </div>

                    {precioDia && precioDia.precio === 0 && !estaBloqueado && (
                      <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold">Sin tarifa configurada</AlertTitle>
                        <AlertDescription className="text-[10px] leading-tight">
                          No hay tarifa activa para esta fecha. Configura una tarifa antes de registrar la venta.
                        </AlertDescription>
                      </Alert>
                    )}

                    {estaBloqueado && (
                      <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold">Fecha no disponible</AlertTitle>
                        <AlertDescription className="text-[10px] leading-tight">
                          {fueraDeHorario
                            ? `El local ya se encuentra cerrado para ventas hoy. Hora de cierre: ${confCal?.turnoT2Fin}`
                            : disponibilidad?.motivoBloqueo || 'Esta fecha se encuentra bloqueada para la venta de entradas.'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className={cn('space-y-6 transition-opacity', estaBloqueado && 'opacity-50 pointer-events-none')}>
                    <RegistroNinos control={control} edadMin={edadMin} edadMax={edadMax} />

                    {exceedsAforo && (
                      <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold">Aforo insuficiente</AlertTitle>
                        <AlertDescription className="text-[10px] leading-tight">
                          Solo hay {plazasDisponibles} lugar{plazasDisponibles !== 1 ? 'es' : ''} disponible{plazasDisponibles !== 1 ? 's' : ''} para esta fecha.
                          Reduce el número de niños.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Acompañante</Label>
                      <Controller
                        control={control}
                        name="acompanante.nombre"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Nombre completo del acompañante"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            className={cn('h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', errors.acompanante?.nombre && 'border-red-400 dark:border-red-600')}
                          />
                        )}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Controller
                          control={control}
                          name="acompanante.dni"
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="DNI"
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
                              className={cn('h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', errors.acompanante?.dni && 'border-red-400 dark:border-red-600')}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="acompanante.telefono"
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Celular (9XXXXXXXX)"
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
                              className={cn('h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', errors.acompanante?.telefono && 'border-red-400 dark:border-red-600')}
                            />
                          )}
                        />
                      </div>
                      {(errors.acompanante?.nombre || errors.acompanante?.dni || errors.acompanante?.telefono) && (
                        <p className="text-[10px] text-red-500 dark:text-red-400">
                          {errors.acompanante?.nombre?.message ||
                            errors.acompanante?.dni?.message ||
                            errors.acompanante?.telefono?.message}
                        </p>
                      )}
                    </div>

                    {promociones && promociones.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Promoción</Label>
                        <Controller
                          control={control}
                          name="idPromocion"
                          render={({ field }) => (
                            <Select
                              value={field.value ? String(field.value) : 'ninguna'}
                              onValueChange={(v) => field.onChange(v === 'ninguna' ? null : parseInt(v, 10))}
                            >
                              <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ninguna">Sin promoción</SelectItem>
                                {promociones
                                  .filter((p) => p.activo)
                                  .map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                      {p.nombre}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}

                    <PagoPosForm control={control} total={total} />

                    {sumaPagos > 0 && !montosCoinciden && (
                      <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3">
                        <AlertCircle className="h-4 w-4" />
                        <div className="grid gap-0.5">
                          <AlertTitle className="text-xs font-bold">Descuadre de pagos</AlertTitle>
                          <AlertDescription className="text-[10px] leading-tight">
                            {sumaPagos < total
                              ? `La suma de los pagos (S/ ${sumaPagos.toFixed(2)}) es menor que el total neto (S/ ${total.toFixed(2)}). Falta cobrar S/ ${(total - sumaPagos).toFixed(2)}.`
                              : `La suma de los pagos (S/ ${sumaPagos.toFixed(2)}) es mayor que el total neto (S/ ${total.toFixed(2)}). Sobra S/ ${(sumaPagos - total).toFixed(2)}.`}
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    {efectivoInsuficiente && (
                      <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3">
                        <AlertCircle className="h-4 w-4" />
                        <div className="grid gap-0.5">
                          <AlertTitle className="text-xs font-bold">Efectivo insuficiente</AlertTitle>
                          <AlertDescription className="text-[10px] leading-tight">
                            El efectivo recibido (S/ {efectivoRecibido.toFixed(2)}) es menor que el monto cobrado en efectivo (S/ {efectivoAplicado.toFixed(2)}). Falta recibir S/ {(efectivoAplicado - efectivoRecibido).toFixed(2)}.
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    <div className="pt-4 flex items-start gap-3">
                      <Controller
                        control={control}
                        name="actaFirmada"
                        render={({ field }) => (
                          <Checkbox
                            id="acta"
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(v === true)}
                            className="mt-0.5"
                          />
                        )}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor="acta" className="text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer">
                          Acta de responsabilidad firmada
                        </label>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          El acompañante ha leído y aceptado los términos del local.
                        </p>
                        {errors.actaFirmada && (
                          <p className="text-[10px] text-red-500 dark:text-red-400">{errors.actaFirmada.message}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl font-black uppercase text-xs tracking-wider bg-brand-azul hover:bg-brand-azul/90"
                      disabled={!puedeRegistrar}
                    >
                      {registrar.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Procesando...
                        </>
                      ) : esHoy ? (
                        `Cobrar ${formatCurrency(total)} · Ingresar ${ninos.length} ticket${ninos.length > 1 ? 's' : ''}`
                      ) : (
                        `Cobrar ${formatCurrency(total)} · Reservar ${ninos.length} ticket${ninos.length > 1 ? 's' : ''}`
                      )}
                    </Button>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
          {/* Columna derecha: resumen */}

          <div className="order-first lg:order-last">
            <ResumenVenta
              cliente={cliente}
              fechaVisita={fechaVisita}
              esHoy={esHoy}
              numNinos={ninos.length}
              precioUnit={precioUnit}
              subtotal={subtotal}
              descuento={descuento}
              total={total}
              sumaPagos={sumaPagos}
              vuelto={vuelto}
              ninos={ninos}
              pagos={pagos as PagoLinea[]}
              promocionNombre={promocionActual?.nombre}
              efectivoRecibido={efectivoRecibido}
              efectivoAplicado={efectivoAplicado}
            />
          </div>

        </div>
      )}

      {/* Dialogs: siempre presentes, fuera de los pasos */}
      <AlertDialog open={confirmandoVueltoAlto} onOpenChange={setConfirmandoVueltoAlto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vuelto inusualmente alto</AlertDialogTitle>
            <AlertDialogDescription>
              El vuelto a entregar es de {formatCurrency(vuelto)}. Verifica el efectivo recibido antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Revisar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => {
                setConfirmandoVueltoAlto(false)
                handleSubmit(ejecutarRegistro)()
              }}
            >
              Sí, es correcto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VentaExitosaModal
        open={!!ventaExitosa}
        onClose={resetVenta}
        venta={ventaExitosa}
        defaultCorreo={cliente?.correo ?? ''}
      />
    </form>
  )
}
