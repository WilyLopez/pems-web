import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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

interface TarifaCardProps {
  titulo: string
  subtitulo: string
  precioActual?: number
  onPrecioChange: (precio: number) => void
  onGuardar: (precio: number) => void
  isLoading: boolean
}

export function TarifaCard({
  titulo,
  subtitulo,
  precioActual,
  onPrecioChange,
  onGuardar,
  isLoading,
}: TarifaCardProps) {
  const form = useForm<TarifaFormValues>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: { precio: precioActual ?? 0 },
  })

  const precioWatch = form.watch('precio')

  useEffect(() => {
    if (precioWatch > 0) onPrecioChange(precioWatch)
  }, [precioWatch, onPrecioChange])

  useEffect(() => {
    if (precioActual !== undefined) form.reset({ precio: precioActual })
  }, [precioActual, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{subtitulo}</CardDescription>
      </CardHeader>
      <CardContent>
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
