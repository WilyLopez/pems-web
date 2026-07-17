import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pencil, Trash2, ImageOff, Star } from 'lucide-react'
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

export function ServicioCard({
  servicio,
  onEdit,
  onDelete,
}: ServicioCardProps) {
  const { actualizar } = useServicioCotizacionMutations()

  const idEnActualizacion =
    actualizar.isPending && actualizar.variables?.id === servicio.id

  const precioLabel = servicio.tieneVariantes
    ? `Desde ${formatCurrency(servicio.precioDesde ?? servicio.precioReferencial ?? 0)}`
    : servicio.precioReferencial
      ? formatCurrency(servicio.precioReferencial)
      : 'Precio variable'

  return (
    <Card className={!servicio.activo ? 'opacity-60' : undefined}>
      {servicio.imagenPrincipal ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={servicio.imagenPrincipal}
          alt={servicio.nombre}
          className="h-32 w-full object-cover rounded-t-xl"
        />
      ) : (
        <div className="h-32 w-full rounded-t-xl bg-muted flex items-center justify-center">
          <ImageOff className="h-6 w-6 text-muted-foreground/50" />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-azul/10 flex items-center justify-center text-brand-azul shrink-0">
              <DynamicIcon name={servicio.icono} className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm truncate">
                  {servicio.nombre}
                </h3>
                {servicio.destacado && (
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Orden: {servicio.orden}
              </p>
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
            isPending={idEnActualizacion}
          />
        </div>

        {servicio.categoriaNombre && (
          <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 text-[10px] font-semibold w-fit">
            {servicio.categoriaNombre}
          </Badge>
        )}

        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
          {servicio.descripcion || 'Sin descripción'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
          <span className="text-sm font-bold text-brand-azul">
            {precioLabel}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(servicio)}
            >
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
