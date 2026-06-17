'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useTarifasActivas, useConfigurarTarifa } from '@/hooks/useTarifas'
import { PageHeader } from '@/components/common/PageHeader'
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
import { Skeleton } from '@/components/ui/Skeleton'

const tarifaSchema = z.object({
  precio: z.coerce
    .number({ error: 'Ingresa un precio valido' })
    .min(0.01, 'El precio debe ser mayor a S/ 0.00')
    .max(999.99, 'El precio no puede exceder S/ 999.99'),
})

type TarifaForm = z.infer<typeof tarifaSchema>

interface TarifaCardProps {
  titulo: string
  subtitulo: string
  precioActual?: number
  onPrecioChange: (precio: number) => void
  onGuardar: (precio: number) => void
  isLoading: boolean
}

function TarifaCard({
  titulo,
  subtitulo,
  precioActual,
  onPrecioChange,
  onGuardar,
  isLoading,
}: TarifaCardProps) {
  const form = useForm<TarifaForm>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: { precio: precioActual ?? 0 },
  })

  const precioWatch = form.watch('precio')

  useEffect(() => {
    if (precioWatch > 0) onPrecioChange(precioWatch)
  }, [precioWatch])

  useEffect(() => {
    if (precioActual !== undefined) form.reset({ precio: precioActual })
  }, [precioActual])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{subtitulo}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label>Precio por nino</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                S/
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="999.99"
                className="pl-9"
                {...form.register('precio', { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.precio && (
              <p className="text-xs text-destructive">
                {form.formState.errors.precio.message}
              </p>
            )}
          </div>
          <Button
            onClick={form.handleSubmit(({ precio }) => onGuardar(precio))}
            disabled={isLoading || !form.formState.isDirty}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
        {precioActual !== undefined && (
          <p className="text-xs text-muted-foreground mt-2">
            Precio actual: S/ {precioActual.toFixed(2)}
          </p>
        )}
        {precioActual === undefined && (
          <p className="text-xs text-amber-600 mt-2">
            Sin tarifa configurada — ingresa un precio y guarda para activarla.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface VistaPreviaProps {
  precioSemana: number | null
  precioFinDeSemana: number | null
}

function VistaPrevia({ precioSemana, precioFinDeSemana }: VistaPreviaProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Vista previa</CardTitle>
        <CardDescription>Asi se veran los precios en la web publica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b">
          <div>
            <p className="font-semibold text-sm">Lunes a Viernes</p>
            <p className="text-xs text-muted-foreground">Tarifa regular</p>
          </div>
          <span className="text-2xl font-black text-brand-azul">
            {precioSemana ? `S/ ${precioSemana.toFixed(2)}` : 'Sin configurar'}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 border-b">
          <div>
            <p className="font-semibold text-sm">Sabados, Domingos y Feriados</p>
            <p className="text-xs text-muted-foreground">Tarifa alta</p>
          </div>
          <span className="text-2xl font-black text-brand-rosa">
            {precioFinDeSemana ? `S/ ${precioFinDeSemana.toFixed(2)}` : 'Sin configurar'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Precio por nino. Incluye acceso total a la zona de juegos.
        </p>
      </CardContent>
    </Card>
  )
}

export default function TarifasPage() {
  const { idSede } = useAuth()
  const { data: tarifas, isLoading } = useTarifasActivas(idSede)
  const configurar = useConfigurarTarifa(idSede)

  const tarifaSemana = tarifas?.find((t) => t.tipoDia === 'SEMANA')
  const tarifaFds = tarifas?.find((t) => t.tipoDia === 'FIN_SEMANA_FERIADO')

  const [precioSemanaLocal, setPrecioSemanaLocal] = useState<number | null>(null)
  const [precioFdsLocal, setPrecioFdsLocal] = useState<number | null>(null)

  useEffect(() => {
    if (tarifaSemana) setPrecioSemanaLocal(Number(tarifaSemana.precio))
  }, [tarifaSemana])

  useEffect(() => {
    if (tarifaFds) setPrecioFdsLocal(Number(tarifaFds.precio))
  }, [tarifaFds])

  const hoy = format(new Date(), 'yyyy-MM-dd')

  const handleGuardar = (tipoDiaCodigo: string, precio: number) => {
    configurar.mutate({ tipoDia: tipoDiaCodigo, precio, vigenciaDesde: hoy })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurar Tarifas"
        description="Establece los precios de entrada a la zona de juegos para la sede actual."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <TarifaCard
              titulo="Entre semana"
              subtitulo="Lunes a Viernes"
              precioActual={tarifaSemana ? Number(tarifaSemana.precio) : undefined}
              onPrecioChange={setPrecioSemanaLocal}
              onGuardar={(precio) => handleGuardar('SEMANA', precio)}
              isLoading={configurar.isPending}
            />
            <TarifaCard
              titulo="Fines de semana y feriados"
              subtitulo="Sabados, Domingos y Feriados"
              precioActual={tarifaFds ? Number(tarifaFds.precio) : undefined}
              onPrecioChange={setPrecioFdsLocal}
              onGuardar={(precio) => handleGuardar('FIN_SEMANA_FERIADO', precio)}
              isLoading={configurar.isPending}
            />
          </div>
          <VistaPrevia
            precioSemana={precioSemanaLocal}
            precioFinDeSemana={precioFdsLocal}
          />
        </div>
      )}
    </div>
  )
}
