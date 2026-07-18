import { z } from 'zod'
import {
  correoField,
  nombreField,
  telefonoOpcionalField,
} from '@/lib/validations/campos'

export const crearUsuarioSchema = z.object({
  nombre: nombreField,
  correo: correoField,
  rol: z.enum(['ADMIN', 'CAJERO']),
  telefono: telefonoOpcionalField,
})

export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioSchema>

export const editarUsuarioSchema = z.object({
  nombre: nombreField,
  telefono: telefonoOpcionalField,
})

export type EditarUsuarioFormValues = z.infer<typeof editarUsuarioSchema>

export const cambiarRolSchema = z.object({
  nuevoRol: z.enum(['ADMIN', 'CAJERO']),
})

export type CambiarRolFormValues = z.infer<typeof cambiarRolSchema>
