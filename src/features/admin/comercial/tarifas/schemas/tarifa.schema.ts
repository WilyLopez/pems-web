import { z } from 'zod'

export const tarifaSchema = z.object({
  precio: z.coerce
    .number({ message: 'Ingresa un precio válido' })
    .min(0.01, 'El precio debe ser mayor a S/ 0.00')
    .max(999.99, 'El precio no puede exceder S/ 999.99'),
  duracionMinutos: z
    .number()
    .int('La duración debe ser un número entero de minutos')
    .positive('La duración debe ser mayor a 0 minutos')
    .optional(),
})

export type TarifaFormValues = z.infer<typeof tarifaSchema>
