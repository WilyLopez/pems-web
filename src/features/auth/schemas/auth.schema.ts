import { z } from 'zod'
import { nombreField, correoField, telefonoField, dniOpcionalField } from '@/lib/validations/campos'

export const loginSchema = z.object({
  correo: correoField,
  contrasena: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registroSchema = z
  .object({
    nombre: nombreField,
    correo: correoField,
    contrasena: z.string().min(8, 'Mínimo 8 caracteres').max(72),
    confirmarContrasena: z.string().min(1, 'Confirma tu contraseña'),
    telefono: telefonoField,
    dni: dniOpcionalField,
    aceptaTerminos: z
      .boolean()
      .refine((v) => v === true, 'Debes aceptar los Términos y Condiciones'),
    aceptaPrivacidad: z
      .boolean()
      .refine((v) => v === true, 'Debes aceptar la Política de Privacidad'),
  })
  .refine((d) => d.contrasena === d.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  })

export type RegistroFormValues = z.infer<typeof registroSchema>

export const recuperarSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
})

export type RecuperarFormValues = z.infer<typeof recuperarSchema>

export const nuevaSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type NuevaFormValues = z.infer<typeof nuevaSchema>

export const cambiarSchema = z
  .object({
    contrasenaActual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nuevaContrasena: z
      .string()
      .min(8, 'La nueva contraseña debe tener mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmar: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((d) => d.nuevaContrasena === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

export type CambiarFormValues = z.infer<typeof cambiarSchema>
