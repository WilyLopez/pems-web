import { z } from 'zod'
import {
  NOMBRE_REGEX,
  telefonoOpcionalField,
  dniField,
} from '@/lib/validations/campos'

export function fechaMaximaNacimiento(): string {
  const limite = new Date()
  limite.setFullYear(limite.getFullYear() - 12)
  return limite.toISOString().split('T')[0]
}

const fechaNacimientoField = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine(
    (v) => !v || v <= fechaMaximaNacimiento(),
    'Debes tener al menos 12 años'
  )

export const infoPersonalSchema = z.object({
  nombres: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar los 120 caracteres')
    .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios'),
  apellidoPaterno: z
    .string()
    .max(100, 'El apellido paterno no puede superar los 100 caracteres')
    .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios')
    .optional()
    .or(z.literal('')),
  apellidoMaterno: z
    .string()
    .max(100, 'El apellido materno no puede superar los 100 caracteres')
    .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios')
    .optional()
    .or(z.literal('')),
  telefono: telefonoOpcionalField,
  fechaNacimiento: fechaNacimientoField,
})

export type InfoPersonalValues = z.infer<typeof infoPersonalSchema>

export const completarDniSchema = z.object({
  dni: dniField,
})

export type CompletarDniValues = z.infer<typeof completarDniSchema>
