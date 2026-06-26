'use client'

import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { eventoService } from '@/services/evento.service'
import { toast } from 'sonner'
import { EventoPrivado } from '../../shared/types'
import { PaqueteEvento } from '@/types/comercial.types'
import { NOMBRE_REGEX, TELEFONO_CELULAR_REGEX } from '@/lib/validations/campos'
import { useWizardEventoStore } from '@/lib/store/wizard-evento.store'

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
  const {
    paso, setPaso,
    tipoEvento, setTipoEvento,
    camino, setCamino,
    idPaquete, setIdPaquete,
    extrasSeleccionados, setExtras, toggleExtra,
    otrasIdeas, setOtrasIdeas,
    descripcion, setDescripcion,
    serviciosCotizacion, toggleServicio,
    presupuestoCliente, setPresupuestoCliente,
    fechaSel, setFecha,
    idTurno, setIdTurno,
    nombreNino, setNombreNino,
    edadCumple, setEdadCumple,
    invitados, setInvitados,
    telefonoAdicional, setTelefonoAdicional,
    reset: resetStore,
  } = useWizardEventoStore()

  const [paqueteDetalle, setPaqueteDetalle] = useState<PaqueteEvento | null>(null)
  const [modalAnticipacion, setModalAnticipacion] = useState(false)
  const [eventoCreado, setEventoCreado] = useState<EventoPrivado | null>(null)

  const validationErrors = useMemo<WizardValidationErrors>(() => {
    const errors: WizardValidationErrors = {}

    if (camino === 'cotizacion') {
      if (descripcion.length === 0) {
        errors.descripcion = 'Obligatorio'
      } else if (descripcion.length < 30) {
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
      if (camino !== 'cotizacion' && invitados > 500) errors.invitados = 'Máximo 500 personas'
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
  }, [camino, descripcion, otrasIdeas, invitados, nombreNino, edadCumple, telefonoAdicional, presupuestoCliente, edadMin, edadMax])

  const canAdvance1 = tipoEvento !== null && camino !== null

  const canAdvance2 = useMemo(() => {
    if (camino === 'paquete') return Object.keys(validationErrors).length === 0
    if (camino === 'cotizacion') {
      return (
        descripcion.length >= 30 &&
        descripcion.length <= 1000 &&
        Object.keys(validationErrors).length === 0
      )
    }
    return false
  }, [camino, descripcion, validationErrors])

  const canAdvance3 = useMemo(() => {
    const basico = fechaSel !== null && idTurno !== null
    if (!basico) return false
    if (!invitados || invitados <= 0) return false
    if (camino !== 'cotizacion' && invitados > 500) return false
    if (tipoEvento === 'CUMPLEANOS' && (!nombreNino || nombreNino.trim().length < 2)) return false
    if (nombreNino && !NOMBRE_REGEX.test(nombreNino)) return false
    if (telefonoAdicional && !TELEFONO_CELULAR_REGEX.test(telefonoAdicional)) return false
    if (edadCumple !== null && (edadCumple < edadMin || edadCumple > edadMax)) return false
    return true
  }, [camino, fechaSel, idTurno, invitados, tipoEvento, nombreNino, telefonoAdicional, edadCumple, edadMin, edadMax])

  const resetWizard = () => {
    resetStore()
    setEventoCreado(null)
    setPaqueteDetalle(null)
    setModalAnticipacion(false)
  }

  const solicitarMutation = useMutation({
    mutationFn: () => {
      if (!isAuthenticated || !idUsuario || !idTurno || !fechaSel || !tipoEvento) {
        throw new Error('Datos de solicitud incompletos.')
      }
      return eventoService.solicitar(idUsuario, idSede, {
        idTurno,
        fechaEvento:               fechaSel,
        tipoEvento:                tipoEvento,
        origenContacto:            'WEB',
        idPaquete:                 camino === 'paquete' ? idPaquete ?? undefined : undefined,
        idsExtras:                 camino === 'paquete' && extrasSeleccionados.length > 0 ? extrasSeleccionados : undefined,
        extrasLibres:              camino === 'paquete' && otrasIdeas.trim() ? [otrasIdeas.trim()] : undefined,
        esCotizacionPersonalizada: camino === 'cotizacion',
        descripcionPersonalizada:  camino === 'cotizacion' ? descripcion : undefined,
        idsServiciosCotizacion:    camino === 'cotizacion' && serviciosCotizacion.length > 0 ? serviciosCotizacion : undefined,
        presupuestoEstimado:       presupuestoCliente ?? undefined,
        aforoDeclarado:            invitados ?? undefined,
        contactoAdicional:         telefonoAdicional || undefined,
        nombreNino:                tipoEvento === 'CUMPLEANOS' && nombreNino ? nombreNino.trim() : undefined,
        edadCumple:                tipoEvento === 'CUMPLEANOS' && edadCumple ? edadCumple : undefined,
      })
    },
    onSuccess: (evento) => {
      setEventoCreado(evento)
      resetStore()
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo enviar la solicitud.')
    },
  })

  return {
    paso, setPaso,
    canAdvance1, canAdvance2, canAdvance3,
    modalAnticipacion, setModalAnticipacion,
    tipoEvento, setTipoEvento,
    camino, setCamino,
    idPaquete, setIdPaquete,
    paqueteDetalle, setPaqueteDetalle,
    extrasSeleccionados, setExtras, toggleExtra,
    otrasIdeas, setOtrasIdeas,
    descripcion, setDescripcion,
    serviciosCotizacion, toggleServicio,
    presupuestoCliente, setPresupuestoCliente,
    fechaSel, setFecha,
    idTurno, setIdTurno,
    nombreNino, setNombreNino,
    edadCumple, setEdadCumple,
    invitados, setInvitados,
    telefonoAdicional, setTelefonoAdicional,
    validationErrors,
    eventoCreado,
    solicitar: solicitarMutation.mutate,
    isSubmitting: solicitarMutation.isPending,
    resetWizard,
  }
}

export type UseSolicitarEventoWizard = ReturnType<typeof useSolicitarEventoWizard>
