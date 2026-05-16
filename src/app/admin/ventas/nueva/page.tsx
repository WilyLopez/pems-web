'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Loader2,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart.store'
import { ventaService } from '@/services/venta.service'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

const PRODUCTOS_DEMO = [
  { idProducto: 1, nombre: 'Gaseosa 500ml', precio: 3.5 },
  { idProducto: 2, nombre: 'Agua mineral', precio: 2.0 },
  { idProducto: 3, nombre: 'Popcorn grande', precio: 5.0 },
  { idProducto: 4, nombre: 'Torta personal', precio: 15.0 },
  { idProducto: 5, nombre: 'Globo decorativo', precio: 8.0 },
]

export default function NuevaVentaPage() {
  const { idSede } = useAuth()
  const { items, addItem, removeItem, updateCantidad, clear, subtotal } =
    useCartStore()
  const [idReserva, setIdReserva] = useState('')
  const [descuento, setDescuento] = useState('0')

  const totalFinal = Math.max(0, subtotal() - parseFloat(descuento || '0'))

  const procesar = useMutation({
    mutationFn: () =>
      ventaService.procesar(idSede ?? 1, {
        idReservaPublica: idReserva ? parseInt(idReserva) : undefined,
        lineas: items.map((i) => ({
          idProducto: i.idProducto,
          cantidad: i.cantidad,
        })),
        descuento: parseFloat(descuento || '0'),
      }),
    onSuccess: (v) => {
      toast.success(
        `Venta #${v.id} procesada. Total: ${formatCurrency(v.total)}`
      )
      clear()
      setIdReserva('')
      setDescuento('0')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo procesar la venta.')
    },
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Nueva venta"
        description="Registra una venta de productos en el local"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Productos disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRODUCTOS_DEMO.map((p) => (
                  <button
                    key={p.idProducto}
                    onClick={() => addItem(p)}
                    className="flex items-center justify-between rounded-lg border p-3 text-left hover:border-primary/50 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(p.precio)}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Vincular a reserva{' '}
                <span className="text-muted-foreground font-normal text-xs">
                  (opcional)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 max-w-xs">
                <Input
                  type="number"
                  placeholder="ID de reserva"
                  value={idReserva}
                  onChange={(e) => setIdReserva(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit sticky top-20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carrito
              {items.length > 0 && (
                <Badge className="ml-auto">{items.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">
                Agrega productos desde el catálogo
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.idProducto}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="flex-1 truncate">{item.nombre}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateCantidad(item.idProducto, item.cantidad - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-medium">
                        {item.cantidad}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateCantidad(item.idProducto, item.cantidad + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="w-16 text-right font-medium">
                      {formatCurrency(item.precio * item.cantidad)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.idProducto)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal())}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Descuento (S/)</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  className="w-24 h-7 text-right text-sm"
                />
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(totalFinal)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={items.length === 0 || procesar.isPending}
              onClick={() => procesar.mutate()}
            >
              {procesar.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                  Procesando...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" /> Procesar venta
                </>
              )}
            </Button>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={clear}
              >
                Limpiar carrito
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
