import { z } from 'zod'

export const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ\s]{1,79}$/
export const DNI_REGEX = /^\d{8}$/
export const TELEFONO_PERU_REGEX = /^9\d{8}$/

export const METODOS_PAGO = ['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'] as const

export const pagoLineaSchema = z.object({
  medioPago: z.enum(METODOS_PAGO),
  monto: z.coerce
    .number({ message: 'Ingresa un monto válido' })
    .positive('El monto debe ser mayor a 0'),
  referencia: z.string().trim().optional(),
})

export const acompananteSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Ingresa el nombre completo')
    .regex(NOMBRE_REGEX, 'El nombre no debe contener números ni símbolos'),
  dni: z.string().trim().regex(DNI_REGEX, 'El DNI debe tener exactamente 8 dígitos'),
  telefono: z
    .string()
    .trim()
    .regex(TELEFONO_PERU_REGEX, 'Ingresa un celular válido (9 dígitos, empieza con 9)'),
})

function buildNinoSchema(edadMin: number, edadMax: number) {
  return z.object({
    nombreNino: z
      .string()
      .trim()
      .min(2, 'Ingresa el nombre completo')
      .regex(NOMBRE_REGEX, 'El nombre no debe contener números ni símbolos'),
    edadNino: z.coerce
      .number({ message: 'Ingresa la edad' })
      .int('La edad debe ser un número entero')
      .min(edadMin, `La edad mínima es ${edadMin} año(s)`)
      .max(edadMax, `La edad máxima permitida es ${edadMax} años`),
  })
}

export function buildVentaMostradorSchema(edadMin: number, edadMax: number) {
  return z.object({
    fechaVisita: z.string().min(1, 'Selecciona una fecha de visita'),
    ninos: z
      .array(buildNinoSchema(edadMin, edadMax))
      .min(1, 'Agrega al menos un niño')
      .superRefine((ninos, ctx) => {
        const vistos = new Set<string>()
        ninos.forEach((nino, index) => {
          const clave = nino.nombreNino.trim().toUpperCase()
          if (clave && vistos.has(clave)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Este niño ya fue agregado en la misma venta',
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
      .refine((v) => v === true, { message: 'Debes confirmar la firma del acta de responsabilidad' }),
  })
}

export type VentaMostradorFormValues = z.infer<ReturnType<typeof buildVentaMostradorSchema>>
