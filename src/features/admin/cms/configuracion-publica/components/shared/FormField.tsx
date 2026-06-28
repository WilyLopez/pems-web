import { Label } from '@/components/ui/Label'

interface Props {
  label:         string
  id?:           string
  error?:        string
  hint?:         string
  children:      React.ReactNode
  maxLength?:    number
  currentLength?: number
}

export function FormField({ label, id, error, hint, children, maxLength, currentLength }: Props) {
  const showCounter = maxLength !== undefined && currentLength !== undefined
  const isWarning   = showCounter && currentLength > maxLength * 0.85

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor={id}>{label}</Label>
        {showCounter && (
          <span className={`text-xs tabular-nums ${isWarning ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      {children}
      {hint  && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
