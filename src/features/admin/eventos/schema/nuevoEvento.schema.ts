import { z } from 'zod'
import { NOMBRE_REGEX } from '@/lib/validations/campos'

const CONTACTO_ADICIONAL_REGEX = /^(9\d{8}|[^\s@]+@[^\s@]+\.[^\s@]+)$/

export type OrigenContacto = 'PRESENCIAL' | 'TELEFONO' | 'WHATSAPP' | 'WEB'

export const ORIGENES_CONTACTO: { value: OrigenContacto; label: string }[] = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'TELEFONO', label: 'Teléfono' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'WEB', label: 'Web' },
]

export interface EventoSchemaConfig {
  aforoMaximo: number
  edadMinCumple: number
  edadMaxCumple: number
}

export function buildNuevoEventoSchema(config: EventoSchemaConfig) {
  return z
    .object({
      idTurno: z.number().int().positive('El turno es requerido'),
      fechaEvento: z.string().min(1, 'La fecha es requerida'),
      idCliente: z.number().int().positive('Selecciona un cliente'),
      tipoEvento: z
        .string()
        .min(1, 'El tipo de evento es requerido')
        .max(120, 'Máximo 120 caracteres'),
      contactoAdicional: z
        .string()
        .trim()
        .regex(
          CONTACTO_ADICIONAL_REGEX,
          'Ingresa un celular (9XXXXXXXX) o un correo válido'
        )
        .optional()
        .or(z.literal('')),
      aforoDeclarado: z
        .number()
        .int()
        .min(1, 'Mínimo 1 persona')
        .max(config.aforoMaximo, `Máximo ${config.aforoMaximo} personas`)
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
        .min(config.edadMinCumple, `Mínimo ${config.edadMinCumple} años`)
        .max(config.edadMaxCumple, `Máximo ${config.edadMaxCumple} años`)
        .optional(),
      idPaquete: z.number().int().positive().optional(),
      origenContacto: z
        .enum(['PRESENCIAL', 'TELEFONO', 'WHATSAPP', 'WEB'])
        .optional(),
      presupuestoEstimado: z
        .number()
        .min(0, 'Debe ser mayor o igual a 0')
        .optional(),
      extrasLibres: z
        .string()
        .max(1000, 'Máximo 1000 caracteres')
        .optional()
        .or(z.literal('')),
      observaciones: z.string().max(2000).optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
      const tieneNombre = !!data.nombreNino?.trim()
      const tieneEdad = data.edadCumple !== undefined

      if (tieneNombre && !tieneEdad) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'La edad es requerida cuando se especifica el nombre del niño',
          path: ['edadCumple'],
        })
      }
      if (tieneEdad && !tieneNombre) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El nombre es requerido cuando se especifica la edad',
          path: ['nombreNino'],
        })
      }
    })
}

export type NuevoEventoSchema = ReturnType<typeof buildNuevoEventoSchema>
export type NuevoEventoFormValues = z.infer<NuevoEventoSchema>
