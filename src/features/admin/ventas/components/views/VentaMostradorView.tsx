'use client'

import React, { useMemo, useState } from 'react'
import { format, addDays, isToday, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Controller, useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Ticket, CheckCircle2, CreditCard, AlertCircle, Printer, Download } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import { useConfiguracionCalendario, useConfiguracionVenta } from '@/hooks/useConfiguracion'
import { usePromociones } from '@/hooks/usePromocion'
import {
  usePrecioDia,
  useRegistrarVentaMostrador,
  useEnviarCorreoVenta,
  useMarcarImpreso,
  useMarcarDescargado,
} from '../../hooks/useVentasData'
import { useDisponibilidad } from '@/features/admin/calendario/hooks/useCalendarData'
import { useClienteDetail } from '@/features/admin/clientes/hooks/useClientesData'
import { VentaMostradorResponse, PagoLinea } from '../../types'
import { Cliente } from '@/types/cliente.types'
import { buildVentaMostradorSchema, VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'
import { calcularResumenVenta, VUELTO_SOSPECHOSO } from '../../utils/ventas.utils'
import { VentaExitosaModal } from '../modals/VentaExitosaModal'
import { ventasApi } from '../../services/ventas.api'
import api from '@/services/api'

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

export const VentaMostradorView = () => {
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

  const { data: precioDia } = usePrecioDia(idSede ?? null, fechaVisita)
  const { data: disponibilidad, isLoading: isLoadingDisp } = useDisponibilidad(idSede ?? 0, fechaVisita)
  const { data: promociones } = usePromociones()
  const registrar = useRegistrarVentaMostrador()

  const [descargandoNota, setDescargandoNota] = useState(false)
  const [correoDestinatario, setCorreoDestinatario] = useState('')
  const [loadingTicketId, setLoadingTicketId] = useState<number | null>(null)
  const [loadingPrintId, setLoadingPrintId] = useState<number | null>(null)

  const enviarCorreo = useEnviarCorreoVenta()
  const marcarImpreso = useMarcarImpreso()
  const marcarDescargado = useMarcarDescargado()

  React.useEffect(() => {
    if (ventaExitosa && cliente?.correo) {
      setCorreoDestinatario(cliente.correo)
    } else if (ventaExitosa) {
      setCorreoDestinatario('')
    }
  }, [ventaExitosa, cliente])

  const handleDescargarNota = async () => {
    if (!ventaExitosa) return
    setDescargandoNota(true)
    try {
      await ventasApi.descargarNotaVenta(ventaExitosa.ventaId)
      marcarDescargado.mutate(ventaExitosa.ventaId)
      toast.success('Nota de venta descargada')
    } catch {
      toast.error('Error al descargar nota de venta')
    } finally {
      setDescargandoNota(false)
    }
  }

  const handleDescargarTicket = async (idReserva: number) => {
    if (!ventaExitosa) return
    setLoadingTicketId(idReserva)
    try {
      await ventasApi.descargarTicket(idReserva)
      marcarDescargado.mutate(ventaExitosa.ventaId)
      toast.success('Ticket descargado')
    } catch {
      toast.error('Error al descargar ticket')
    } finally {
      setLoadingTicketId(null)
    }
  }

  const handleImprimirTicket = async (idReserva: number) => {
    if (!ventaExitosa) return
    setLoadingPrintId(idReserva)
    try {
      const response = await api.get(`/reservas/${idReserva}/ticket`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      iframe.src = url

      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus()
            iframe.contentWindow.print()
          }
          resolve()
        }
        document.body.appendChild(iframe)
      })

      marcarImpreso.mutate(ventaExitosa.ventaId)

      setTimeout(() => {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(url)
      }, 1000)
    } catch {
      toast.error('Error al generar la impresión del ticket')
    } finally {
      setLoadingPrintId(null)
    }
  }

  const handleEnviarCorreo = async () => {
    if (!ventaExitosa) return
    if (!correoDestinatario || !correoDestinatario.includes('@')) {
      toast.error('Ingresa un correo válido')
      return
    }
    try {
      await enviarCorreo.mutateAsync({
        idVenta: ventaExitosa.ventaId,
        correo: correoDestinatario
      })
    } catch {
    }
  }

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
    return !disponibilidad.disponiblePublico || disponibilidad.tipoOcupacion === 'BLOQUEADO' || disponibilidad.bloqueadoManualmente
  }, [disponibilidad, isLoadingDisp, fueraDeHorario])

  const puedeRegistrar = isValid && montosCoinciden && !estaBloqueado && !registrar.isPending && !efectivoInsuficiente

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
        actaFirmada: true,
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



  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div className="order-last lg:order-first space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-brand-azul/10 rounded-lg flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-brand-azul" />
            </div>
            <h2 className="text-sm font-black text-gray-700 uppercase">Proceso de venta</h2>
          </div>

          <Card className="shadow-none border-gray-100">
            <CardContent className="p-5 space-y-6 divide-y">
              <div className="space-y-4">
                <ClienteBusqueda
                  selectedCliente={cliente}
                  onClienteSelect={(c) => {
                    setCliente(c)
                    if (c) setPaso(2)
                  }}
                />

                {cliente && !cliente.correo && (
                  <Alert className="bg-amber-50 border-amber-200 py-3 text-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <div className="grid gap-0.5">
                      <AlertTitle className="text-xs font-bold">Cliente sin correo</AlertTitle>
                      <AlertDescription className="text-[10px] leading-tight">
                        El cliente seleccionado no tiene correo electrónico registrado. Deberás ingresar uno en el modal final para enviarle los comprobantes.
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {!cliente && paso === 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-xs font-bold text-gray-400"
                    onClick={() => setPaso(2)}
                  >
                    O continuar como invitado
                  </Button>
                )}
              </div>

              {paso === 2 && (
                <div className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase">Fecha de visita</Label>
                        <div className="relative">
                          <Input
                            type="date"
                            {...register('fechaVisita')}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            max={format(addDays(new Date(), diasMaxFecha), 'yyyy-MM-dd')}
                            className={cn('h-9 text-sm', estaBloqueado && 'border-red-500')}
                          />
                          {isLoadingDisp && (
                            <div className="absolute right-3 top-2.5">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span
                          className={cn(
                            'inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full',
                            esHoy ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          )}
                        >
                          {esHoy ? 'Visita hoy: ingreso inmediato' : 'Visita anticipada'}
                        </span>
                      </div>
                      {precioDia && !estaBloqueado && (
                        <div className="flex flex-col justify-end pb-1">
                          <span className="text-[10px] font-bold text-primary uppercase">
                            Precio base: {formatCurrency(precioDia.precio)}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {precioDia.tipoDia === 'FIN_SEMANA_FERIADO'
                              ? 'Fin de Semana / Feriado'
                              : precioDia.tipoDia === 'SEMANA'
                                ? 'Día de Semana'
                                : precioDia.tipoDia}
                          </span>
                        </div>
                      )}
                    </div>

                    {estaBloqueado && (
                      <Alert variant="destructive" className="bg-red-50 border-red-200 py-3">
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

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase">Acompañante</Label>
                      <Controller
                        control={control}
                        name="acompanante.nombre"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Nombre completo del acompañante"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            className={cn('h-9 text-sm', errors.acompanante?.nombre && 'border-red-400')}
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
                              className={cn('h-9 text-sm', errors.acompanante?.dni && 'border-red-400')}
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
                              className={cn('h-9 text-sm', errors.acompanante?.telefono && 'border-red-400')}
                            />
                          )}
                        />
                      </div>
                      {(errors.acompanante?.nombre || errors.acompanante?.dni || errors.acompanante?.telefono) && (
                        <p className="text-[10px] text-red-500">
                          {errors.acompanante?.nombre?.message ||
                            errors.acompanante?.dni?.message ||
                            errors.acompanante?.telefono?.message}
                        </p>
                      )}
                    </div>

                    {promociones && promociones.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase">Promoción</Label>
                        <Controller
                          control={control}
                          name="idPromocion"
                          render={({ field }) => (
                            <Select
                              value={field.value ? String(field.value) : 'ninguna'}
                              onValueChange={(v) => field.onChange(v === 'ninguna' ? null : parseInt(v, 10))}
                            >
                              <SelectTrigger className="h-9 text-sm">
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
                      <Alert variant="destructive" className="bg-red-50 border-red-200 py-3">
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
                      <Alert variant="destructive" className="bg-red-50 border-red-200 py-3">
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
                        <label htmlFor="acta" className="text-sm font-bold text-gray-700 cursor-pointer">
                          Acta de responsabilidad firmada
                        </label>
                        <p className="text-[10px] text-gray-400">
                          El acompañante ha leído y aceptado los términos del local.
                        </p>
                        {errors.actaFirmada && (
                          <p className="text-[10px] text-red-500">{errors.actaFirmada.message}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl font-black uppercase text-xs tracking-wider"
                      disabled={!puedeRegistrar}
                    >
                      {registrar.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Procesando...
                        </>
                      ) : esHoy ? (
                        `Cobrar e ingresar ${ninos.length} ticket${ninos.length > 1 ? 's' : ''}`
                      ) : (
                        `Cobrar y reservar ${ninos.length} ticket${ninos.length > 1 ? 's' : ''}`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

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
        descargandoNota={descargandoNota}
        loadingTicketId={loadingTicketId}
        loadingPrintId={loadingPrintId}
        enviarCorreoPending={enviarCorreo.isPending}
        correoDestinatario={correoDestinatario}
        onCorreoDestinatarioChange={setCorreoDestinatario}
        onDescargarNota={handleDescargarNota}
        onDescargarTicket={handleDescargarTicket}
        onImprimirTicket={handleImprimirTicket}
        onEnviarCorreo={handleEnviarCorreo}
      />
    </form>
  )
}
