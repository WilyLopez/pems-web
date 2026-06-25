import { z } from 'zod'

export const SPECIAL_CHARS = '!@#$%&*?'

export const PW_RULES = [
  { key: 'len',     label: '8 caracteres mínimo',                    test: (p: string) => p.length >= 8 },
  { key: 'upper',   label: 'Una letra mayúscula',                     test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'Una letra minúscula',                     test: (p: string) => /[a-z]/.test(p) },
  { key: 'digit',   label: 'Un número',                               test: (p: string) => /\d/.test(p) },
  { key: 'special', label: `Un carácter especial (${SPECIAL_CHARS})`, test: (p: string) => /[!@#$%&*?]/.test(p) },
] as const

export const NOMBRE_REGEX          = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
export const DNI_REGEX             = /^\d{8}$/
export const TELEFONO_CELULAR_REGEX = /^9\d{8}$/

export const nombreField = z
  .string()
  .trim()
  .min(2, 'Mínimo 2 caracteres')
  .max(120, 'Máximo 120 caracteres')
  .regex(NOMBRE_REGEX, 'Solo se permiten letras y espacios')
  .refine(
    v => v.split(/\s+/).filter(Boolean).every(w => w.replace(/['-]/g, '').length >= 2),
    'Cada palabra debe tener mínimo 2 letras',
  )

export const correoField = z
  .string()
  .trim()
  .min(1, 'El correo es obligatorio')
  .max(254, 'Máximo 254 caracteres')
  .email('Correo inválido')

export const telefonoField = z
  .string()
  .trim()
  .regex(TELEFONO_CELULAR_REGEX, 'Debe ser un celular de 9 dígitos que comience con 9')

export const telefonoOpcionalField = z
  .union([z.literal(''), telefonoField])
  .optional()

export const dniField = z
  .string()
  .trim()
  .length(8, 'El DNI debe tener 8 dígitos')
  .regex(DNI_REGEX, 'Solo se permiten números')
  .refine(v => !/^(\d)\1{7}$/.test(v), 'DNI inválido')

export const dniOpcionalField = dniField
  .optional()
  .or(z.literal(''))

export const montoField = z
  .number({ invalid_type_error: 'Ingresa un monto válido' })
  .positive('El monto debe ser mayor a 0')
  .max(99999.99, 'El monto excede el límite permitido')
  .refine(v => Number(v.toFixed(2)) === v, 'Máximo 2 decimales')

export const montoCoerceField = z.coerce
  .number({ invalid_type_error: 'Ingresa un monto válido' })
  .positive('El monto debe ser mayor a 0')
  .max(99999.99, 'El monto excede el límite permitido')
  .refine(v => Number(v.toFixed(2)) === v, 'Máximo 2 decimales')

export const contrasenaSeguraField = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(72, 'Máximo 72 caracteres')
  .refine(v => /[A-Z]/.test(v), 'Debe contener al menos una letra mayúscula')
  .refine(v => /[a-z]/.test(v), 'Debe contener al menos una letra minúscula')
  .refine(v => /\d/.test(v), 'Debe contener al menos un número')
  .refine(v => /[!@#$%&*?]/.test(v), `Debe contener al menos un carácter especial (${SPECIAL_CHARS})`)

export const documentoField = z
  .string()
  .trim()
  .min(1, 'El documento es obligatorio')
  .regex(/^\d{7,15}$/, 'Solo dígitos, entre 7 y 15 caracteres')

export type TipoDocumento = 'DNI' | 'RUC' | 'EXTRANJERO'

export const TIPOS_DOCUMENTO: {
  value:       TipoDocumento
  label:       string
  placeholder: string
  maxLength:   number
  hint:        string
}[] = [
  { value: 'DNI',        label: 'DNI',        placeholder: '12345678',    maxLength: 8,  hint: '8 dígitos numéricos' },
  { value: 'RUC',        label: 'RUC',        placeholder: '20123456789', maxLength: 11, hint: '11 dígitos numéricos' },
  { value: 'EXTRANJERO', label: 'Extranjero', placeholder: 'A1234567',    maxLength: 20, hint: 'Pasaporte o carnet · 6–20 caracteres alfanuméricos' },
]

function validarRuc(ruc: string): boolean {
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const suma = factores.reduce((acc, f, i) => acc + f * Number(ruc[i]), 0)
  const raw = 11 - (suma % 11)
  const esperado = raw >= 10 ? 0 : raw
  return esperado === Number(ruc[10])
}

const PREFIJOS_RUC = ['10', '15', '17', '20']

const _dniPeruanoField = z
  .string()
  .trim()
  .min(1, 'El DNI es obligatorio')
  .length(8, 'El DNI debe tener exactamente 8 dígitos')
  .regex(DNI_REGEX, 'Solo se permiten números')
  .refine(v => !/^(\d)\1{7}$/.test(v), 'DNI inválido')

const _rucField = z
  .string()
  .trim()
  .min(1, 'El RUC es obligatorio')
  .length(11, 'El RUC debe tener exactamente 11 dígitos')
  .regex(/^\d{11}$/, 'Solo se permiten números')
  .refine(v => PREFIJOS_RUC.includes(v.slice(0, 2)), 'El RUC debe comenzar con 10, 15, 17 o 20')
  .refine(v => validarRuc(v), 'RUC inválido (dígito verificador incorrecto)')

const _extranjeroField = z
  .string()
  .trim()
  .min(1, 'El documento es obligatorio')
  .min(6, 'Mínimo 6 caracteres')
  .max(20, 'Máximo 20 caracteres')
  .regex(/^[A-Z0-9]+$/, 'Solo letras mayúsculas y números')

export function documentoFieldPorTipo(tipo: TipoDocumento): z.ZodTypeAny {
  if (tipo === 'DNI') return _dniPeruanoField
  if (tipo === 'RUC') return _rucField
  return _extranjeroField
}

export function fieldError(field: z.ZodTypeAny, value: string): string {
  const result = field.safeParse(value)
  return result.success ? '' : (result.error.issues[0]?.message ?? 'Campo inválido')
}
