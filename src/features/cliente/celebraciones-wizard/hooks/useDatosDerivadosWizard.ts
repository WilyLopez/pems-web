'use client'

import { useMemo } from 'react'
import { precioServicioEfectivo } from '../lib/servicio-precio'
import { TipoEvento, PaqueteEvento } from '@/types/comercial.types'
import { Turno, ServicioCotizacion } from '@/types/evento.types'
import { Disponibilidad } from '@/features/admin/calendario/types'

interface UseDatosDerivadosWizardParams {
  tiposEvento: TipoEvento[]
  tipoEvento: string | null
  paquetesAll: PaqueteEvento[]
  idPaquete: number | null
  fechaSel: string | null
  disponibilidades: Disponibilidad[] | undefined
  turnos: Turno[]
  idTurno: number | null
  servicios: ServicioCotizacion[]
  serviciosCotizacion: number[]
  variantesSeleccionadas: Record<number, number>
  invitados: number | null
}

export function useDatosDerivadosWizard({
  tiposEvento,
  tipoEvento,
  paquetesAll,
  idPaquete,
  fechaSel,
  disponibilidades,
  turnos,
  idTurno,
  servicios,
  serviciosCotizacion,
  variantesSeleccionadas,
  invitados,
}: UseDatosDerivadosWizardParams) {
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

  const limitePersonas = paqueteSeleccionado?.limitepersonas ?? null
  const invitadosExcedeLimite = Boolean(
    limitePersonas && invitados && invitados > limitePersonas
  )

  return {
    tipoEventoSeleccionado,
    tipoEventoLabel,
    paquetesFiltrados,
    disponibilidadDia,
    fechasOcupadas,
    paqueteSeleccionado,
    turnoSeleccionado,
    presupuestoEstimado,
    serviciosConVariantePendiente,
    limitePersonas,
    invitadosExcedeLimite,
  }
}
