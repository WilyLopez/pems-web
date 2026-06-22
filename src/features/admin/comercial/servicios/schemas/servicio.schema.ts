import { z } from 'zod'

export const servicioSchema = z.object({
  nombre:            z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
  descripcion:       z.string().max(200, 'Máximo 200 caracteres').optional(),
  precioReferencial: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(),
  icono:             z.string().max(30).optional(),
  activo:            z.boolean().default(true),
  orden:             z.coerce.number().default(0),
})

export type ServicioFormValues = z.infer<typeof servicioSchema>
