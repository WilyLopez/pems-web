import { z } from 'zod'

export const abrirCajaSchema = z.object({
  saldoInicial: z.coerce
    .number()
    .min(0, 'El saldo inicial no puede ser negativo'),
  observaciones: z.string().optional(),
})

export const cerrarCajaSchema = z.object({
  saldoFinal: z.coerce.number().min(0, 'El saldo final no puede ser negativo'),
  observaciones: z.string().optional(),
})

export const movimientoCajaSchema = z.object({
  tipo: z.enum(['INGRESO', 'EGRESO'], { message: 'Selecciona tipo' }),
  concepto: z.string().min(2, 'El concepto es obligatorio'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  medioPago: z.string().optional(),
  categoriaRetiro: z
    .enum(['SERVICIOS', 'PROVEEDORES', 'PERSONAL', 'OPERATIVO', 'OTRO'])
    .optional(),
})

export const ingresoManualSchema = z.object({
  tipoIngresoCodigo: z.string().min(1, 'Selecciona un tipo'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  medioPago: z.string().optional(),
  descripcion: z.string().optional(),
})

export const tipoIngresoSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50).toUpperCase(),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
})

export const egresoSchema = z.object({
  tipoEgresoCodigo: z.string().min(1, 'Selecciona un tipo'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  esRecurrente: z.boolean().default(false),
  periodoAnio: z.coerce.number().optional(),
  periodoMes: z.coerce.number().min(1).max(12).optional(),
  descripcion: z.string().optional(),
  comprobanteUrl: z.string().optional().or(z.literal('')),
})

export const tipoEgresoSchema = z.object({
  codigo: z.string().min(2, 'El código es obligatorio').max(50),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoria: z.enum(['RECURRENTE_FIJO', 'RECURRENTE_VARIABLE', 'EVENTUAL']),
})

export const presupuestoNuevoSchema = z.object({
  concepto: z.string().min(2, 'El concepto es obligatorio'),
  categoria: z.string().min(1, 'La categoría es obligatoria'),
  montoEstimado: z.coerce.number().positive('Debe ser mayor a 0'),
})

export const presupuestoEjecutarSchema = z.object({
  montoReal: z.coerce.number().positive('Debe ser mayor a 0'),
})

export const gastoOperativoSchema = z.object({
  descripcion: z.string().min(1, 'La descripcion es obligatoria'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  comprobanteUrl: z.string().optional().or(z.literal('')),
})

export const arqueoSchema = z.object({
  saldoContado: z.coerce
    .number()
    .min(0, 'El saldo contado no puede ser negativo'),
  observaciones: z.string().optional(),
})
