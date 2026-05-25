import { z } from 'zod'

z.setErrorMap((issue, ctx) => {
  if (issue.code === 'too_small' && issue.type === 'string') {
    if (issue.minimum === 1) return { message: 'Este campo es obligatorio' }
    return { message: `Debe tener al menos ${issue.minimum} caracteres` }
  }
  if (issue.code === 'too_big' && issue.type === 'string')
    return { message: `No puede superar los ${issue.maximum} caracteres` }
  if (issue.code === 'invalid_string' && issue.validation === 'email')
    return { message: 'Ingresa un correo electrónico válido' }
  if (issue.code === 'invalid_type' && issue.received === 'undefined')
    return { message: 'Este campo es obligatorio' }
  return { message: ctx.defaultError }
})
