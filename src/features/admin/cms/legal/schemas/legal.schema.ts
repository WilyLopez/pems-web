import { z } from 'zod'

export const legalSchema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(200),
  contenido: z.string().min(20, 'El contenido es muy corto').max(50000),
})

export type LegalFormValues = z.infer<typeof legalSchema>
