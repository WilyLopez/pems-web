import { z } from 'zod'

export const contactoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  telefono: z.string().optional().or(z.literal('')),
  asunto: z
    .string()
    .max(100, 'El asunto no debe exceder los 100 caracteres')
    .optional()
    .or(z.literal('')),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

export const resenaSchema = z.object({
  idEventoPrivado: z.number({
    message: 'Debe seleccionar el evento que desea calificar',
  }),
  nombreAutor: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contenido: z
    .string()
    .min(5, 'La opinión debe tener al menos 5 caracteres')
    .max(1000, 'La opinión no debe exceder los 1000 caracteres'),
  calificacion: z.number().min(1).max(5),
  fotoUrl: z
    .string()
    .url('Debe ser una URL de imagen válida')
    .optional()
    .or(z.literal('')),
})

export function getReservationSchema(minAge: number, maxAge: number) {
  return z.object({
    nombreNino: z
      .string()
      .min(2, 'El nombre del niño debe tener al menos 2 caracteres')
      .max(120, 'El nombre no puede superar 120 caracteres'),

    edadNino: z.coerce
      .number({ message: 'Ingresa la edad del niño' })
      .min(minAge, `La edad mínima permitida es de ${minAge} años`)
      .max(maxAge, `La edad máxima permitida es de ${maxAge} años`),

    nombreAcompanante: z
      .string()
      .min(2, 'El nombre del acompañante debe tener al menos 2 caracteres')
      .max(120, 'El nombre no puede superar 120 caracteres'),

    dniAcompanante: z
      .string()
      .length(8, 'El DNI debe tener exactamente 8 dígitos')
      .regex(/^\d{8}$/, 'El DNI solo debe contener números'),

    aceptaReglamento: z.boolean().refine((v) => v === true, {
      message: 'Debes aceptar el reglamento para continuar',
    }),

    conoceActa: z.boolean().refine((v) => v === true, {
      message: 'Debes confirmar que conoces el Acta de Responsabilidad',
    }),
  })
}

export type ContactoFormValues = z.infer<typeof contactoSchema>
export type ResenaFormValues = z.infer<typeof resenaSchema>
