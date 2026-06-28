import { z } from 'zod'
import {
  nombreField,
  correoField,
  telefonoField,
  dniOpcionalField,
} from './campos'

export const loginSchema = z.object({
  correo: correoField,
  contrasena: z.string().min(1, 'Requerido'),
})

export const registroSchema = z
  .object({
    nombre: nombreField,
    correo: correoField,
    contrasena: z.string().min(8, 'Mínimo 8 caracteres').max(72),
    confirmarContrasena: z.string(),
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

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegistroFormValues = z.infer<typeof registroSchema>
