import { z } from 'zod'

z.setErrorMap((issue) => {
  if (issue.code === 'too_small' && issue.origin === 'string') {
    if (issue.minimum === 1) return { message: 'Este campo es obligatorio' }
    return { message: `Debe tener al menos ${issue.minimum} caracteres` }
  }
  if (issue.code === 'too_big' && issue.origin === 'string')
    return { message: `No puede superar los ${issue.maximum} caracteres` }
  if (issue.code === 'invalid_format' && issue.format === 'email')
    return { message: 'Ingresa un correo electrónico válido' }
  if (issue.code === 'invalid_type' && issue.input === undefined)
    return { message: 'Este campo es obligatorio' }
  return undefined
})
