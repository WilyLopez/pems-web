'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { parseISO, isToday, isAfter, parse } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { clienteService } from '@/services/cliente.service'

import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { usePublicPrecios } from '../../hooks/usePublicPrecios'
import { usePublicConfig } from '../../hooks/usePublicConfig'
import { useSedesPublicas } from '../../hooks/useSedesPublicas'
import { getReservationSchema } from '../../shared/validations'
import { reservaService } from '@/services/reserva.service'
import { Reserva } from '@/features/admin/reservas/types'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { WizardHeader } from '@/components/wizard/WizardHeader'
import { cn } from '@/lib/utils'
import { useWizardTimer } from '@/hooks/useWizardTimer'

import { StepIndicator, PasoReserva } from './components/StepIndicator'
import { AuthGuard } from './components/AuthGuard'
import { CalendarStep } from './components/CalendarStep'
import { VisitorStep } from './components/VisitorStep'
import { PaymentStep, SubPasoPago } from './components/PaymentStep'
import { SuccessStep } from './components/SuccessStep'
import { ResumenSidebar } from './components/ResumenSidebar'
import { ResumenMobileBar } from './components/ResumenMobileBar'
import { MedioPago } from './components/PanelDetallePago'
import { ReservarWhatsAppButton } from './components/ReservarWhatsAppButton'
import { AyudaReservarSheet } from './components/AyudaReservarSheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const TOTAL_PASOS = 3

interface ReservaFormValues {
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  dniAcompanante: string
  aceptaReglamento: boolean
  conoceActa: boolean
}

