import { z } from 'zod'
import { CanalReserva } from '@/types/enums'

export const crearReservaSchema = z.object({
  canalReserva: z.nativeEnum(CanalReserva),
  fechaEvento: z.string().min(1, 'Selecciona una fecha'),
  nombreNino: z.string().min(2).max(120),
  edadNino: z.number().min(0).max(17),
  nombreAcompanante: z.string().min(2).max(120),
  dniAcompanante: z.string().length(8, 'DNI debe tener 8 dígitos'),
  firmoConsentimiento: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el consentimiento' }),
  }),
  idPromocionManual: z.number().optional(),
})

export type CrearReservaFormValues = z.infer<typeof crearReservaSchema>