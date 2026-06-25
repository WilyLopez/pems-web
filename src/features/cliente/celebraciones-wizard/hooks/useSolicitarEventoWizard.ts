'use client'

import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { eventoService } from '@/services/evento.service'
import { toast } from 'sonner'
import { TipoEvento, Camino, EventoPrivado } from '../../shared/types'
import { NOMBRE_REGEX, TELEFONO_CELULAR_REGEX } from '@/lib/validations/campos'

export interface WizardValidationErrors {
  descripcion?: string
  invitados?: string
  nombreNino?: string
  edadCumple?: string
  telefonoAdicional?: string
  presupuestoCliente?: string
  otrasIdeas?: string
}

export function useSolicitarEventoWizard(
  idUsuario: number | null,
  idSede: number,
  isAuthenticated: boolean,
  edadMin = 0,
  edadMax = 17,
) {
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1)
  const [modalAnticipacion, setModalAnticipacion] = useState(false)
  const [tipoEvento, setTipoEvento] = useState<TipoEvento | null>(null)
  const [camino, setCamino] = useState<Camino>(null)
  const [idPaquete, setIdPaquete] = useState<number | null>(null)
  const [paqueteDetalle, setPaqueteDetalle] = useState<any | null>(null)
  const [extrasSeleccionados, setExtras] = useState<number[]>([])
  const [otrasIdeas, setOtrasIdeas] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [serviciosCotizacion, setServiciosCotizacion] = useState<number[]>([])
  const [presupuestoCliente, setPresupuestoCliente] = useState<number | null>(null)
  const [fechaSel, setFecha] = useState<string | null>(null)
  const [idTurno, setIdTurno] = useState<number | null>(null)
  const [nombreNino, setNombreNino] = useState('')
  const [edadCumple, setEdadCumple] = useState<number | null>(null)
  const [invitados, setInvitados] = useState<number | null>(null)
  const [telefonoAdicional, setTelefonoAdicional] = useState('')
  const [eventoCreado, setEventoCreado] = useState<EventoPrivado | null>(null)

  // ─── Toggles ─────────────────────────────────────────────────────────────

  const toggleExtra = (id: number) => {
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleServicio = (id: number) => {
    setServiciosCotizacion((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // ─── Validation ──────────────────────────────────────────────────────────

  const validationErrors = useMemo<WizardValidationErrors>(() => {
    const errors: WizardValidationErrors = {}

    if (camino === 'cotizacion') {
      if (descripcion.length > 0 && descripcion.length < 30) {
        errors.descripcion = `Faltan ${30 - descripcion.length} caracteres (mínimo 30)`
      } else if (descripcion.length > 1000) {
        errors.descripcion = `Máximo 1000 caracteres (${descripcion.length}/1000)`
      }
    }

    if (camino === 'paquete') {
      if (otrasIdeas.length > 500) {
        errors.otrasIdeas = `Máximo 500 caracteres (${otrasIdeas.length}/500)`
      }
    }

    if (invitados !== null) {
      if (invitados < 1) errors.invitados = 'Mínimo 1 invitado'
      if (invitados > 500) errors.invitados = 'Máximo 500 personas'
    }

    if (nombreNino) {
      if (nombreNino.length < 2) errors.nombreNino = 'Mínimo 2 caracteres'
      else if (nombreNino.length > 60) errors.nombreNino = 'Máximo 60 caracteres'
      else if (!NOMBRE_REGEX.test(nombreNino)) errors.nombreNino = 'Solo se permiten letras y espacios'
    }

    if (edadCumple !== null) {
      if (edadCumple < edadMin || edadCumple > edadMax)
        errors.edadCumple = `La edad debe estar entre ${edadMin} y ${edadMax} años`
    }

    if (telefonoAdicional && !TELEFONO_CELULAR_REGEX.test(telefonoAdicional)) {
      errors.telefonoAdicional = 'Debe ser un celular de 9 dígitos que comience con 9'
    }

    if (presupuestoCliente !== null) {
      if (presupuestoCliente <= 0) errors.presupuestoCliente = 'El monto debe ser mayor a 0'
      if (presupuestoCliente > 50000) errors.presupuestoCliente = 'El monto parece demasiado alto. Verifica el valor'
    }

    return errors
  }, [camino, descripcion, otrasIdeas, invitados, nombreNino, edadCumple, telefonoAdicional, presupuestoCliente])

  // ─── canAdvance guards ───────────────────────────────────────────────────

  const canAdvance1 = tipoEvento !== null && camino !== null

  const canAdvance2 = useMemo(() => {
    if (camino === 'paquete') return Object.keys(validationErrors).length === 0
    if (camino === 'cotizacion') {
      return (
        descripcion.length >= 30 &&
        descripcion.length <= 1000 &&
        invitados !== null &&
        invitados > 0 &&
        invitados <= 500 &&
        Object.keys(validationErrors).length === 0
      )
    }
    return false
  }, [camino, descripcion, invitados, validationErrors])

  const canAdvance3 = useMemo(() => {
    const basico = fechaSel !== null && idTurno !== null
    if (!basico) return false
    // Invitados required for both paths
    if (!invitados || invitados <= 0 || invitados > 500) return false
    // Nombre del niño required for cumpleaños
    if (tipoEvento === 'CUMPLEANOS' && (!nombreNino || nombreNino.trim().length < 2)) return false
    if (nombreNino && !NOMBRE_REGEX.test(nombreNino)) return false
    if (telefonoAdicional && !TELEFONO_CELULAR_REGEX.test(telefonoAdicional)) return false
    if (edadCumple !== null && (edadCumple < edadMin || edadCumple > edadMax)) return false
    return true
  }, [fechaSel, idTurno, invitados, tipoEvento, nombreNino, telefonoAdicional, edadCumple])

  // ─── Reset ───────────────────────────────────────────────────────────────

  const resetWizard = () => {
    setPaso(1)
    setTipoEvento(null)
    setCamino(null)
    setIdPaquete(null)
    setExtras([])
    setOtrasIdeas('')
    setDescripcion('')
    setServiciosCotizacion([])
    setPresupuestoCliente(null)
    setFecha(null)
    setIdTurno(null)
    setNombreNino('')
    setEdadCumple(null)
    setInvitados(null)
    setTelefonoAdicional('')
    setEventoCreado(null)
    // Clear timer in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wizard_start_time')
    }
  }

  // ─── Submit mutation ─────────────────────────────────────────────────────

  const solicitarMutation = useMutation({
    mutationFn: () => {
      if (!isAuthenticated || !idTurno || !fechaSel || !tipoEvento) {
        throw new Error('Datos de solicitud incompletos.')
      }
      return eventoService.solicitar(idUsuario!, idSede, {
        idTurno,
        fechaEvento:              fechaSel,
        tipoEvento:               tipoEvento,
        idPaquete:                camino === 'paquete' ? idPaquete ?? undefined : undefined,
        idsExtras:                camino === 'paquete' && extrasSeleccionados.length > 0 ? extrasSeleccionados : undefined,
        extrasLibres:             camino === 'paquete' && otrasIdeas.trim() ? [otrasIdeas.trim()] : undefined,
        esCotizacionPersonalizada: camino === 'cotizacion',
        descripcionPersonalizada: camino === 'cotizacion' ? descripcion : undefined,
        idsServiciosCotizacion:   camino === 'cotizacion' && serviciosCotizacion.length > 0 ? serviciosCotizacion : undefined,
        presupuestoEstimado:      presupuestoCliente ?? undefined,
        aforoDeclarado:           invitados ?? undefined,
        contactoAdicional:        telefonoAdicional || undefined,
        nombreNino:               tipoEvento === 'CUMPLEANOS' && nombreNino ? nombreNino.trim() : undefined,
        edadCumple:               tipoEvento === 'CUMPLEANOS' && edadCumple ? edadCumple : undefined,
      })
    },
    onSuccess: (evento) => {
      setEventoCreado(evento)
      // Clean up timer
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('wizard_start_time')
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo enviar la solicitud.')
    },
  })

  return {
    // Navigation
    paso,
    setPaso,
    canAdvance1,
    canAdvance2,
    canAdvance3,
    // Modals
    modalAnticipacion,
    setModalAnticipacion,
    // Step 1
    tipoEvento,
    setTipoEvento,
    camino,
    setCamino,
    idPaquete,
    setIdPaquete,
    paqueteDetalle,
    setPaqueteDetalle,
    // Step 2 – paquete
    extrasSeleccionados,
    setExtras,
    toggleExtra,
    otrasIdeas,
    setOtrasIdeas,
    // Step 2 – cotizacion
    descripcion,
    setDescripcion,
    serviciosCotizacion,
    toggleServicio,
    // Step 2 – shared
    presupuestoCliente,
    setPresupuestoCliente,
    // Step 3
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
    // Validation
    validationErrors,
    // Result
    eventoCreado,
    solicitar: solicitarMutation.mutate,
    isSubmitting: solicitarMutation.isPending,
    resetWizard,
  }
}

export type UseSolicitarEventoWizard = ReturnType<typeof useSolicitarEventoWizard>
