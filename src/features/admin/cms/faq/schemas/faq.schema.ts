import { z } from 'zod'

export const faqSchema = z.object({
  pregunta: z
    .string()
    .trim()
    .min(1, 'La pregunta es obligatoria')
    .min(5, 'La pregunta debe tener al menos 5 caracteres')
    .max(500, 'La pregunta no puede superar los 500 caracteres'),
  respuesta: z
    .string()
    .trim()
    .min(1, 'La respuesta es obligatoria')
    .min(10, 'La respuesta debe tener al menos 10 caracteres')
    .max(2000, 'La respuesta no puede superar los 2000 caracteres'),
  visible: z.boolean().default(true),
})

export type FaqFormValues = z.infer<typeof faqSchema>
