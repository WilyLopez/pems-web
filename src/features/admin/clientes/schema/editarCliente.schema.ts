import { z } from 'zod'
import { NOMBRE_REGEX, telefonoOpcionalField } from '@/lib/validations/campos'

function esMayorDeEdadMinima(fecha: string) {
  const nacimiento = new Date(fecha)
  const edadMinima = new Date()
  edadMinima.setFullYear(edadMinima.getFullYear() - 12)
  return nacimiento <= edadMinima
}

export const editarClienteSchema = z.object({
  nombres: z
    .string()
    .min(2, { message: 'El nombre debe tener mínimo 2 caracteres' })
    .max(100)
    .regex(NOMBRE_REGEX, { message: 'El nombre solo debe contener letras' }),
  apellidoPaterno: z
    .string()
    .min(1, { message: 'El apellido paterno es obligatorio' })
    .max(100)
    .regex(NOMBRE_REGEX, {
      message: 'El apellido paterno solo debe contener letras',
    }),
  apellidoMaterno: z
    .string()
    .max(100)
    .regex(NOMBRE_REGEX, {
      message: 'El apellido materno solo debe contener letras',
    })
    .optional()
    .or(z.literal('')),
  telefono: telefonoOpcionalField,
  correo: z
    .string()
    .email({ message: 'Correo electrónico inválido' })
    .max(150)
    .optional()
    .or(z.literal('')),
  fechaNacimiento: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((valor) => !valor || esMayorDeEdadMinima(valor), {
      message: 'Debe tener al menos 12 años',
    }),
  aceptaComunicaciones: z.boolean(),
})

export type EditarClienteFormValues = z.infer<typeof editarClienteSchema>
