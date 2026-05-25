import { z } from 'zod'

export const reservaSchema = z.object({
  nombreNino: z
    .string()
    .min(2, 'El nombre del niño debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar 120 caracteres'),

  edadNino: z.coerce
    .number({ invalid_type_error: 'Ingresa la edad del niño' })
    .min(0, 'La edad minima es 0 años')
    .max(17, 'La edad maxima es 17 años'),

  nombreAcompanante: z
    .string()
    .min(2, 'El nombre del acompanante debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar 120 caracteres'),

  dniAcompanante: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 digitos')
    .regex(/^\d{8}$/, 'El DNI solo debe contener numeros'),

  aceptaReglamento: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el reglamento para continuar' }),
  }),

  conoceActa: z.literal(true, {
    errorMap: () => ({
      message: 'Debes confirmar que conoces el Acta de Responsabilidad',
    }),
  }),
})

export type ReservaFormValues = z.infer<typeof reservaSchema>

export const crearReservaSchema = reservaSchema
export type CrearReservaFormValues = ReservaFormValues
