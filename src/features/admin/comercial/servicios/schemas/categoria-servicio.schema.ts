import { z } from 'zod'

export const categoriaServicioSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(80, 'Máximo 80 caracteres'),
  orden: z.coerce.number().min(0, 'El orden no puede ser negativo').default(0),
  activo: z.boolean().default(true),
})

export type CategoriaServicioFormValues = z.infer<
  typeof categoriaServicioSchema
>
