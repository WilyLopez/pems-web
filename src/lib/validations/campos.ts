import { z } from 'zod'

export const SPECIAL_CHARS = '!@#$%&*?'

export const PW_RULES = [
  { key: 'len',     label: '8 caracteres mínimo',                    test: (p: string) => p.length >= 8 },
  { key: 'upper',   label: 'Una letra mayúscula',                     test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'Una letra minúscula',                     test: (p: string) => /[a-z]/.test(p) },
  { key: 'digit',   label: 'Un número',                               test: (p: string) => /\d/.test(p) },
  { key: 'special', label: `Un carácter especial (${SPECIAL_CHARS})`, test: (p: string) => /[!@#$%&*?]/.test(p) },
] as const

export const nombreField = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(120, 'Máximo 120 caracteres')

export const correoField = z
  .string()
  .min(1, 'El correo es obligatorio')
  .email('Correo inválido')

export const telefonoField = z
  .string()
  .min(7, 'Mínimo 7 dígitos')
  .max(20, 'Máximo 20 caracteres')
  .regex(/^[\d\s\-+()]+$/, 'Solo dígitos y símbolos (+, -, ())')

export const telefonoOpcionalField = z
  .union([z.literal(''), telefonoField])
  .optional()

export const dniField = z
  .string()
  .length(8, 'El DNI debe tener 8 dígitos')
  .regex(/^\d{8}$/, 'Solo se permiten números')

export const dniOpcionalField = dniField
  .optional()
  .or(z.literal(''))

// Documento de identidad genérico (legacy — usar documentoFieldPorTipo cuando sea posible)
export const documentoField = z
  .string()
  .min(1, 'El documento es obligatorio')
  .regex(/^\d{7,15}$/, 'Solo dígitos, entre 7 y 15 caracteres')

// ── Tipos de documento ──────────────────────────────────────────────────────

export type TipoDocumento = 'DNI' | 'RUC' | 'EXTRANJERO'

export const TIPOS_DOCUMENTO: {
  value:       TipoDocumento
  label:       string
  placeholder: string
  maxLength:   number
  hint:        string
}[] = [
  { value: 'DNI',        label: 'DNI',       placeholder: '12345678',    maxLength: 8,  hint: '8 dígitos numéricos' },
  { value: 'RUC',        label: 'RUC',       placeholder: '20123456789', maxLength: 11, hint: '11 dígitos numéricos' },
  { value: 'EXTRANJERO', label: 'Extranjero', placeholder: 'A1234567',   maxLength: 20, hint: 'Pasaporte o carnet · 6–20 caracteres alfanuméricos' },
]

const _dniPeruanoField = z
  .string()
  .min(1, 'El DNI es obligatorio')
  .length(8, 'El DNI debe tener exactamente 8 dígitos')
  .regex(/^\d{8}$/, 'Solo se permiten números')

const _rucField = z
  .string()
  .min(1, 'El RUC es obligatorio')
  .length(11, 'El RUC debe tener exactamente 11 dígitos')
  .regex(/^\d{11}$/, 'Solo se permiten números')

const _extranjeroField = z
  .string()
  .min(1, 'El documento es obligatorio')
  .min(6, 'Mínimo 6 caracteres')
  .max(20, 'Máximo 20 caracteres')
  .regex(/^[A-Z0-9]+$/, 'Solo letras mayúsculas y números')

export function documentoFieldPorTipo(tipo: TipoDocumento): z.ZodTypeAny {
  if (tipo === 'DNI')        return _dniPeruanoField
  if (tipo === 'RUC')        return _rucField
  return _extranjeroField
}

// Helper: extrae el primer mensaje de error de un safeParse, o '' si es válido
export function fieldError(field: z.ZodTypeAny, value: string): string {
  const result = field.safeParse(value)
  return result.success ? '' : (result.error.issues[0]?.message ?? 'Campo inválido')
}
