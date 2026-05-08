'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, ToggleLeft, Tag, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { TipoPromocion } from '@/types/enums'
import { Promocion, CrearPromocionPayload } from '@/services/promocion.service'
import { usePromociones, useCrearPromocion, useDesactivarPromocion } from '@/hooks/usePromociones'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const promoSchema = z.object({
  tipoPromocion: z.nativeEnum(TipoPromocion),
  nombre: z.string().min(2).max(150),
  descripcion: z.string().optional(),
  valorDescuento: z.string().min(1),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().optional(),
  esAutomatica: z.boolean(),
})

type PromoFormValues = z.infer<typeof promoSchema>

const TIPOS_PROMO = [
  { value: TipoPromocion.DESCUENTO_PORCENTAJE, label: 'Descuento %' },
  { value: TipoPromocion.DESCUENTO_MONTO_FIJO, label: 'Descuento monto fijo' },
  { value: TipoPromocion.PAQUETE_GRUPAL, label: 'Paquete grupal' },
  { value: TipoPromocion.ENTRADA_GRATUITA, label: 'Entrada gratuita' },
  { value: TipoPromocion.CLIENTE_FRECUENTE, label: 'Cliente frecuente' },
]

export default function PromocionesPage() {
  const [open, setOpen] = useState(false)
  const [desactivarTarget, setDesactivarTarget] = useState<Promocion | null>(null)

  const { data, isLoading, isError, refetch } = usePromociones()
  const crear = useCrearPromocion()
  const desactivar = useDesactivarPromocion()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: { esAutomatica: true },
  })

  const onSubmit = (values: PromoFormValues) => {
    const payload: CrearPromocionPayload = {
      tipoPromocion: values.tipoPromocion,
      nombre: values.nombre,
      descripcion: values.descripcion,
      valorDescuento: parseFloat(values.valorDescuento),
      fechaInicio: values.fechaInicio,
      fechaFin: values.fechaFin || undefined,
      esAutomatica: values.esAutomatica,
    }
    crear.mutate(payload, {
      onSuccess: () => { setOpen(false); reset() },
    })
  }

  const columns: ColumnDef<Promocion>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.nombre}</p>
          <p className="text-xs text-muted-foreground">{row.original.tipoPromocion}</p>
        </div>
      ),
    },
    {
      accessorKey: 'valorDescuento',
      header: 'Descuento',
      cell: ({ row }) => {
        const tipo = row.original.tipoPromocion
        return tipo === 'DESCUENTO_PORCENTAJE'
          ? `${row.original.valorDescuento}%`
          : formatCurrency(row.original.valorDescuento)
      },
    },
    {
      accessorKey: 'fechaInicio',
      header: 'Vigencia',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {formatDate(row.original.fechaInicio)}
          {row.original.fechaFin && ` — ${formatDate(row.original.fechaFin)}`}
        </div>
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={row.original.activo
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-500'}
        >
          {row.original.activo ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      id: 'acciones',
      cell: ({ row }) =>
        row.original.activo ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDesactivarTarget(row.original)}
          >
            <ToggleLeft className="mr-1.5 h-4 w-4" />
            Desactivar
          </Button>
        ) : null,
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Promociones"
        description="Gestión de descuentos y ofertas especiales"
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyMessage="No hay promociones configuradas."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva promoción</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de promoción</Label>
              <Select onValueChange={(v) => setValue('tipoPromocion', v as TipoPromocion)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PROMO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoPromocion && <p className="text-sm text-destructive">{errors.tipoPromocion.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Ej: Descuento fin de semana" {...register('nombre')} />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={2} placeholder="Descripción opcional..." {...register('descripcion')} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor del descuento</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register('valorDescuento')} />
                {errors.valorDescuento && <p className="text-sm text-destructive">{errors.valorDescuento.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Fecha inicio</Label>
                <Input type="date" {...register('fechaInicio')} />
                {errors.fechaInicio && <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Fecha fin <span className="text-muted-foreground">(opcional)</span></Label>
                <Input type="date" {...register('fechaFin')} />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset() }}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={crear.isPending}>
              {crear.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                : <><Tag className="mr-2 h-4 w-4" /> Crear promoción</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!desactivarTarget}
        onOpenChange={(o) => !o && setDesactivarTarget(null)}
        title="¿Desactivar promoción?"
        description={`La promoción "${desactivarTarget?.nombre}" dejará de aplicarse en nuevas reservas.`}
        confirmLabel="Desactivar"
        destructive
        loading={desactivar.isPending}
        onConfirm={() => {
          if (desactivarTarget) {
            desactivar.mutate(desactivarTarget.id, { onSettled: () => setDesactivarTarget(null) })
          }
        }}
      />
    </div>
  )
}