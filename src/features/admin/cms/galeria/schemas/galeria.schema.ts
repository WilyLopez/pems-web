import { z } from 'zod'
import { CATEGORIAS_IMAGEN } from '../constants/categorias'

export const categoriaSchema = z.enum(CATEGORIAS_IMAGEN)

export const metadatosImagenSchema = z.object({
  titulo: z
    .string()
    .trim()
    .max(150, 'El título no puede superar los 150 caracteres')
    .optional(),
  descripcion: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional(),
  altTexto: z
    .string()
    .trim()
    .max(150, 'El texto alternativo no puede superar los 150 caracteres')
    .optional(),
  categoria: categoriaSchema,
  orden: z.coerce
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo'),
})

export type MetadatosImagenFormValues = z.infer<typeof metadatosImagenSchema>
