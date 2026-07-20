'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'

import { useSolicitarEventoWizard } from '../../hooks/useSolicitarEventoWizard'
import { precioServicioEfectivo } from '../../lib/servicio-precio'
import { useSedesPublicas } from '@/features/public/shared/hooks/useSedesPublicas'
import { useWizardTimer } from '../../hooks/useWizardTimer'
import { usePaquetesPublico, useTiposEventoPublico } from '@/hooks/useComercial'
import {
  useExtrasPaquete,
  useTurnos,
  useServiciosCotizacion,
} from '@/hooks/useEventos'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'
import { cn } from '@/lib/utils'
import { PaqueteEvento } from '@/types/comercial.types'

import { WizardHeader } from '../ui/WizardHeader'
import { PaqueteDetalleModal } from '../ui/PaqueteDetalleModal'
import { ResumenEnVivo } from '../ui/ResumenEnVivo'
import { ResumenMovilExpandible } from '../ui/ResumenMovilExpandible'
import { ModalAnticipacionEvento } from '../ui/ModalAnticipacionEvento'
import { WizardWhatsAppButton } from '../ui/WizardWhatsAppButton'
import { LoginGuard } from '../ui/LoginGuard'
import { TimerExpiredBanner } from '../ui/TimerExpiredBanner'
import { SuccessWizardView } from './SuccessWizardView'
import { PasoTipoEvento } from '../steps/PasoTipoEvento'
import { PasoPaquete } from '../steps/PasoPaquete'
import { PasoCotizacion } from '../steps/PasoCotizacion'
import { PasoFechaDetalles } from '../steps/PasoFechaDetalles'
import { PasoResumenFinal } from '../steps/PasoResumenFinal'

const WIZARD_DURATION = 600

