import { z } from 'zod'
import { NOMBRE_REGEX, telefonoOpcionalField } from '@/lib/validations/campos'

export const infoPersonalSchema = z.object({
  nombres: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar los 120 caracteres')
    .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios'),
  apellidoPaterno: z
    .string()
    .min(1, 'El apellido paterno es obligatorio')
    .max(100, 'El apellido paterno no puede superar los 100 caracteres')
    .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios'),
  apellidoMaterno: z
    .string()
    .max(100, 'El apellido materno no puede superar los 100 caracteres')
    .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios')
    .optional()
    .or(z.literal('')),
  telefono: telefonoOpcionalField,
})

export type InfoPersonalValues = z.infer<typeof infoPersonalSchema>
