import { z } from 'zod'
import { NOMBRE_REGEX, telefonoOpcionalField } from '@/lib/validations/campos'

export const nuevoEventoSchema = z.object({
  idCliente: z
    .number({ required_error: 'Selecciona un cliente' })
    .int()
    .positive('Selecciona un cliente'),
  tipoEvento: z
    .string()
    .min(1, 'El tipo de evento es requerido')
    .max(120, 'Máximo 120 caracteres'),
  contactoAdicional: telefonoOpcionalField,
  aforoDeclarado: z
    .number()
    .int()
    .min(1, 'Mínimo 1 persona')
    .max(60, 'Máximo 60 personas')
    .optional(),
  nombreNino: z
    .string()
    .trim()
    .max(80, 'Máximo 80 caracteres')
    .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios')
    .optional()
    .or(z.literal('')),
  edadCumple: z
    .number()
    .int()
    .min(0, 'Edad inválida')
    .optional(),
  idPaquete: z.number().int().positive().optional(),
  observaciones: z.string().max(2000).optional().or(z.literal('')),
})

export type NuevoEventoFormValues = z.infer<typeof nuevoEventoSchema>