export function SolicitarEventoWizardView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { idUsuario, clientePerfilId, isAuthenticated } = useAuth()
  const { idSedeUnica, isLoading: sedesLoading } = useSedesPublicas()
  const idSede = idSedeUnica ?? 0

  const { data: configPublica } = useConfiguracionCalendarioPublica(idSede)
  const edadMin = configPublica?.edadMinCumple ?? 0
  const edadMax = configPublica?.edadMaxCumple ?? 17
  const anticipacionMin = configPublica?.diasMinEventoPrivado ?? 15
  const rangoDias = configPublica?.diasMaxEventoPrivado ?? 90

  const fechaMin = useMemo(
    () => format(addDays(new Date(), anticipacionMin), 'yyyy-MM-dd'),
    [anticipacionMin]
  )
  const fechaMax = useMemo(
    () => format(addDays(new Date(), rangoDias), 'yyyy-MM-dd'),
    [rangoDias]
  )

  const wizard = useSolicitarEventoWizard(
    clientePerfilId ?? idUsuario,
    idSede,
    isAuthenticated,
    edadMin,
    edadMax
  )
  const {
    paso,
    setPaso,
    modalAnticipacion,
    setModalAnticipacion,
    tipoEvento,
    setTipoEvento,
    camino,
    setCamino,
    idPaquete,
    setIdPaquete,
    paqueteDetalle,
    setPaqueteDetalle,
    extrasSeleccionados,
    toggleExtra,
    otrasIdeas,
    setOtrasIdeas,
    descripcion,
    setDescripcion,
    serviciosCotizacion,
    toggleServicio,
    variantesSeleccionadas,
    setVarianteServicio,
    presupuestoCliente,
    setPresupuestoCliente,
    fechaSel,
    setFecha,
    idTurno,
    setIdTurno,
    nombreNino,
    setNombreNino,
    edadCumple,
    setEdadCumple,
    invitados,
    setInvitados,
    telefonoAdicional,
    setTelefonoAdicional,
    eventoCreado,
    solicitar,
    isSubmitting,
    canAdvance1,
    canAdvance2,
    canAdvance3,
    validationErrors,
    resetWizard,
  } = wizard

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('paso', String(paso))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [paso])

  const [timerExpired, setTimerExpired] = useState(false)
  const [aceptaLegal, setAceptaLegal] = useState(false)
  const prevPasoRef = useRef<1 | 2 | 3 | 4>(1)

  const {
    secondsLeft,
    progress: timerProgress,
    phase: timerPhase,
    displayTime: timerDisplay,
    restart: restartTimer,
    pause: pauseTimer,
    resume: resumeTimer,
  } = useWizardTimer({
    durationSeconds: WIZARD_DURATION,
    sessionKey: 'evento_wizard_timer',
    startPaused: true,
    onExpire: () => setTimerExpired(true),
  })

  useEffect(() => {
    const prev = prevPasoRef.current
    prevPasoRef.current = paso

    if (paso === 2 && prev === 1) {
      restartTimer()
    } else if (paso === 1) {
      pauseTimer()
    } else {
      resumeTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso])

  useEffect(() => {
    if (paqueteDetalle) pauseTimer()
    else if (paso > 1) resumeTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paqueteDetalle])

  useEffect(() => {
    if (secondsLeft === 180) {
      toast.warning('Te quedan 3 minutos para completar tu solicitud', {
        duration: 8000,
      })
    }
    if (secondsLeft === 60) {
      toast.error('Solo queda 1 minuto. Completa tu solicitud pronto.', {
        duration: 15000,
      })
    }
  }, [secondsLeft])

  const { data: paquetesAll = [], isLoading: isLoadingPaquetes } =
    usePaquetesPublico()
  const { data: tiposEvento = [], isLoading: isLoadingTipos } =
    useTiposEventoPublico()
  const { data: extras = [] } = useExtrasPaquete(idPaquete)
  const {
    data: turnos = [],
    isError: isTurnosError,
    isLoading: isTurnosLoading,
  } = useTurnos(idSede)
  const { data: servicios = [] } = useServiciosCotizacion()
  const { data: disponibilidades, isLoading: isDisponibilidadDiaLoading } =
    useDisponibilidadRango(idSede, fechaMin, fechaMax)

  const tipoEventoSeleccionado = useMemo(
    () => tiposEvento.find((t) => t.codigo === tipoEvento) ?? null,
    [tiposEvento, tipoEvento]
  )
  const tipoEventoLabel = tipoEventoSeleccionado
    ? tipoEventoSeleccionado.nombre
    : null

  const paquetesFiltrados = useMemo(() => {
    if (!tipoEvento) return paquetesAll
    return paquetesAll.filter(
      (p) => !p.tipoEventoCodigo || p.tipoEventoCodigo === tipoEvento
    )
  }, [paquetesAll, tipoEvento])

  const disponibilidadDia = useMemo(
    () => disponibilidades?.find((d) => d.fecha === fechaSel),
    [disponibilidades, fechaSel]
  )

  const fechasOcupadas = useMemo(() => {
    if (!disponibilidades) return new Set<string>()
    return new Set(
      disponibilidades.filter((d) => !d.disponiblePrivado).map((d) => d.fecha)
    )
  }, [disponibilidades])

  const paqueteSeleccionado =
    paquetesAll.find((p) => p.id === idPaquete) ?? null
  const turnoSeleccionado = turnos.find((t) => t.id === idTurno) ?? null

  const presupuestoEstimado = useMemo(
    () =>
      servicios
        .filter((s) => serviciosCotizacion.includes(s.id))
        .reduce(
          (sum, s) =>
            sum + precioServicioEfectivo(s, variantesSeleccionadas[s.id]),
          0
        ),
    [serviciosCotizacion, servicios, variantesSeleccionadas]
  )

  const serviciosConVariantePendiente = useMemo(
    () =>
      servicios.filter(
        (s) =>
          serviciosCotizacion.includes(s.id) &&
          s.tieneVariantes &&
          !variantesSeleccionadas[s.id]
      ),
    [servicios, serviciosCotizacion, variantesSeleccionadas]
  )

  useEffect(() => {
    if (
      tipoEvento &&
      !isLoadingPaquetes &&
      paquetesFiltrados.length === 0 &&
      camino !== 'cotizacion'
    ) {
      setCamino('cotizacion')
      setIdPaquete(null)
    }
  }, [tipoEvento, paquetesFiltrados.length, isLoadingPaquetes])

  const limitePersonas = paqueteSeleccionado?.limitepersonas ?? null
  const invitadosExcedeLimite = Boolean(
    limitePersonas && invitados && invitados > limitePersonas
  )

  function intentarSeleccionarFecha(valor: string) {
    if (!valor) {
      setFecha(null)
      setIdTurno(null)
      return
    }
    const dias = Math.floor(
      (new Date(valor).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
    )
    if (dias < anticipacionMin) {
      setModalAnticipacion(true)
      return
    }
    setFecha(valor)
    setIdTurno(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <LoginGuard />
      </div>
    )
  }

  if (sedesLoading) return null

  if (timerExpired && !eventoCreado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <TimerExpiredBanner
          onRestart={() => {
            resetWizard()
            setTimerExpired(false)
            restartTimer()
          }}
        />
      </div>
    )
  }

  if (eventoCreado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <SuccessWizardView evento={eventoCreado} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <WizardHeader
        titulo="Solicitar evento"
        paso={paso}
        total={4}
        onSalir={() => router.push('/celebraciones')}
        secondsLeft={secondsLeft}
        timerProgress={timerProgress}
        timerPhase={timerPhase}
        timerDisplay={timerDisplay}
      />

      {timerPhase === 'critical' && (
        <div className="bg-red-600 text-white text-xs text-center py-1.5 px-4 font-semibold animate-pulse">
          Tu sesión expira en {timerDisplay} — completa la solicitud pronto
        </div>
      )}

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={cn(
              'space-y-6',
              paso === 4 ? 'lg:col-span-3' : 'lg:col-span-2'
            )}
          >
            {paso === 1 && (
              <PasoTipoEvento
                isLoadingTipos={isLoadingTipos}
                tiposEvento={tiposEvento}
                tipoEvento={tipoEvento}
                onSeleccionarTipo={(codigo) => {
                  setTipoEvento(codigo)
                  setCamino(null)
                  setIdPaquete(null)
                }}
                isLoadingPaquetes={isLoadingPaquetes}
                paquetesFiltrados={paquetesFiltrados}
                idPaquete={idPaquete}
                camino={camino}
                onSeleccionarPaquete={(paquete: PaqueteEvento) => {
                  setCamino('paquete')
                  setIdPaquete(paquete.id)
                }}
                onVerDetallePaquete={setPaqueteDetalle}
                onSeleccionarCotizacion={() => {
                  setCamino('cotizacion')
                  setIdPaquete(null)
                }}
                canAdvance1={canAdvance1}
                onContinuar={() => setPaso(2)}
              />
            )}

            {paso === 2 && camino === 'paquete' && (
              <PasoPaquete
                paqueteSeleccionado={paqueteSeleccionado}
                onCambiarPaquete={() => setPaso(1)}
                extras={extras}
                extrasSeleccionados={extrasSeleccionados}
                toggleExtra={toggleExtra}
                otrasIdeas={otrasIdeas}
                setOtrasIdeas={setOtrasIdeas}
                presupuestoCliente={presupuestoCliente}
                setPresupuestoCliente={setPresupuestoCliente}
                validationErrors={validationErrors}
                canAdvance2={canAdvance2}
                onAtras={() => setPaso(1)}
                onContinuar={() => setPaso(3)}
              />
            )}

            {paso === 2 && camino === 'cotizacion' && (
              <PasoCotizacion
                descripcion={descripcion}
                setDescripcion={setDescripcion}
                servicios={servicios}
                serviciosCotizacion={serviciosCotizacion}
                variantesSeleccionadas={variantesSeleccionadas}
                toggleServicio={toggleServicio}
                setVarianteServicio={setVarianteServicio}
                presupuestoEstimado={presupuestoEstimado}
                presupuestoCliente={presupuestoCliente}
                setPresupuestoCliente={setPresupuestoCliente}
                validationErrors={validationErrors}
                canAdvance2={canAdvance2}
                serviciosConVariantePendiente={serviciosConVariantePendiente}
                onAtras={() => setPaso(1)}
                onContinuar={() => setPaso(3)}
              />
            )}

            {paso === 3 && (
              <PasoFechaDetalles
                anticipacionMin={anticipacionMin}
                fechaMin={fechaMin}
                fechaMax={fechaMax}
                fechaSel={fechaSel}
                onSeleccionarFecha={intentarSeleccionarFecha}
                fechasOcupadas={fechasOcupadas}
                isTurnosError={isTurnosError}
                isTurnosLoading={isTurnosLoading}
                isDisponibilidadDiaLoading={isDisponibilidadDiaLoading}
                turnos={turnos}
                disponibilidadDia={disponibilidadDia}
                idTurno={idTurno}
                setIdTurno={setIdTurno}
                tipoEvento={tipoEvento}
                nombreNino={nombreNino}
                setNombreNino={setNombreNino}
                edadCumple={edadCumple}
                setEdadCumple={setEdadCumple}
                edadMin={edadMin}
                edadMax={edadMax}
                invitados={invitados}
                setInvitados={setInvitados}
                invitadosExcedeLimite={invitadosExcedeLimite}
                limitePersonas={limitePersonas}
                camino={camino}
                telefonoAdicional={telefonoAdicional}
                setTelefonoAdicional={setTelefonoAdicional}
                validationErrors={validationErrors}
                canAdvance3={canAdvance3}
                onAtras={() => setPaso(2)}
                onContinuar={() => setPaso(4)}
              />
            )}

            {paso === 4 && (
              <PasoResumenFinal
                tipoEvento={tipoEvento}
                tipoEventoLabel={tipoEventoLabel}
                camino={camino}
                paqueteSeleccionado={paqueteSeleccionado}
                extras={extras}
                extrasSeleccionados={extrasSeleccionados}
                servicios={servicios}
                serviciosCotizacion={serviciosCotizacion}
                variantesSeleccionadas={variantesSeleccionadas}
                presupuestoEstimado={presupuestoEstimado}
                fechaSel={fechaSel}
                turnoSeleccionado={turnoSeleccionado}
                nombreNino={nombreNino}
                edadCumple={edadCumple}
                invitados={invitados}
                presupuestoCliente={presupuestoCliente}
                timerPhase={timerPhase}
                timerDisplay={timerDisplay}
                aceptaLegal={aceptaLegal}
                setAceptaLegal={setAceptaLegal}
                isSubmitting={isSubmitting}
                onAtras={() => setPaso(3)}
                onSolicitar={() => solicitar()}
              />
            )}
          </div>

          <div className={cn('hidden', paso !== 4 && 'lg:block')}>
            <ResumenEnVivo
              tipoEvento={tipoEvento}
              tipoEventoLabel={tipoEventoLabel}
              camino={camino}
              paquete={paqueteSeleccionado}
              extras={extras}
              extrasSeleccionados={extrasSeleccionados}
              serviciosCotizacion={serviciosCotizacion}
              variantesSeleccionadas={variantesSeleccionadas}
              servicios={servicios}
              presupuestoEstimado={presupuestoEstimado}
              presupuestoCliente={presupuestoCliente}
              fecha={fechaSel}
              turno={turnoSeleccionado}
              nombreNino={nombreNino}
              edadCumple={edadCumple}
              invitados={invitados}
            />
          </div>
        </div>
      </div>

      {paso !== 4 && (
        <ResumenMovilExpandible
          tipoEvento={tipoEvento}
          tipoEventoLabel={tipoEventoLabel}
          camino={camino}
          paquete={paqueteSeleccionado}
          extras={extras}
          extrasSeleccionados={extrasSeleccionados}
          serviciosCotizacion={serviciosCotizacion}
          variantesSeleccionadas={variantesSeleccionadas}
          servicios={servicios}
          presupuestoEstimado={presupuestoEstimado}
          presupuestoCliente={presupuestoCliente}
          fecha={fechaSel}
          turno={turnoSeleccionado}
        />
      )}

      <PaqueteDetalleModal
        paquete={paqueteDetalle}
        open={!!paqueteDetalle}
        onClose={() => setPaqueteDetalle(null)}
        onElegir={(id) => {
          setCamino('paquete')
          setIdPaquete(id)
        }}
      />

      <ModalAnticipacionEvento
        open={modalAnticipacion}
        onClose={() => setModalAnticipacion(false)}
        diasMinimos={anticipacionMin}
      />

      <WizardWhatsAppButton
        tipoEventoLabel={tipoEventoLabel}
        camino={camino}
        paquete={paqueteSeleccionado}
        fecha={fechaSel}
        turno={turnoSeleccionado}
        invitados={invitados}
        presupuestoCliente={presupuestoCliente}
      />
    </div>
  )
}
