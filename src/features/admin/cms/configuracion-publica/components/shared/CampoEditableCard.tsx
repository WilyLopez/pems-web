import type { ReactNode } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Props {
  titulo: string
  hint?: string
  icono?: ReactNode
  esDirty: boolean
  guardando: boolean
  onGuardar: () => void
  children: ReactNode
}

export function CampoEditableCard({
  titulo,
  hint,
  icono,
  esDirty,
  guardando,
  onGuardar,
  children,
}: Props) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {icono}
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {titulo}
              </p>
              {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
          </div>
          {esDirty && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
              Sin guardar
            </span>
          )}
        </div>

        {children}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!esDirty || guardando}
            onClick={onGuardar}
          >
            {guardando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
