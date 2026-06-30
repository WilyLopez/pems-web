import { z } from 'zod'
import {
  NOMBRE_REGEX,
  DNI_REGEX,
  TELEFONO_CELULAR_REGEX as TELEFONO_PERU_REGEX,
  nombreField,
  dniField,
} from '@/lib/validations/campos'
import { format } from 'date-fns'

export { NOMBRE_REGEX, DNI_REGEX, TELEFONO_PERU_REGEX }

export const METODOS_PAGO = [
  'EFECTIVO',
  'YAPE',
  'PLIN',
  'TARJETA',
  'TRANSFERENCIA',
] as const

export const pagoLineaSchema = z.object({
  medioPago: z.enum(METODOS_PAGO),
  monto: z.coerce
    .number({ error: 'Ingresa un monto válido' })
    .min(0, 'El monto no puede ser negativo')
    .max(99999.99, 'El monto excede el límite permitido')
    .refine((v) => Number(v.toFixed(2)) === v, 'Máximo 2 decimales'),
  referencia: z.string().trim().optional(),
})

export const acompananteSchema = z
  .object({
    tipoDocumento: z.enum(['DNI', 'RUC']).default('DNI'),
    nombre: nombreField,
    dni: z.string().trim(),
    telefono: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || TELEFONO_PERU_REGEX.test(val),
        'Ingresa un celular válido (9 dígitos, empieza con 9)'
      ),
  })
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === 'DNI') {
      if (!/^\d{8}$/.test(data.dni)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El DNI debe tener 8 dígitos numéricos',
          path: ['dni'],
        })
      }
    } else if (data.tipoDocumento === 'RUC') {
      if (!/^(10|20)\d{9}$/.test(data.dni)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El RUC debe tener 11 dígitos numéricos y comenzar con 10 o 20',
          path: ['dni'],
        })
      }
    }
  })

function buildNinoSchema(edadMin: number, edadMax: number) {
  return z.object({
    nombreNino: nombreField,
    edadNino: z.coerce
      .number({ message: 'Ingresa la edad' })
      .int('La edad debe ser un número entero')
      .min(edadMin, `La edad mínima es ${edadMin} año(s)`)
      .max(edadMax, `La edad máxima permitida es ${edadMax} años`),
  })
}

export function buildVentaMostradorSchema(edadMin: number, edadMax: number) {
  const hoy = format(new Date(), 'yyyy-MM-dd')
  return z.object({
    fechaVisita: z
      .string()
      .min(1, 'Selecciona una fecha de visita')
      .refine((val) => !isNaN(new Date(val).getTime()), 'Fecha inválida')
      .refine(
        (val) => val >= hoy,
        'La fecha de visita no puede ser en el pasado'
      ),
    ninos: z
      .array(buildNinoSchema(edadMin, edadMax))
      .min(1, 'Agrega al menos un niño')
      .superRefine((ninos, ctx) => {
        const vistos = new Set<string>()
        ninos.forEach((nino, index) => {
          const clave = `${nino.nombreNino.trim().toUpperCase()}_${nino.edadNino}`
          if (clave && vistos.has(clave)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Ya agregaste un niño con el mismo nombre y edad',
              path: [index, 'nombreNino'],
            })
          }
          vistos.add(clave)
        })
      }),
    acompanante: acompananteSchema,
    idPromocion: z.number().nullable(),
    pagos: z.array(pagoLineaSchema).min(1, 'Agrega al menos un medio de pago'),
    efectivoRecibido: z.coerce.number().min(0).default(0),
    actaFirmada: z
      .boolean()
      .refine((v) => v === true, {
        message: 'Debes confirmar la firma del acta de responsabilidad',
      }),
  })
}

export type VentaMostradorFormValues = z.infer<
  ReturnType<typeof buildVentaMostradorSchema>
>
