import { z } from 'zod'
import { correoField, nombreField, PW_RULES, telefonoOpcionalField } from '@/lib/validations/campos'

export { PW_RULES }

export const crearUsuarioSchema = z
  .object({
    nombre: nombreField,
    correo: correoField,
    rol: z.enum(['ADMIN', 'CAJERO']),
    telefono: telefonoOpcionalField,
    generarPassword: z.boolean(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.generarPassword) {
      return
    }
    const pw = data.password ?? ''
    PW_RULES.forEach((rule) => {
      if (!rule.test(pw)) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: rule.label })
      }
    })
  })

export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioSchema>

export const editarUsuarioSchema = z.object({
  nombre:   nombreField,
  telefono: telefonoOpcionalField,
})

export type EditarUsuarioFormValues = z.infer<typeof editarUsuarioSchema>
