import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pencil, Trash2 } from 'lucide-react'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { DynamicIcon } from '@/components/admin/comercial/shared/IconPicker'
import { ServicioCotizacion } from '@/types/comercial.types'
import { formatCurrency } from '@/lib/utils'
import { useServicioCotizacionMutations } from '../hooks/useServicios'

interface ServicioCardProps {
  servicio: ServicioCotizacion
  onEdit: (servicio: ServicioCotizacion) => void
  onDelete: (id: number) => void
}

export function ServicioCard({ servicio, onEdit, onDelete }: ServicioCardProps) {
  const { actualizar } = useServicioCotizacionMutations()

  return (
    <Card className={!servicio.activo ? 'opacity-60' : undefined}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-azul/10 flex items-center justify-center text-brand-azul">
              <DynamicIcon name={servicio.icono} className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{servicio.nombre}</h3>
              <p className="text-xs text-muted-foreground">Orden: {servicio.orden}</p>
            </div>
          </div>
          <QuickToggle
            activo={servicio.activo}
            onToggle={() =>
              actualizar.mutate({
                id: servicio.id,
                payload: { ...servicio, activo: !servicio.activo },
              })
            }
            isPending={actualizar.isPending && (actualizar.variables as any)?.id === servicio.id}
          />
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
          {servicio.descripcion || 'Sin descripción'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t mt-auto">
          <span className="text-sm font-bold text-brand-azul">
            {servicio.precioReferencial ? formatCurrency(servicio.precioReferencial) : 'Precio variable'}
          </span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onEdit(servicio)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:text-destructive"
              onClick={() => onDelete(servicio.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
