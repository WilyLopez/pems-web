'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  ToggleLeft,
  Tag,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Sparkles,
  EyeOff,
  Filter,
  Image as ImageIcon,
  Globe,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'

import { TipoPromocion, TipoDia } from '@/types/enums'
import { Promocion, CrearPromocionPayload } from '@/services/promocion.service'
import {
  usePromociones,
  useCrearPromocion,
  useDesactivarPromocion,
  useEstadisticasPromocion,
} from '@/hooks/usePromocion'

import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEstadoVisual(
  p: Promocion
): 'ACTIVA' | 'PROXIMA' | 'POR_VENCER' | 'EXPIRADA' {
  if (!p.activo) return 'EXPIRADA'
  const ahora = new Date()
  const inicio = new Date(p.fechaInicio)
  if (inicio > ahora) return 'PROXIMA'
  if (p.fechaFin) {
    const fin = new Date(p.fechaFin)
    const diasRestantes = Math.ceil(
      (fin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (fin < ahora) return 'EXPIRADA'
    if (diasRestantes <= 3) return 'POR_VENCER'
  }
  return 'ACTIVA'
}

function diasRestantes(fechaFin?: string): number | null {
  if (!fechaFin) return null
  return Math.ceil(
    (new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
}

function formatDescuento(p: Promocion) {
  return p.tipoPromocion === 'DESCUENTO_PORCENTAJE'
    ? `${p.valorDescuento}%`
    : formatCurrency(p.valorDescuento)
}

const ESTADO_CONFIG = {
  ACTIVA: {
    label: 'Activa',
    cls: 'bg-green-100 text-green-800 border-green-200',
  },
  PROXIMA: {
    label: 'Programada',
    cls: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  POR_VENCER: {
    label: 'Por vencer',
    cls: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  EXPIRADA: {
    label: 'Inactiva',
    cls: 'bg-gray-100 text-gray-500 border-gray-200',
  },
}

const TIPO_LABEL: Record<string, string> = {
  DESCUENTO_PORCENTAJE: 'Descuento %',
  DESCUENTO_MONTO_FIJO: 'Monto fijo',
  PAQUETE_GRUPAL: 'Paquete grupal',
  ENTRADA_GRATUITA: 'Entrada gratuita',
  CLIENTE_FRECUENTE: 'Cliente frecuente',
}

const TIPOS_PROMO = Object.entries(TIPO_LABEL).map(([value, label]) => ({
  value,
  label,
}))

const ZONAS = [
  { key: 'mostrarEnInicio', label: 'Inicio' },
  { key: 'mostrarEnCarrusel', label: 'Carrusel principal' },
  { key: 'mostrarEnPaginaPromociones', label: 'Página de promociones' },
  { key: 'mostrarEnCheckout', label: 'Proceso de compra' },
  { key: 'mostrarDestacado', label: 'Sección destacada' },
  { key: 'soloMovil', label: 'Solo móvil' },
] as const

// ── Schema ────────────────────────────────────────────────────────────────────

const promoSchema = z.object({
  tipoPromocion: z.nativeEnum(TipoPromocion),
  nombre: z.string().min(2).max(150),
  descripcion: z.string().optional(),
  valorDescuento: z.string().min(1),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().optional(),
  esAutomatica: z.boolean(),
  soloTipoDia: z.nativeEnum(TipoDia).optional(),
  imagenUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  colorDestacado: z.string().optional(),
  prioridad: z.string().optional(),
  textoPublicitario: z.string().max(120).optional(),
  textoBoton: z.string().max(40).optional(),
  urlBoton: z.string().optional(),
  mostrarEnInicio: z.boolean(),
  mostrarEnCarrusel: z.boolean(),
  mostrarEnPaginaPromociones: z.boolean(),
  mostrarEnCheckout: z.boolean(),
  mostrarDestacado: z.boolean(),
  soloMovil: z.boolean(),
  limiteUsos: z.string().optional(),
  limitePorCliente: z.string().optional(),
  minimoAsistentes: z.string().optional(),
  montoMinimo: z.string().optional(),
})

type PromoFormValues = z.infer<typeof promoSchema>

const DEFAULT_VALUES: PromoFormValues = {
  tipoPromocion: TipoPromocion.DESCUENTO_PORCENTAJE,
  nombre: '',
  descripcion: '',
  valorDescuento: '',
  fechaInicio: '',
  fechaFin: '',
  esAutomatica: true,
  soloTipoDia: undefined,
  imagenUrl: '',
  bannerUrl: '',
  colorDestacado: '#00AEEF',
  prioridad: '5',
  textoPublicitario: '',
  textoBoton: 'Reservar ahora',
  urlBoton: '/zona-de-juegos',
  mostrarEnInicio: false,
  mostrarEnCarrusel: false,
  mostrarEnPaginaPromociones: true,
  mostrarEnCheckout: false,
  mostrarDestacado: false,
  soloMovil: false,
  limiteUsos: '',
  limitePorCliente: '',
  minimoAsistentes: '',
  montoMinimo: '',
}

// ── Tarjeta de promoción ──────────────────────────────────────────────────────

function PromocionCard({
  promo,
  onDesactivar,
}: {
  promo: Promocion
  onDesactivar: (p: Promocion) => void
}) {
  const estado = getEstadoVisual(promo)
  const dias = diasRestantes(promo.fechaFin)
  const cfg = ESTADO_CONFIG[estado]

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white overflow-hidden hover:shadow-md transition-shadow',
        estado === 'EXPIRADA' && 'opacity-60'
      )}
    >
      <div
        className="h-2 w-full"
        style={{ backgroundColor: promo.colorDestacado ?? '#00AEEF' }}
      />

      {promo.imagenUrl && (
        <div className="relative h-32 overflow-hidden bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.imagenUrl}
            alt={promo.nombre}
            className="w-full h-full object-cover"
          />
          {promo.mostrarDestacado && (
            <div className="absolute top-2 right-2 bg-amber-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Destacada
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">
              {promo.nombre}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {TIPO_LABEL[promo.tipoPromocion] ?? promo.tipoPromocion}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn('text-[11px] shrink-0 border', cfg.cls)}
          >
            {cfg.label}
          </Badge>
        </div>

        <div
          className="text-2xl font-black"
          style={{ color: promo.colorDestacado ?? '#00AEEF' }}
        >
          {formatDescuento(promo)} OFF
        </div>

        {promo.textoPublicitario && (
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
            {promo.textoPublicitario}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(promo.fechaInicio)}
          {promo.fechaFin && ` — ${formatDate(promo.fechaFin)}`}
        </div>

        {estado === 'POR_VENCER' && dias !== null && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Finaliza en {dias} día{dias !== 1 ? 's' : ''}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {promo.mostrarEnInicio && (
            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              Inicio
            </span>
          )}
          {promo.mostrarEnCarrusel && (
            <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
              Carrusel
            </span>
          )}
          {promo.mostrarEnCheckout && (
            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
              Checkout
            </span>
          )}
          {promo.mostrarEnPaginaPromociones && (
            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">
              Web pública
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
          {[
            { val: promo.vecesUsado ?? 0, label: 'Usos' },
            { val: promo.clientesAtraidos ?? 0, label: 'Clientes' },
            { val: formatCurrency(promo.montoAhorrado ?? 0), label: 'Desc.' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-bold text-gray-900">{val}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {promo.activo && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 text-xs"
            onClick={() => onDesactivar(promo)}
          >
            <ToggleLeft className="mr-1.5 h-3.5 w-3.5" /> Desactivar
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Stats row ─────────────────────────────────────────────────────────────────

function StatsRow({ promociones }: { promociones: Promocion[] }) {
  const activas = promociones.filter(
    (p) => getEstadoVisual(p) === 'ACTIVA'
  ).length
  const porVencer = promociones.filter(
    (p) => getEstadoVisual(p) === 'POR_VENCER'
  ).length
  const programadas = promociones.filter(
    (p) => getEstadoVisual(p) === 'PROXIMA'
  ).length
  const inactivas = promociones.filter((p) => !p.activo).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        {
          label: 'Activas',
          value: activas,
          icon: CheckCircle2,
          color: 'text-green-600 bg-green-50',
        },
        {
          label: 'Por vencer',
          value: porVencer,
          icon: AlertTriangle,
          color: 'text-amber-600 bg-amber-50',
        },
        {
          label: 'Programadas',
          value: programadas,
          icon: Clock,
          color: 'text-blue-600 bg-blue-50',
        },
        {
          label: 'Inactivas',
          value: inactivas,
          icon: EyeOff,
          color: 'text-gray-500 bg-gray-50',
        },
      ].map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                color
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Tab estadísticas ──────────────────────────────────────────────────────────

function TabEstadisticas({ promociones }: { promociones: Promocion[] }) {
  const { data: stats } = useEstadisticasPromocion()

  const totalUsos =
    stats?.totalClientesAlcanzados ??
    promociones.reduce((s, p) => s + (p.vecesUsado ?? 0), 0)
  const totalDescuento =
    stats?.totalDescuentoOtorgado ??
    promociones.reduce((s, p) => s + (p.montoAhorrado ?? 0), 0)
  const totalClientes =
    stats?.totalClientesAlcanzados ??
    promociones.reduce((s, p) => s + (p.clientesAtraidos ?? 0), 0)

  const top = [...promociones]
    .sort((a, b) => (b.vecesUsado ?? 0) - (a.vecesUsado ?? 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total de usos',
            value: totalUsos,
            icon: TrendingUp,
            color: '#00AEEF',
          },
          {
            label: 'Clientes alcanzados',
            value: totalClientes,
            icon: Users,
            color: '#F64B8A',
          },
          {
            label: 'Descuento otorgado',
            value: formatCurrency(totalDescuento),
            icon: DollarSign,
            color: '#F59E0B',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-azul" />
            Promociones con mejor rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sin datos de uso aún.
            </p>
          ) : (
            <div className="space-y-3">
              {top.map((p, i) => {
                const maxUsos = top[0].vecesUsado ?? 1
                const pct =
                  maxUsos > 0 ? ((p.vecesUsado ?? 0) / maxUsos) * 100 : 0
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium truncate">
                          {p.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground shrink-0 ml-2">
                          {p.vecesUsado ?? 0} usos
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: p.colorDestacado ?? '#00AEEF',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Dialog crear ──────────────────────────────────────────────────────────────

function CrearPromocionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const crear = useCrearPromocion()
  const [dialogTab, setDialogTab] = useState('basico')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const zonaValues = ZONAS.map(
    (z) => watch(z.key as keyof PromoFormValues) as boolean
  )

  const onSubmit = (values: PromoFormValues) => {
    const payload: CrearPromocionPayload = {
      tipoPromocion: values.tipoPromocion,
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      valorDescuento: parseFloat(values.valorDescuento),
      fechaInicio: values.fechaInicio,
      fechaFin: values.fechaFin || undefined,
      esAutomatica: values.esAutomatica,
      soloTipoDia: values.soloTipoDia,
      imagenUrl: values.imagenUrl || undefined,
      bannerUrl: values.bannerUrl || undefined,
      colorDestacado: values.colorDestacado,
      prioridad: values.prioridad ? parseInt(values.prioridad) : 5,
      textoPublicitario: values.textoPublicitario || undefined,
      textoBoton: values.textoBoton || undefined,
      urlBoton: values.urlBoton || undefined,
      mostrarEnInicio: values.mostrarEnInicio,
      mostrarEnCarrusel: values.mostrarEnCarrusel,
      mostrarEnPaginaPromociones: values.mostrarEnPaginaPromociones,
      mostrarEnCheckout: values.mostrarEnCheckout,
      mostrarDestacado: values.mostrarDestacado,
      soloMovil: values.soloMovil,
      limiteUsos: values.limiteUsos ? parseInt(values.limiteUsos) : undefined,
      limitePorCliente: values.limitePorCliente
        ? parseInt(values.limitePorCliente)
        : undefined,
      minimoAsistentes: values.minimoAsistentes
        ? parseInt(values.minimoAsistentes)
        : undefined,
      montoMinimo: values.montoMinimo
        ? parseFloat(values.montoMinimo)
        : undefined,
    }
    crear.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false)
        reset()
        setDialogTab('basico')
      },
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
    setDialogTab('basico')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-azul" /> Nueva promoción
          </DialogTitle>
        </DialogHeader>

        <Tabs value={dialogTab} onValueChange={setDialogTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basico">Información</TabsTrigger>
            <TabsTrigger value="visual">Web &amp; Visual</TabsTrigger>
            <TabsTrigger value="condiciones">Condiciones</TabsTrigger>
          </TabsList>

          {/* Información básica */}
          <TabsContent value="basico" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Tipo de promoción</Label>
              <Select
                onValueChange={(v) =>
                  setValue('tipoPromocion', v as TipoPromocion)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PROMO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoPromocion && (
                <p className="text-xs text-destructive">
                  {errors.tipoPromocion.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Martes Familiar 2x1"
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                rows={2}
                placeholder="Descripción breve..."
                {...register('descripcion')}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor del descuento</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('valorDescuento')}
                />
                {errors.valorDescuento && (
                  <p className="text-xs text-destructive">
                    {errors.valorDescuento.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Aplica en</Label>
                <Select
                  onValueChange={(v) => setValue('soloTipoDia', v as TipoDia)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los días" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TipoDia.SEMANA}>
                      Solo días de semana
                    </SelectItem>
                    <SelectItem value={TipoDia.FIN_SEMANA_FERIADO}>
                      Fin de semana y feriados
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha inicio</Label>
                <Input type="date" {...register('fechaInicio')} />
                {errors.fechaInicio && (
                  <p className="text-xs text-destructive">
                    {errors.fechaInicio.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Fecha fin{' '}
                  <span className="text-muted-foreground text-xs">
                    (opcional)
                  </span>
                </Label>
                <Input type="date" {...register('fechaFin')} />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-brand-azul"
                {...register('esAutomatica')}
              />
              <span className="text-sm font-medium">
                Aplicar automáticamente al reservar
              </span>
            </label>
          </TabsContent>

          {/* Web & Visual */}
          <TabsContent value="visual" className="space-y-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> URL imagen tarjeta
                </Label>
                <Input placeholder="https://..." {...register('imagenUrl')} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> URL banner principal
                </Label>
                <Input placeholder="https://..." {...register('bannerUrl')} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Color destacado</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    {...register('colorDestacado')}
                    className="h-9 w-12 rounded border p-1 cursor-pointer"
                  />
                  <Input
                    placeholder="#00AEEF"
                    {...register('colorDestacado')}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Prioridad (1–10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  {...register('prioridad')}
                />
              </div>
              <div className="space-y-2">
                <Label>URL botón de acción</Label>
                <Input
                  placeholder="/zona-de-juegos"
                  {...register('urlBoton')}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Texto publicitario</Label>
                <Textarea
                  rows={2}
                  placeholder="¡Oferta especial solo por hoy!"
                  {...register('textoPublicitario')}
                />
              </div>
              <div className="space-y-2">
                <Label>Texto del botón CTA</Label>
                <Input
                  placeholder="Reservar ahora"
                  {...register('textoBoton')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Mostrar en la web
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {ZONAS.map((zona, idx) => (
                  <label
                    key={zona.key}
                    className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-brand-azul"
                      checked={!!zonaValues[idx]}
                      onChange={(e) =>
                        setValue(
                          zona.key as keyof PromoFormValues,
                          e.target.checked
                        )
                      }
                    />
                    <span className="text-sm">{zona.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Condiciones */}
          <TabsContent value="condiciones" className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Deja en blanco los límites que no apliquen.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Límite total de usos</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Sin límite"
                  {...register('limiteUsos')}
                />
              </div>
              <div className="space-y-2">
                <Label>Límite por cliente</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Sin límite"
                  {...register('limitePorCliente')}
                />
              </div>
              <div className="space-y-2">
                <Label>Mínimo de asistentes</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Sin mínimo"
                  {...register('minimoAsistentes')}
                />
              </div>
              <div className="space-y-2">
                <Label>Monto mínimo de compra (S/)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="Sin mínimo"
                  {...register('montoMinimo')}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={crear.isPending}>
            {crear.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Tag className="mr-2 h-4 w-4" /> Crear promoción
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

type Filtro = 'todas' | 'activas' | 'inactivas'

export default function PromocionesPage() {
  const [openDialog, setOpenDialog] = useState(false)
  const [desactivarTarget, setDesactivarTarget] = useState<Promocion | null>(
    null
  )
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const { data, isLoading, isError, refetch } = usePromociones()
  const desactivar = useDesactivarPromocion()

  const promociones = data ?? []

  const filtradas = useMemo(() => {
    if (filtro === 'activas') return promociones.filter((p) => p.activo)
    if (filtro === 'inactivas') return promociones.filter((p) => !p.activo)
    return promociones
  }, [promociones, filtro])

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Promociones' }]} />

      <PageHeader
        title="Promociones"
        description="Centro de marketing y gestión comercial"
        actions={
          <Button size="sm" onClick={() => setOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva promoción
          </Button>
        }
      />

      <Tabs defaultValue="promociones">
        <TabsList>
          <TabsTrigger value="promociones" className="gap-1.5">
            <Tag className="h-4 w-4" /> Promociones
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promociones" className="space-y-5 pt-2">
          {!isLoading && <StatsRow promociones={promociones} />}

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(['todas', 'activas', 'inactivas'] as Filtro[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize',
                  filtro === f
                    ? 'bg-brand-azul text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Tag className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">
                No hay promociones{' '}
                {filtro !== 'todas' ? filtro : 'configuradas'}.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setOpenDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Crear primera promoción
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtradas
                .sort((a, b) => (b.prioridad ?? 5) - (a.prioridad ?? 5))
                .map((p) => (
                  <PromocionCard
                    key={p.id}
                    promo={p}
                    onDesactivar={setDesactivarTarget}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="estadisticas" className="pt-2">
          <TabEstadisticas promociones={promociones} />
        </TabsContent>
      </Tabs>

      <CrearPromocionDialog open={openDialog} onOpenChange={setOpenDialog} />

      <ConfirmDialog
        open={!!desactivarTarget}
        onOpenChange={(o) => !o && setDesactivarTarget(null)}
        title="¿Desactivar promoción?"
        description={`La promoción "${desactivarTarget?.nombre}" dejará de aplicarse y de mostrarse en la web.`}
        confirmLabel="Desactivar"
        destructive
        loading={desactivar.isPending}
        onConfirm={() => {
          if (desactivarTarget) {
            desactivar.mutate(desactivarTarget.id, {
              onSettled: () => setDesactivarTarget(null),
            })
          }
        }}
      />
    </div>
  )
}
