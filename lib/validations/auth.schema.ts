import { z } from 'zod'

export const loginSchema = z.object({
  correo: z.string().email('Correo inválido').min(1, 'Requerido'),
  contrasena: z.string().min(1, 'Requerido'),
})

export const registroSchema = z
  .object({
    nombre: z.string().min(2, 'Mínimo 2 caracteres').max(120),
    correo: z.string().email('Correo inválido'),
    contrasena: z.string().min(8, 'Mínimo 8 caracteres').max(72),
    confirmarContrasena: z.string(),
    telefono: z.string().min(7, 'Teléfono inválido').max(20),
    dni: z.string().length(8, 'DNI debe tener 8 dígitos').optional().or(z.literal('')),
  })
  .refine((d) => d.contrasena === d.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegistroFormValues = z.infer<typeof registroSchema>