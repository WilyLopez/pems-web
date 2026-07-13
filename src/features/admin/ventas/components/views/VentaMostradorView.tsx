'use client'

import React, { useState, useEffect } from 'react'
import { FormProvider, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useVentaMostradorForm } from '../../hooks/useVentaMostradorForm'
import { ClienteBadge } from '../forms/ClienteBadge'
import { AcompananteSection } from '../forms/AcompananteSection'
import { FechaVisitaSection } from '../forms/FechaVisitaSection'
import { PromocionSelect } from '../forms/PromocionSelect'
import { ClienteBusqueda } from '../forms/ClienteBusqueda'
import { RegistroNinos } from '../forms/RegistroNinos'
import { PagoPosForm } from '../forms/PagoPosForm'
import { ResumenVenta } from '../forms/ResumenVenta'
import { VentaExitosaModal } from '../modals/VentaExitosaModal'

import { Card, CardContent } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useMiSesionCaja, CajaRequeridaAlert } from '@/features/admin/finanzas'
import { formatCurrency, cn } from '@/lib/utils'
import { PagoLinea, VentaMostradorResponse } from '../../types'
import { VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'
import { VUELTO_SOSPECHOSO } from '../../utils/ventas.utils'

interface VentaMostradorViewProps {
  onClose?: () => void
  desdeCaja?: boolean
}

export const VentaMostradorView = ({
  onClose,
  desdeCaja,
}: VentaMostradorViewProps) => {
  const router = useRouter()
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [confirmandoVueltoAlto, setConfirmandoVueltoAlto] = useState(false)
  const [ventaExitosa, setVentaExitosa] =
    useState<VentaMostradorResponse | null>(null)

  const formProps = useVentaMostradorForm()
  const { data: miSesionCaja, isLoading: cargandoSesionCaja } =
    useMiSesionCaja()

  const {
    methods,
    cliente,
    setCliente,
    ventaAnonima,
    setVentaAnonima,
    consultandoDni,
    consultarAcompananteDni,
    fechaVisita,
    ninos,
    idPromocion,
    pagos,
    efectivoRecibido,
    acompananteDni,
    precioDia,
    isLoadingDisp,
    plazasDisponibles,
    exceedsAforo,
    estaBloqueado,
    fueraDeHorario,
    hayEventoPrivado,
    esHoy,
    total,
    subtotal,
    descuento,
    vuelto,
    sumaPagos,
    efectivoAplicado,
    montosCoinciden,
    puedeRegistrar,
    promociones,
    promocionActual,
    precioUnit,
    registrar,
    cleanLocalStorage,
    diasMaxFecha,
    errors,
    idSede,
    edadMin,
    edadMax,
    disponibilidad,
    confCal,
    statusBusqueda,
    borradorRecuperado,
    setBorradorRecuperado,
  } = formProps

  useEffect(() => {
    if (borradorRecuperado) {
      toast.success('Borrador recuperado automáticamente')
      setBorradorRecuperado(false)
    }
  }, [borradorRecuperado, setBorradorRecuperado])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        const input = document.getElementById('documento-input')
        if (input) (input as HTMLInputElement).focus()
      } else if (e.key === 'F4') {
        e.preventDefault()
        const input = document.querySelector('input[name="pagos.0.monto"]')
        if (input) (input as HTMLInputElement).focus()
      } else if (e.key === 'F8') {
        e.preventDefault()
        if (puedeRegistrar) {
          methods.handleSubmit(onSubmit)()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        if (onClose) onClose()
        else resetVenta()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [puedeRegistrar, methods, onClose])

  const ejecutarRegistro = async (formData: VentaMostradorFormValues) => {
    if (!idSede) return

    try {
      const res = await registrar.mutateAsync({
        tipoVenta: 'RESERVA',
        sedeId: idSede,
        clienteId: cliente?.id,
        fechaVisita: formData.fechaVisita,
        nombreAcompanante: formData.acompanante.nombre,
        tipoDocumentoAcompanante: formData.acompanante.tipoDocumento,
        dniAcompanante: formData.acompanante.dni,
        telefonoAcompanante: formData.acompanante.telefono,
        ninos: formData.ninos,
        idPromocion: formData.idPromocion ?? undefined,
        pagos: total > 0 ? formData.pagos.filter((p) => p.monto > 0) : [],
        efectivoRecibido: formData.pagos.some((p) => p.medioPago === 'EFECTIVO')
          ? formData.efectivoRecibido
          : undefined,
        actaFirmada: formData.actaFirmada,
      })

      setVentaExitosa(res)
      toast.success('Venta registrada con éxito')
      cleanLocalStorage()
      methods.reset({
        fechaVisita: format(new Date(), 'yyyy-MM-dd'),
        ninos: [{ nombreNino: '', edadNino: edadMin }],
        acompanante: {
          tipoDocumento: 'DNI',
          nombre: '',
          dni: '',
          telefono: '',
        },
        idPromocion: null,
        pagos: [{ medioPago: 'EFECTIVO', monto: 0 }],
        efectivoRecibido: 0,
        actaFirmada: false,
      })
      setCliente(null)
      setVentaAnonima(false)
    } catch {}
  }

  const onSubmit = (formData: VentaMostradorFormValues) => {
    if (vuelto > VUELTO_SOSPECHOSO) {
      setConfirmandoVueltoAlto(true)
      return
    }
    ejecutarRegistro(formData)
  }

  const resetVenta = () => {
    setVentaExitosa(null)
    setCliente(null)
    setVentaAnonima(false)
    cleanLocalStorage()
    methods.reset()
  }

  if (!cargandoSesionCaja && !miSesionCaja) {
    return (
      <CajaRequeridaAlert
        mensaje="Para registrar ventas necesitas tener tu caja abierta."
        className="max-w-xl"
      />
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-4 p-1">
          <div className="order-last lg:order-first space-y-3.5">
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 bg-brand-azul/10 rounded flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-brand-azul" />
                  </div>
                  <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Caja POS
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                  <span>[F2] Buscar</span>
                  <span>·</span>
                  <span>[F4] Pago</span>
                  <span>·</span>
                  <span>[F8] Confirmar</span>
                </div>
              </div>

              <Card className="shadow-none border-gray-100 dark:border-gray-850 dark:bg-gray-900">
                <CardContent className="p-4 space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                  <ClienteBadge
                    cliente={cliente}
                    setCliente={setCliente}
                    setShowClienteModal={setShowClienteModal}
                  />

                  <div className="pt-4 space-y-4">
                    <FechaVisitaSection
                      register={methods.register}
                      fechaVisita={fechaVisita}
                      diasMaxFecha={diasMaxFecha}
                      isLoadingDisp={isLoadingDisp}
                      plazasDisponibles={plazasDisponibles}
                      estaBloqueado={estaBloqueado}
                      esHoy={esHoy}
                      precioDia={precioDia}
                      fueraDeHorario={fueraDeHorario}
                      hayEventoPrivado={hayEventoPrivado}
                      confCal={confCal}
                      disponibilidad={disponibilidad}
                    />

                    <div
                      className={cn(
                        'space-y-4 transition-opacity',
                        estaBloqueado && 'opacity-50 pointer-events-none'
                      )}
                    >
                      <RegistroNinos edadMin={edadMin} edadMax={edadMax} />

                      {exceedsAforo && (
                        <Alert
                          variant="destructive"
                          className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 py-3"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-xs font-bold">
                            Aforo excedido
                          </AlertTitle>
                          <AlertDescription className="text-[10px] leading-tight">
                            Registraste {ninos.length} entradas, pero solo hay{' '}
                            {plazasDisponibles} lugar
                            {plazasDisponibles !== 1 ? 'es' : ''} disponible
                            {plazasDisponibles !== 1 ? 's' : ''} para esta
                            fecha.
                          </AlertDescription>
                        </Alert>
                      )}

                      <AcompananteSection
                        errors={errors}
                        consultandoDni={consultandoDni}
                        acompananteDni={acompananteDni}
                        consultarAcompananteDni={consultarAcompananteDni}
                        statusBusqueda={statusBusqueda}
                        cliente={cliente}
                      />

                      <PromocionSelect
                        control={methods.control}
                        promociones={promociones}
                      />

                      <PagoPosForm total={total} vuelto={vuelto} />

                      <div className="pt-3 flex items-start gap-2.5">
                        <Controller
                          control={methods.control}
                          name="actaFirmada"
                          render={({ field }) => (
                            <Checkbox
                              id="acta"
                              checked={field.value}
                              onCheckedChange={(v) =>
                                field.onChange(v === true)
                              }
                              className="mt-0.5"
                            />
                          )}
                        />
                        <div className="grid gap-1 leading-none">
                          <label
                            htmlFor="acta"
                            className="text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer"
                          >
                            Acta de responsabilidad firmada
                          </label>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500">
                            El acompañante acepta las normas y términos del
                            local.
                          </p>
                          {errors.actaFirmada && (
                            <p className="text-[9px] text-red-500 dark:text-red-400 font-bold">
                              {errors.actaFirmada.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-[100px_1fr] gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetVenta}
                          className="h-10 rounded-xl font-black uppercase text-xs tracking-wider border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                        >
                          Limpiar
                        </Button>
                        <Button
                          type="submit"
                          className="h-10 rounded-xl font-black uppercase text-xs tracking-wider bg-brand-azul hover:bg-brand-azul/90 w-full"
                          disabled={!puedeRegistrar}
                        >
                          {registrar.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />{' '}
                              Procesando...
                            </>
                          ) : exceedsAforo ? (
                            'Excede el aforo disponible'
                          ) : !cliente && !ventaAnonima ? (
                            'Selecciona o registra un cliente'
                          ) : montosCoinciden ? (
                            `Confirmar venta · ${formatCurrency(total)}`
                          ) : (
                            `Completar pago (Falta S/ ${(total - sumaPagos).toFixed(2)})`
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="order-first lg:order-last">
            <ResumenVenta
              cliente={cliente}
              ventaAnonima={ventaAnonima}
              fechaVisita={fechaVisita}
              esHoy={esHoy}
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
              pagoCompleto={montosCoinciden}
            />
          </div>
        </div>

        <AlertDialog
          open={confirmandoVueltoAlto}
          onOpenChange={setConfirmandoVueltoAlto}
        >
          <AlertDialogContent aria-describedby="confirmar-vuelto-description">
            <AlertDialogHeader>
              <AlertDialogTitle>Vuelto inusualmente alto</AlertDialogTitle>
              <AlertDialogDescription id="confirmar-vuelto-description">
                El vuelto a entregar es de {formatCurrency(vuelto)}. Verifica el
                efectivo recibido antes de continuar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Revisar</AlertDialogCancel>
              <AlertDialogAction
                type="button"
                onClick={() => {
                  setConfirmandoVueltoAlto(false)
                  methods.handleSubmit(ejecutarRegistro)()
                }}
              >
                Sí, es correcto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showClienteModal} onOpenChange={setShowClienteModal}>
          <DialogContent
            aria-describedby="buscar-cliente-description"
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>Buscar cliente</DialogTitle>
              <DialogDescription id="buscar-cliente-description">
                Busca un cliente registrado o crea uno nuevo. Toda venta debe
                asociarse a un cliente, salvo que elijas continuar sin cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ClienteBusqueda
                onClienteSelect={(c) => {
                  setCliente(c)
                  setShowClienteModal(false)
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setCliente(null)
                  setVentaAnonima(true)
                  setShowClienteModal(false)
                }}
                className="w-full text-center text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 py-2"
              >
                Continuar sin cliente (venta anónima)
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <VentaExitosaModal
          open={!!ventaExitosa}
          onClose={resetVenta}
          venta={ventaExitosa}
          defaultCorreo={cliente?.correo ?? ''}
          desdeCaja={desdeCaja}
          onVolverCaja={() => router.push('/admin/finanzas/caja')}
        />
      </form>
    </FormProvider>
  )
}
