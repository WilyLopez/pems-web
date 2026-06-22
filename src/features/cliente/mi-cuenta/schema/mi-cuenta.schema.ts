import { z } from 'zod'

export const infoPersonalSchema = z.object({
  nombres: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar los 120 caracteres'),
  apellidoPaterno: z
    .string()
    .min(1, 'El apellido paterno es obligatorio')
    .max(100, 'El apellido paterno no puede superar los 100 caracteres'),
  apellidoMaterno: z
    .string()
    .max(100, 'El apellido materno no puede superar los 100 caracteres')
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede superar los 20 dígitos')
    .regex(/^[0-9+\s()-]+$/, 'El teléfono solo debe contener números, espacios y caracteres como +, -, (, )'),
})

export type InfoPersonalValues = z.infer<typeof infoPersonalSchema>
