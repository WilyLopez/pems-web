import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils'

interface DuracionFieldProps {
  value?: number | null
  onChange: (value: number | undefined) => void
  error?: string
}

const DURACION_POR_DEFECTO = 120

export function DuracionField({ value, onChange, error }: DuracionFieldProps) {
  const esTiempoLimitado = value !== undefined && value !== null

  return (
    <div className="space-y-1.5">
      <Label>Permanencia</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={cn(
            'flex-1 h-9 rounded-md border text-sm font-medium transition-colors',
            !esTiempoLimitado
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-input text-muted-foreground hover:bg-accent'
          )}
        >
          Todo el día
        </button>
        <button
          type="button"
          onClick={() => onChange(value ?? DURACION_POR_DEFECTO)}
          className={cn(
            'flex-1 h-9 rounded-md border text-sm font-medium transition-colors',
            esTiempoLimitado
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-input text-muted-foreground hover:bg-accent'
          )}
        >
          Tiempo limitado
        </button>
      </div>
      {esTiempoLimitado && (
        <div className="relative">
          <Input
            type="number"
            step="1"
            min="1"
            value={value ?? ''}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : undefined)
            }
            className="pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            minutos
          </span>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
