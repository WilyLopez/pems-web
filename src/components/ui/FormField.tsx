import * as React from 'react'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils'

export interface FormFieldRenderProps {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': boolean | undefined
}

export interface FormFieldProps {
  id: string
  label: React.ReactNode
  required?: boolean
  error?: string
  hint?: React.ReactNode
  className?: string
  children: (fieldProps: FormFieldRenderProps) => React.ReactNode
}

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={id} className="dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-[10px] text-gray-400 dark:text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
