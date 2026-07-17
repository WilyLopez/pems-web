import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { TarifaFormValues, tarifaSchema } from '../schemas/tarifa.schema'
import { DuracionField } from './DuracionField'

interface TarifaCardProps {
  titulo: string
  subtitulo: string
  precioActual?: number
  duracionActual?: number
  onPrecioChange: (precio: number) => void
  onDuracionChange: (duracionMinutos: number | undefined) => void
  onGuardar: (precio: number, duracionMinutos?: number) => void
  isLoading: boolean
}

export function TarifaCard({
  titulo,
  subtitulo,
  precioActual,
  duracionActual,
  onPrecioChange,
  onDuracionChange,
  onGuardar,
  isLoading,
}: TarifaCardProps) {
  const form = useForm<TarifaFormValues>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: {
      precio: precioActual ?? 0,
      duracionMinutos: duracionActual ?? undefined,
    },
  })

  const precioWatch = form.watch('precio')
  const duracionWatch = form.watch('duracionMinutos')

  useEffect(() => {
    if (precioWatch > 0) onPrecioChange(precioWatch)
  }, [precioWatch, onPrecioChange])

  useEffect(() => {
    onDuracionChange(duracionWatch)
  }, [duracionWatch, onDuracionChange])

  useEffect(() => {
    if (precioActual !== undefined)
      form.reset({
        precio: precioActual,
        duracionMinutos: duracionActual ?? undefined,
      })
  }, [precioActual, duracionActual, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{subtitulo}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label>Precio por niño</Label>
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
            onClick={form.handleSubmit(({ precio, duracionMinutos }) =>
              onGuardar(precio, duracionMinutos)
            )}
            disabled={isLoading || !form.formState.isDirty}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
        <Controller
          control={form.control}
          name="duracionMinutos"
          render={({ field, fieldState }) => (
            <DuracionField
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        {precioActual !== undefined && (
          <p className="text-xs text-muted-foreground">
            Precio actual: S/ {precioActual.toFixed(2)}
          </p>
        )}
        {precioActual === undefined && (
          <p className="text-xs text-amber-600">
            Sin tarifa configurada — ingresa un precio y guarda para activarla.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
