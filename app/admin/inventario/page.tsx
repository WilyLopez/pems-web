'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { PackageOpen, ArrowUpCircle, ArrowDownCircle, SlidersHorizontal, AlertTriangle } from 'lucide-react'

import { AlertaStock, Producto } from '@/types/inventario.types'
import { TipoMovimiento } from '@/types/enums'
import { useAlertasStock, useMovimientoInventario } from '@/hooks/useInventario'
import { useAuth } from '@/hooks/useAuth'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatCurrency } from '@/lib/utils'

interface MovimientoForm {
  cantidad: string
  motivo: string
  tipo: 'entrada' | 'salida' | 'ajuste'
}

export default function InventarioPage() {
  const { idSede } = useAuth()
  const [movDialog, setMovDialog] = useState<{ open: boolean; idProducto: number | null }>({
    open: false, idProducto: null,
  })
  const [form, setForm] = useState<MovimientoForm>({ cantidad: '', motivo: '', tipo: 'entrada' })

  const { data: alertas, isLoading, isError, refetch } = useAlertasStock(idSede ?? 1)
  const movimiento = useMovimientoInventario()

  const alertaColumns: ColumnDef<AlertaStock>[] = [
    {
      accessorKey: 'nombre',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.nombre}</p>
          <p className="text-xs text-muted-foreground">{row.original.categoria}</p>
        </div>
      ),
    },
    {
      accessorKey: 'stockActual',
      header: 'Stock actual',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-red-600">{row.original.stockActual}</span>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
      ),
    },
    {
      accessorKey: 'stockMinimo',
      header: 'Stock mínimo',
    },
    {
      accessorKey: 'unidadesParaReponer',
      header: 'A reponer',
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          +{row.original.unidadesParaReponer}
        </Badge>
      ),
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setMovDialog({ open: true, idProducto: row.original.idProducto })
            setForm({ cantidad: '', motivo: '', tipo: 'entrada' })
          }}
        >
          <ArrowUpCircle className="mr-1.5 h-4 w-4 text-green-600" />
          Registrar entrada
        </Button>
      ),
    },
  ]

  const handleSubmitMovimiento = () => {
    if (!movDialog.idProducto || !form.cantidad || !form.motivo) return
    movimiento.mutate(
      {
        idProducto: movDialog.idProducto,
        tipo: form.tipo,
        payload: {
          tipoMovimiento: form.tipo.toUpperCase() as TipoMovimiento,
          cantidad: parseInt(form.cantidad),
          motivo: form.motivo,
        },
      },
      { onSettled: () => setMovDialog({ open: false, idProducto: null }) }
    )
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventario"
        description="Control de stock de productos del local"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{alertas?.length ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Productos bajo mínimo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alertas">
        <TabsList>
          <TabsTrigger value="alertas">
            Alertas de stock
            {(alertas?.length ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {alertas!.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="todos">Todos los productos</TabsTrigger>
        </TabsList>

        <TabsContent value="alertas" className="mt-4">
          <DataTable
            columns={alertaColumns}
            data={alertas ?? []}
            isLoading={isLoading}
            emptyMessage="No hay productos con stock bajo en este momento."
          />
        </TabsContent>

        <TabsContent value="todos" className="mt-4">
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border rounded-md">
            Listado completo de productos — próximamente
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={movDialog.open} onOpenChange={(o) => setMovDialog({ open: o, idProducto: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar movimiento de inventario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de movimiento</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as MovimientoForm['tipo'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">
                    <span className="flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-green-600" /> Entrada
                    </span>
                  </SelectItem>
                  <SelectItem value="salida">
                    <span className="flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-red-600" /> Salida
                    </span>
                  </SelectItem>
                  <SelectItem value="ajuste">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-blue-600" /> Ajuste
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min={1}
                placeholder="0"
                value={form.cantidad}
                onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                placeholder="Describe el motivo del movimiento..."
                rows={3}
                value={form.motivo}
                onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovDialog({ open: false, idProducto: null })}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitMovimiento} disabled={movimiento.isPending || !form.cantidad || !form.motivo}>
              {movimiento.isPending ? 'Guardando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}