import { Input } from '@/components/ui/Input'
import { formatearTelefono } from '../../utils/telefono'

interface Props {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
}

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder = '987 654 321',
}: Props) {
  return (
    <Input
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      value={formatearTelefono(value)}
      onChange={(e) => onChange(formatearTelefono(e.target.value))}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={11}
    />
  )
}
