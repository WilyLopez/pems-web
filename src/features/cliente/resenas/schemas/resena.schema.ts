import { z } from 'zod'

export const resenaEventoSchema = z.object({
  nombreAutor: z
    .string()
    .trim()
    .min(2, 'Ingresa tu nombre')
    .max(120, 'El nombre no puede superar los 120 caracteres'),
  calificacion: z
    .number()
    .min(1, 'Selecciona una calificación')
    .max(5, 'La calificación máxima es 5'),
  contenido: z
    .string()
    .trim()
    .min(5, 'Cuéntanos un poco más (mínimo 5 caracteres)')
    .max(1000, 'La opinión no puede superar los 1000 caracteres'),
})

export type ResenaEventoFormValues = z.infer<typeof resenaEventoSchema>
