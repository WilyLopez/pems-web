import { zodResolver as _zodResolver } from '@hookform/resolvers/zod'
import type { Resolver, FieldValues } from 'react-hook-form'
import type { ZodType, output } from 'zod'

export function zodResolver<T extends ZodType<FieldValues, any>>(schema: T): Resolver<output<T>> {
  return _zodResolver(schema as any) as unknown as Resolver<output<T>>
}
