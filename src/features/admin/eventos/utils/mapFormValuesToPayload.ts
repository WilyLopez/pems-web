import { NuevoEventoFormValues } from '../schema/nuevoEvento.schema'
import { SolicitarEventoPayload } from '../types'

export function mapFormValuesToPayload(
  values: NuevoEventoFormValues
): SolicitarEventoPayload {
  const esCumpleanos = values.tipoEvento === 'CUMPLEANOS'

  return {
    idTurno: values.idTurno,
    fechaEvento: values.fechaEvento,
    tipoEvento: values.tipoEvento,
    contactoAdicional: values.contactoAdicional || undefined,
    aforoDeclarado: values.aforoDeclarado,
    nombreNino: esCumpleanos ? values.nombreNino || undefined : undefined,
    edadCumple: esCumpleanos ? values.edadCumple : undefined,
    idPaquete: values.idPaquete,
    idsExtras: values.idsExtras?.length ? values.idsExtras : undefined,
    idsServiciosCotizacion: values.idsServiciosCotizacion?.length
      ? values.idsServiciosCotizacion
      : undefined,
    variantesSeleccionadas: values.variantesSeleccionadas as
      Record<number, number> | undefined,
    origenContacto: values.origenContacto,
    presupuestoEstimado: values.presupuestoEstimado,
    extrasLibres: values.extrasLibres
      ? values.extrasLibres
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    observaciones: values.observaciones || undefined,
  }
}
