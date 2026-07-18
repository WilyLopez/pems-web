'use client'

import { AlertTriangle } from 'lucide-react'

export function FieldWarning({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-amber-700 font-medium mt-1">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}
