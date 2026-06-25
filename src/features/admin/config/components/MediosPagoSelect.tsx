'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useMediosPago } from '../hooks/useMediosPago'

interface MediosPagoSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MediosPagoSelect({
  value,
  onValueChange,
  placeholder = 'Selecciona medio de pago',
  disabled,
  className,
}: MediosPagoSelectProps) {
  const { data: medios, isLoading } = useMediosPago()

  if (isLoading) {
    return <Skeleton className="h-9 w-full rounded-md" />
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(medios ?? []).map((m) => (
          <SelectItem key={m.codigo} value={m.codigo}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
