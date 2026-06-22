import { z } from 'zod'

export const TIPOS_DOCUMENTO = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carnet de extranjería' },
  { value: 'RUC', label: 'RUC' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
]

export const clienteFormSchema = z.object({
  tipoDocumentoCodigo: z.string().min(1, { message: 'Selecciona el tipo de documento' }),
  numeroDocumento: z.string().min(1, { message: 'El número de documento es obligatorio' }),
  nombres: z
    .string()
    .min(2, { message: 'El nombre debe tener mínimo 2 caracteres' })
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, { message: 'El nombre solo debe contener letras' }),
  apellidoPaterno: z
    .string()
    .min(1, { message: 'El apellido paterno es obligatorio' })
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, { message: 'El apellido paterno solo debe contener letras' }),
  apellidoMaterno: z
    .string()
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]*$/, { message: 'El apellido materno solo debe contener letras' })
    .optional()
    .or(z.literal('')),
  correo: z.string().email({ message: 'Correo electrónico inválido' }).max(150).optional().or(z.literal('')),
  telefono: z
    .string()
    .regex(/^9\d{8}$/, { message: 'El teléfono debe ser un celular de 9 dígitos que comience con 9' })
    .optional()
    .or(z.literal('')),
  aceptaComunicaciones: z.boolean().default(true),
}).superRefine((data, ctx) => {
  const { tipoDocumentoCodigo, numeroDocumento } = data
  if (tipoDocumentoCodigo === 'DNI') {
    if (!/^\d{8}$/.test(numeroDocumento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El DNI debe tener exactamente 8 dígitos numéricos',
        path: ['numeroDocumento'],
      })
    }
  } else if (tipoDocumentoCodigo === 'RUC') {
    if (!/^\d{11}$/.test(numeroDocumento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El RUC debe tener exactamente 11 dígitos numéricos',
        path: ['numeroDocumento'],
      })
    }
  } else if (tipoDocumentoCodigo === 'CE') {
    if (!/^[a-zA-Z0-9]{8,15}$/.test(numeroDocumento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El Carnet de extranjería debe tener entre 8 y 15 caracteres alfanuméricos',
        path: ['numeroDocumento'],
      })
    }
  } else if (tipoDocumentoCodigo === 'PASAPORTE') {
    if (!/^[a-zA-Z0-9]{6,15}$/.test(numeroDocumento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El Pasaporte debe tener entre 6 y 15 caracteres alfanuméricos',
        path: ['numeroDocumento'],
      })
    }
  }
})

export type ClienteFormValues = z.infer<typeof clienteFormSchema>
