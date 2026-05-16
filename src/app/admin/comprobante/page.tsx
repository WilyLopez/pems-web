'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Receipt,
  ExternalLink,
  XCircle,
  Loader2,
  FileCheck,
} from 'lucide-react'

import { TipoComprobante } from '@/types/enums'
import {
  comprobanteService,
  Comprobante,
  EmitirComprobantePayload,
} from '@/services/comprobante.service'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/common/Statusbadge'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
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
import { formatCurrency, formatDate } from '@/lib/utils'

const emitirSchema = z.object({
  idPago: z.string().min(1, 'Requerido'),
  tipoComprobante: z.nativeEnum(TipoComprobante),
  tipoDocReceptor: z.enum(['DNI', 'RUC', 'SIN_DOC']),
  nroDocReceptor: z.string().optional(),
  razonSocialReceptor: z.string().optional(),
  direccionReceptor: z.string().optional(),
})

type EmitirFormValues = z.infer<typeof emitirSchema>

const TIPOS_DOC = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'SIN_DOC', label: 'Sin documento' },
]

export default function ComprobantesPage() {
  const { idSede } = useAuth()
  const [emitido, setEmitido] = useState<Comprobante | null>(null)
  const [anularTarget, setAnularTarget] = useState<Comprobante | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmitirFormValues>({
    resolver: zodResolver(emitirSchema),
    defaultValues: { tipoDocReceptor: 'DNI' },
  })

  const tipoDoc = watch('tipoDocReceptor')
  const tipoComp = watch('tipoComprobante')

  const emitir = useMutation({
    mutationFn: (payload: EmitirComprobantePayload) =>
      comprobanteService.emitir(idSede ?? 1, payload),
    onSuccess: (comp) => {
      setEmitido(comp)
      reset()
      toast.success(`Comprobante ${comp.numeroCompleto} emitido correctamente.`)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo emitir el comprobante.')
    },
  })

  const anular = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      comprobanteService.anular(id, motivo),
    onSuccess: () => {
      setAnularTarget(null)
      setEmitido(null)
      toast.success('Comprobante anulado correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo anular el comprobante.')
    },
  })

  const onSubmit = (values: EmitirFormValues) => {
    emitir.mutate({
      idPago: parseInt(values.idPago),
      tipoComprobante: values.tipoComprobante,
      tipoDocReceptor: values.tipoDocReceptor,
      nroDocReceptor: values.nroDocReceptor,
      razonSocialReceptor: values.razonSocialReceptor,
      direccionReceptor: values.direccionReceptor,
    })
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Comprobantes' }]} />

      <PageHeader
        title="Comprobantes"
        description="Emisión y gestión de comprobantes electrónicos SUNAT"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emitir comprobante</CardTitle>
            <CardDescription>
              Genera una boleta o factura electrónica para un pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID del pago</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 42"
                    {...register('idPago')}
                  />
                  {errors.idPago && (
                    <p className="text-sm text-destructive">
                      {errors.idPago.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de comprobante</Label>
                  <Select
                    onValueChange={(v) =>
                      setValue('tipoComprobante', v as TipoComprobante)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TipoComprobante.BOLETA}>
                        Boleta de venta
                      </SelectItem>
                      <SelectItem value={TipoComprobante.FACTURA}>
                        Factura
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipoComprobante && (
                    <p className="text-sm text-destructive">
                      {errors.tipoComprobante.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de documento</Label>
                  <Select
                    defaultValue="DNI"
                    onValueChange={(v) =>
                      setValue(
                        'tipoDocReceptor',
                        v as EmitirFormValues['tipoDocReceptor']
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOC.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {tipoDoc !== 'SIN_DOC' && (
                  <div className="space-y-2">
                    <Label>N° de documento</Label>
                    <Input
                      placeholder={
                        tipoDoc === 'RUC' ? '20000000001' : '12345678'
                      }
                      {...register('nroDocReceptor')}
                    />
                  </div>
                )}

                {tipoComp === TipoComprobante.FACTURA && (
                  <>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Razón social</Label>
                      <Input
                        placeholder="Empresa S.A.C."
                        {...register('razonSocialReceptor')}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Dirección fiscal</Label>
                      <Input
                        placeholder="Av. Chiclayo 123"
                        {...register('direccionReceptor')}
                      />
                    </div>
                  </>
                )}
              </div>

              <Button
                type="submit"
                disabled={emitir.isPending}
                className="w-full"
              >
                {emitir.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Emitiendo...
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-4 w-4" /> Emitir comprobante
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {emitido && (
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base text-green-700">
                  Comprobante emitido
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Número</span>
                <span className="font-mono font-medium">
                  {emitido.numeroCompleto}
                </span>
                <span className="text-muted-foreground">Tipo</span>
                <span>{emitido.tipoComprobante}</span>
                <span className="text-muted-foreground">Estado SUNAT</span>
                <StatusBadge status={emitido.estadoComprobante} />
                <span className="text-muted-foreground">Monto total</span>
                <span className="font-semibold">
                  {formatCurrency(emitido.montoTotal)}
                </span>
                <span className="text-muted-foreground">Fecha emisión</span>
                <span>{formatDate(emitido.fechaEmision)}</span>
              </div>

              <div className="flex gap-2 pt-2">
                {emitido.pdfUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={emitido.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Ver PDF
                    </a>
                  </Button>
                )}
                {emitido.estadoComprobante === 'EMITIDO' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setAnularTarget(emitido)}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Anular
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!anularTarget}
        onOpenChange={(o) => !o && setAnularTarget(null)}
        title="¿Anular comprobante?"
        description={`Se anulará el comprobante ${anularTarget?.numeroCompleto}. Esta acción es irreversible y se enviará la anulación a SUNAT.`}
        confirmLabel="Sí, anular"
        destructive
        loading={anular.isPending}
        onConfirm={() => {
          if (anularTarget) {
            anular.mutate({
              id: anularTarget.id,
              motivo: 'Anulación solicitada por administrador',
            })
          }
        }}
      />
    </div>
  )
}
