'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Loader2 } from 'lucide-react'

import { MedioPago, TipoPago } from '@/types/enums'
import { useRegistrarPagoReserva, useRegistrarAdelanto } from '@/hooks/usePagos'
import { useAuth } from '@/hooks/useAuth'

import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Separator } from '@/components/ui/Separator'

const pagoSchema = z.object({
  medioPago: z.nativeEnum(MedioPago),
  monto: z
    .string()
    .min(1)
    .refine((v) => parseFloat(v) > 0, 'Debe ser mayor a 0'),
  referenciaPago: z.string().optional(),
  contextoId: z.string().min(1, 'Requerido'),
})

type PagoFormValues = z.infer<typeof pagoSchema>

const MEDIOS = [
  { value: MedioPago.YAPE, label: 'Yape' },
  { value: MedioPago.EFECTIVO, label: 'Efectivo' },
  { value: MedioPago.TRANSFERENCIA, label: 'Transferencia bancaria' },
  { value: MedioPago.TARJETA, label: 'Tarjeta' },
]

function PagoForm({
  tipo,
  onSubmit,
  isPending,
}: {
  tipo: 'reserva' | 'adelanto'
  onSubmit: (values: PagoFormValues) => void
  isPending: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
  })

  const medioPago = watch('medioPago')
  const requiereReferencia = [MedioPago.YAPE, MedioPago.TRANSFERENCIA].includes(
    medioPago
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            {tipo === 'reserva' ? 'ID de reserva' : 'ID de evento privado'}
          </Label>
          <Input
            type="number"
            placeholder="Ej: 12"
            {...register('contextoId')}
          />
          {errors.contextoId && (
            <p className="text-sm text-destructive">
              {errors.contextoId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Monto (S/)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('monto')}
          />
          {errors.monto && (
            <p className="text-sm text-destructive">{errors.monto.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Medio de pago</Label>
          <Select onValueChange={(v) => setValue('medioPago', v as MedioPago)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {MEDIOS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.medioPago && (
            <p className="text-sm text-destructive">
              {errors.medioPago.message}
            </p>
          )}
        </div>

        {requiereReferencia && (
          <div className="space-y-2">
            <Label>N° de operación / referencia</Label>
            <Input
              placeholder="Ej: 123456789"
              {...register('referenciaPago')}
            />
          </div>
        )}
      </div>

      <Separator />

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" /> Registrar pago
          </>
        )}
      </Button>
    </form>
  )
}

export default function PagosPage() {
  const pagoReserva = useRegistrarPagoReserva()
  const adelanto = useRegistrarAdelanto()

  const handleReserva = (values: PagoFormValues) => {
    pagoReserva.mutate({
      medioPago: values.medioPago,
      tipoPago: TipoPago.UNICO,
      idReservaPublica: parseInt(values.contextoId),
      monto: parseFloat(values.monto),
      referenciaPago: values.referenciaPago,
    })
  }

  const handleAdelanto = (values: PagoFormValues) => {
    adelanto.mutate({
      medioPago: values.medioPago,
      tipoPago: TipoPago.ADELANTO,
      idEventoPrivado: parseInt(values.contextoId),
      monto: parseFloat(values.monto),
      referenciaPago: values.referenciaPago,
    })
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Pagos' }]} />

      <PageHeader
        title="Pagos"
        description="Registro de pagos de reservas y eventos privados"
      />

      <Tabs defaultValue="reserva">
        <TabsList>
          <TabsTrigger value="reserva">Pago de reserva</TabsTrigger>
          <TabsTrigger value="adelanto">Adelanto de evento</TabsTrigger>
        </TabsList>

        <TabsContent value="reserva" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pago de reserva pública
              </CardTitle>
              <CardDescription>
                Registra el pago único de una reserva de acceso al local
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PagoForm
                tipo="reserva"
                onSubmit={handleReserva}
                isPending={pagoReserva.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adelanto" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Adelanto de evento privado
              </CardTitle>
              <CardDescription>
                Registra el adelanto o pago parcial de un evento privado
                confirmado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PagoForm
                tipo="adelanto"
                onSubmit={handleAdelanto}
                isPending={adelanto.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