export function ReservarView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const {
    clientePerfilId,
    correo,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth()
  const { idSedeUnica, isLoading: sedesLoading } = useSedesPublicas()
  const idSede = idSedeUnica ?? 0

  const { data: perfilCliente } = useQuery({
    queryKey: ['perfil_cliente', clientePerfilId],
    queryFn: () => clienteService.obtener(clientePerfilId!),
    enabled: !!clientePerfilId,
    staleTime: 10 * 60_000,
  })

  const [paso, setPaso] = useState<PasoReserva>(1)
  const [fechaSeleccionada, setFecha] = useState<string | null>(null)
  const [dispSeleccionada, setDispSeleccionada] =
    useState<Disponibilidad | null>(null)

  const { data: config } = useConfiguracionCalendario(idSede)
  const { data: preciosPublicos } = usePublicPrecios(idSede)
  const { data: publicConfig } = usePublicConfig()

  const { minAge, maxAge } = useMemo(() => {
    let min = 0
    let max = 12
    if (publicConfig?.reglasLocal) {
      try {
        const parsed = JSON.parse(publicConfig.reglasLocal)
        if (parsed.edadMinima !== undefined) min = Number(parsed.edadMinima)
        if (parsed.edadMaxima !== undefined) max = Number(parsed.edadMaxima)
      } catch {
      }
    }
    return { minAge: min, maxAge: max }
  }, [publicConfig])

  const dynamicSchema = useMemo(() => {
    return getReservationSchema(minAge, maxAge)
  }, [minAge, maxAge])

  const precioMap: Record<string, number> | undefined = preciosPublicos
    ? Object.fromEntries(
      preciosPublicos.map((p) => [p.tipoDia, Number(p.precio)])
    )
    : undefined

  const getTarifaKey = useCallback(
    (fechaStr: string, esFeriado: boolean): 'SEMANA' | 'FIN_SEMANA_FERIADO' => {
      const date = parseISO(fechaStr)
      const day = date.getDay()
      const isWeekend = day === 0 || day === 6
      return isWeekend || esFeriado ? 'FIN_SEMANA_FERIADO' : 'SEMANA'
    },
    []
  )

  const horaApertura = config?.horaApertura ?? '10:00'
  const horaCierre = config?.horaCierre ?? '20:00'

  const [metodoPago, setMetodoPago] = useState<MedioPago | null>(null)
  const [codigoYape, setCodigoYape] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [reservaCreada, setReservaCreada] = useState<Reserva | null>(null)
  const [subPasoPago, setSubPasoPago] = useState<SubPasoPago>('metodo')
  const [mostrarConfirmarSalir, setMostrarConfirmarSalir] = useState(false)

  const prevPasoRef = useRef<PasoReserva>(1)
  const reservaCreadaRef = useRef<Reserva | null>(null)
  reservaCreadaRef.current = reservaCreada

  const {
    secondsLeft,
    progress: timerProgress,
    phase: timerPhase,
    displayTime: timerDisplay,
    restart: restartTimer,
    pause: pauseTimer,
    resume: resumeTimer,
  } = useWizardTimer({
    durationSeconds: 600,
    sessionKey: 'reservar_session_timer',
    startPaused: false,
    onExpire: () => {
      toast.error(
        'El tiempo límite para realizar la reserva ha expirado. Por favor, inicia el proceso nuevamente.',
        {
          duration: 5000,
        }
      )
      const reserva = reservaCreadaRef.current
      if (reserva && reserva.estado === 'PENDIENTE') {
        reservaService
          .cancelar(reserva.id, 'Expiración de tiempo de reserva de 10 minutos')
          .catch((e) =>
            console.error('Error al cancelar la reserva expirada:', e)
          )
      }
      setPaso(1)
      setFecha(null)
      setDispSeleccionada(null)
      setReservaCreada(null)
      setMetodoPago(null)
      setComprobante(null)
      setCodigoYape('')
      setIntentoEnvio(false)
      setSubPasoPago('metodo')
      restartTimer()
    },
  })

  useEffect(() => {
    const prev = prevPasoRef.current
    prevPasoRef.current = paso

    if (paso === 1 && prev === 4) {
      restartTimer()
    } else if (paso === 4) {
      pauseTimer()
    } else {
      resumeTimer()
    }

    if (paso === 3 && prev === 2) {
      setSubPasoPago('metodo')
    }
  }, [paso, restartTimer, pauseTimer, resumeTimer])

  const timerActivo = paso === 1 || paso === 2 || paso === 3

  useEffect(() => {
    const fecha = searchParams.get('fecha')
    if (fecha) {
      setFecha(fecha)
      setPaso(2)
    }
  }, [searchParams])

  const methods = useForm<ReservaFormValues>({
    resolver: zodResolver(dynamicSchema),
  })

  const {
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
  } = methods

  useEffect(() => {
    const draft = localStorage.getItem('pems_reserva_draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        if (parsed.nombreNino) setValue('nombreNino', parsed.nombreNino)
        if (parsed.edadNino) setValue('edadNino', Number(parsed.edadNino))
        if (parsed.nombreAcompanante)
          setValue('nombreAcompanante', parsed.nombreAcompanante)
        if (parsed.dniAcompanante)
          setValue('dniAcompanante', parsed.dniAcompanante)
      } catch (e) {
        console.error('Error parsing draft from localStorage:', e)
      }
    }
  }, [setValue])

  useEffect(() => {
    const subscription = watch((value) => {
      if (
        value.nombreNino ||
        value.edadNino ||
        value.nombreAcompanante ||
        value.dniAcompanante
      ) {
        localStorage.setItem(
          'pems_reserva_draft',
          JSON.stringify({
            nombreNino: value.nombreNino,
            edadNino: value.edadNino,
            nombreAcompanante: value.nombreAcompanante,
            dniAcompanante: value.dniAcompanante,
          })
        )
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const crear = useMutation({
    mutationFn: (payload: Parameters<typeof reservaService.crear>[2]) =>
      reservaService.crear(clientePerfilId!, idSede, payload),
    onSuccess: async (reserva) => {
      localStorage.removeItem('pems_reserva_draft')
      if (metodoPago === 'YAPE' && comprobante) {
        try {
          await reservaService.subirComprobante(reserva.id, comprobante)
        } catch {
          toast.error('Reserva creada pero no se pudo subir el comprobante.')
        }
      }
      setReservaCreada(reserva)
      setPaso(4)
    },
    onError: (err: { message?: string }) => {
      toast.error(
        err?.message ?? 'No se pudo crear la reserva. Intenta nuevamente.'
      )
    },
  })

  const cancelar = useMutation({
    mutationFn: (id: number) =>
      reservaService.cancelar(id, 'Cancelado por el usuario desde la pantalla de éxito'),
    onSuccess: (updatedReserva) => {
      toast.success('Reserva cancelada exitosamente')
      setReservaCreada(updatedReserva)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo cancelar la reserva.')
    },
  })

  if (authLoading || sedesLoading) return null
  if (!isAuthenticated) return <AuthGuard fecha={fechaSeleccionada} />

  function puedeAvanzarPago() {
    if (!metodoPago) return false
    if (metodoPago === 'YAPE' && !comprobante) return false
    return true
  }

  async function confirmarReserva() {
    setIntentoEnvio(true)
    if (!puedeAvanzarPago()) return

    const valores = getValues()
    crear.mutate({
      canalReserva: 'WEB',
      fechaEvento: fechaSeleccionada!,
      nombreNino: valores.nombreNino,
      edadNino: valores.edadNino,
      nombreAcompanante: valores.nombreAcompanante,
      dniAcompanante: valores.dniAcompanante,
      firmoConsentimiento: true,
    })
  }

  if (paso === 4 && reservaCreada) {
    return (
      <SuccessStep
        reservaCreada={reservaCreada}
        correo={correo ?? ''}
        onCancelar={async () => {
          await cancelar.mutateAsync(reservaCreada.id)
        }}
        isCancelando={cancelar.isPending}
        onNuevaReserva={() => {
          setPaso(1)
          setFecha(null)
          setDispSeleccionada(null)
          setReservaCreada(null)
          setMetodoPago(null)
          setComprobante(null)
          setCodigoYape('')
          setIntentoEnvio(false)
          setSubPasoPago('metodo')
          methods.reset()
        }}
      />
    )
  }

  const handleSalir = () => {
    setMostrarConfirmarSalir(true)
  }

  return (
    <FormProvider {...methods}>
      {timerActivo && (
        <WizardHeader
          titulo="Reservar entrada"
          secondsLeft={secondsLeft}
          timerProgress={timerProgress}
          timerPhase={timerPhase}
          timerDisplay={timerDisplay}
          paso={paso}
          total={TOTAL_PASOS}
          onSalir={handleSalir}
          className="top-16"
        />
      )}
      <div
        className={cn(
          'container max-w-7xl mx-auto px-4 pt-24 pb-12',
          timerActivo &&
          !(paso === 3 && subPasoPago === 'resumen') &&
          'pb-28 lg:pb-12'
        )}
      >
        <StepIndicator paso={paso} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {timerActivo && timerPhase !== 'safe' && (
              <div
                className={cn(
                  'p-4 rounded-2xl flex items-center gap-3 border transition-all duration-300 shadow-sm',
                  timerPhase === 'critical'
                    ? 'bg-red-50 border-red-200 text-red-900 animate-pulse'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                )}
              >
                <AlertTriangle
                  className={cn(
                    'h-5 w-5 shrink-0',
                    timerPhase === 'critical'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  )}
                />
                <p className="text-sm font-semibold">
                  {timerPhase === 'critical'
                    ? `¡Completa tu reserva pronto! Tiempo restante: ${timerDisplay}`
                    : `Tu sesión expira en ${timerDisplay}. Completa los datos antes de que se agote.`}
                </p>
              </div>
            )}

            {paso === 1 && (
              <div className="animate-fade-in">
                <CalendarStep
                  idSede={idSede}
                  fechaSeleccionada={fechaSeleccionada}
                  setFecha={setFecha}
                  dispSeleccionada={dispSeleccionada}
                  setDispSeleccionada={setDispSeleccionada}
                  config={config}
                  precioMap={precioMap}
                  getTarifaKey={getTarifaKey}
                  onAvanzar={() => setPaso(2)}
                />
              </div>
            )}

            {paso === 2 && (
              <div className="animate-fade-in">
                <VisitorStep
                  fechaSeleccionada={fechaSeleccionada}
                  minAge={minAge}
                  maxAge={maxAge}
                  dispSeleccionada={dispSeleccionada}
                  precioMap={precioMap}
                  getTarifaKey={getTarifaKey}
                  onBack={() => setPaso(1)}
                  onSubmit={handleSubmit(() => setPaso(3))}
                  perfilCliente={perfilCliente}
                />
              </div>
            )}

            {paso === 3 && fechaSeleccionada && dispSeleccionada && (
              <div className="animate-fade-in">
                <PaymentStep
                  metodoPago={metodoPago}
                  setMetodoPago={setMetodoPago}
                  comprobante={comprobante}
                  setComprobante={setComprobante}
                  codigoYape={codigoYape}
                  setCodigoYape={setCodigoYape}
                  intentoEnvio={intentoEnvio}
                  setIntentoEnvio={setIntentoEnvio}
                  subPasoPago={subPasoPago}
                  setSubPasoPago={setSubPasoPago}
                  fechaSeleccionada={fechaSeleccionada}
                  dispSeleccionada={dispSeleccionada}
                  horaApertura={horaApertura}
                  horaCierre={horaCierre}
                  precioMap={precioMap}
                  getTarifaKey={getTarifaKey}
                  onBack={() => setPaso(2)}
                  onConfirmar={confirmarReserva}
                  isPending={crear.isPending}
                  control={control}
                />
              </div>
            )}
          </div>

          {paso < 4 && (
            <ResumenSidebar
              fechaSeleccionada={fechaSeleccionada}
              dispSeleccionada={dispSeleccionada}
              horaApertura={horaApertura}
              horaCierre={horaCierre}
              precioMap={precioMap}
              getTarifaKey={getTarifaKey}
              metodoPago={metodoPago}
              control={control}
            />
          )}
        </div>

        {paso > 1 && paso < 4 && fechaSeleccionada && dispSeleccionada && !(paso === 3 && subPasoPago === 'resumen') && (
          <ResumenMobileBar
            fechaSeleccionada={fechaSeleccionada}
            dispSeleccionada={dispSeleccionada}
            precioMap={precioMap}
            getTarifaKey={getTarifaKey}
            control={control}
          />
        )}
      </div>
      {paso < 4 && (
        <>
          <ReservarWhatsAppButton
            fechaSeleccionada={fechaSeleccionada}
            control={control}
          />
          <AyudaReservarSheet />
        </>
      )}
      <ConfirmDialog
        open={mostrarConfirmarSalir}
        onOpenChange={setMostrarConfirmarSalir}
        title="¿Salir del asistente?"
        description="Si sales ahora, se perderán todos los datos ingresados en tu reserva."
        confirmLabel="Sí, salir"
        destructive={true}
        onConfirm={() => {
          setMostrarConfirmarSalir(false)
          router.push('/cliente/mis-reservas')
        }}
      />
    </FormProvider>
  )
}