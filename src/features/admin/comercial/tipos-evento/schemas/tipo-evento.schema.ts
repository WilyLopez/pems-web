import { z } from 'zod'

export const tipoEventoSchema = z.object({
  nombre:      z.string().min(1, 'El nombre es requerido').max(80, 'Máximo 80 caracteres'),
  descripcion: z.string().max(200, 'Máximo 200 caracteres').optional(),
  icono:       z.string().max(50).optional(),
  orden:       z.coerce.number().min(0, 'El orden no puede ser negativo').default(0),
  activo:      z.boolean().default(true),
})

export type TipoEventoFormValues = z.infer<typeof tipoEventoSchema>
