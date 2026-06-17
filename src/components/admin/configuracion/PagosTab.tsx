'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { CreditCard, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useActualizarConfiguracion } from '@/hooks/useConfiguracion'
import { ConfiguracionSistema } from '@/types/configuracion.types'

const PROVEEDORES = ['NUBEFACT', 'SUNAT_DIRECTA', 'EFACT'] as const

const schema = z.object({
  SUNAT_PROVEEDOR: z.enum(PROVEEDORES),
})

type FormValues = z.infer<typeof schema>

function toMap(configs: ConfiguracionSistema[]): Record<string, string> {
  return Object.fromEntries(configs.map((c) => [c.clave, c.valor]))
}

export function PagosTab({ configs }: { configs: ConfiguracionSistema[] }) {
  const actualizar = useActualizarConfiguracion()
  const map = toMap(configs)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      SUNAT_PROVEEDOR:
        (map.SUNAT_PROVEEDOR as (typeof PROVEEDORES)[number]) ?? 'NUBEFACT',
    },
  })

  useEffect(() => {
    const m = toMap(configs)
    reset({
      SUNAT_PROVEEDOR:
        (m.SUNAT_PROVEEDOR as (typeof PROVEEDORES)[number]) ?? 'NUBEFACT',
    })
  }, [configs, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({ SUNAT_PROVEEDOR: values.SUNAT_PROVEEDOR })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
          <CreditCard className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            Pagos y facturación electrónica
          </h3>
          <p className="text-xs text-muted-foreground">
            Proveedor de servicios electrónicos SUNAT
          </p>
        </div>
      </div>

      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="SUNAT_PROVEEDOR">
          Proveedor de servicios electrónicos
        </Label>
        <Controller
          control={control}
          name="SUNAT_PROVEEDOR"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="SUNAT_PROVEEDOR">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NUBEFACT">Nubefact</SelectItem>
                <SelectItem value="SUNAT_DIRECTA">
                  SUNAT Directa (OSE)
                </SelectItem>
                <SelectItem value="EFACT">eFact</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Plataforma utilizada para la emisión de comprobantes electrónicos ante
          SUNAT.
        </p>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={actualizar.isPending || !isDirty}
          size="sm"
        >
          {actualizar.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
