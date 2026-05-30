'use client'

import { useState } from 'react'
import {
  Clock,
  CalendarCheck,
  CalendarRange,
  ShieldAlert,
  CreditCard,
  Building2,
  BookOpen,
  Eye,
  Pencil,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useConfiguracion, useSede } from '@/hooks/useConfiguracion'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { OperacionTab }  from '@/components/admin/configuracion/OperacionTab'
import { ReservasTab }   from '@/components/admin/configuracion/ReservasTab'
import { EventosTab }    from '@/components/admin/configuracion/EventosTab'
import { SeguridadTab }  from '@/components/admin/configuracion/SeguridadTab'
import { PagosTab }      from '@/components/admin/configuracion/PagosTab'
import { SedeTab }       from '@/components/admin/configuracion/SedeTab'
import { CatalogosTab }  from '@/components/admin/configuracion/CatalogosTab'
import { SistemaCard }   from '@/components/admin/configuracion/SistemaCard'
import { ConfiguracionSistema } from '@/types/configuracion.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toMap(configs: ConfiguracionSistema[]): Record<string, string> {
  return Object.fromEntries(configs.map((c) => [c.clave, c.valor]))
}

// ── Base card ─────────────────────────────────────────────────────────────────

interface SummaryItem { label: string; value: string }

interface ModuleCardProps {
  icon:        React.ElementType
  color:       string
  title:       string
  description: string
  summary?:    SummaryItem[]
  editSize?:   'sm:max-w-md' | 'sm:max-w-lg' | 'sm:max-w-xl'
  viewContent: React.ReactNode
  editContent: React.ReactNode
}

function ModuleCard({
  icon: Icon, color, title, description, summary,
  editSize = 'sm:max-w-lg', viewContent, editContent,
}: ModuleCardProps) {
  const [modal, setModal] = useState<'view' | 'edit' | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>

      {summary && summary.length > 0 && (
        <ul className="space-y-1.5 border-t border-gray-50 pt-3">
          {summary.map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500 truncate">{label}</span>
              <span className="text-xs font-semibold text-gray-800 shrink-0">{value}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 mt-auto">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => setModal('view')}>
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
        </Button>
        <Button size="sm" className="flex-1 bg-brand-azul hover:bg-brand-azul/90 text-white" onClick={() => setModal('edit')}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
        </Button>
      </div>

      <Dialog open={modal === 'view'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-4 w-4" /> {title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">{viewContent}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'edit'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className={editSize}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Editar: {title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 max-h-[70vh] overflow-y-auto pr-1">{editContent}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Read-only view helper ─────────────────────────────────────────────────────

function ReadOnlyList({ items }: { items: SummaryItem[] }) {
  return (
    <ul className="divide-y divide-gray-100">
      {items.map(({ label, value }) => (
        <li key={label} className="flex items-center justify-between gap-3 py-2.5">
          <span className="text-sm text-gray-500">{label}</span>
          <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
        </li>
      ))}
    </ul>
  )
}

// ── Module cards ──────────────────────────────────────────────────────────────

function OperacionCard({ configs }: { configs: ConfiguracionSistema[] }) {
  const m = toMap(configs)
  const summary: SummaryItem[] = [
    { label: 'Apertura',      value: m.HORA_APERTURA    ?? '—' },
    { label: 'Cierre',        value: m.HORA_CIERRE      ?? '—' },
    { label: 'Aforo máximo',  value: m.AFORO_MAXIMO ? `${m.AFORO_MAXIMO} personas` : '—' },
  ]
  const viewItems: SummaryItem[] = [
    ...summary,
    { label: 'Intervalo preparación inicio', value: m.INTERVALO_PREPARACION_INICIO ?? '—' },
    { label: 'Intervalo preparación fin',    value: m.INTERVALO_PREPARACION_FIN    ?? '—' },
  ]
  return (
    <ModuleCard
      icon={Clock} color="bg-blue-50 text-blue-600"
      title="Horarios de operación"
      description="Apertura, cierre, aforo e intervalos del local"
      summary={summary}
      viewContent={<ReadOnlyList items={viewItems} />}
      editContent={<OperacionTab configs={configs} />}
    />
  )
}

function ReservasCard({ configs }: { configs: ConfiguracionSistema[] }) {
  const m = toMap(configs)
  const summary: SummaryItem[] = [
    { label: 'Anticipación mín.',   value: m.ANTICIPACION_MIN_RESERVA_PUBLICA_H ? `${m.ANTICIPACION_MIN_RESERVA_PUBLICA_H}h` : '—' },
    { label: 'Plazo reprog.',       value: m.PLAZO_REPROGRAMACION_H              ? `${m.PLAZO_REPROGRAMACION_H}h`             : '—' },
    { label: 'Reprog. máximas',     value: m.MAX_REPROGRAMACIONES_POR_ENTRADA    ?? '—' },
    { label: 'Visitas entrada free', value: m.VISITAS_PARA_ENTRADA_GRATIS        ?? '—' },
  ]
  return (
    <ModuleCard
      icon={CalendarCheck} color="bg-green-50 text-green-600"
      title="Reservas públicas"
      description="Plazos, reprogramaciones y fidelización del portal"
      summary={summary}
      viewContent={<ReadOnlyList items={summary} />}
      editContent={<ReservasTab configs={configs} />}
    />
  )
}

function EventosCard({ configs }: { configs: ConfiguracionSistema[] }) {
  const m = toMap(configs)
  const summary: SummaryItem[] = [
    { label: 'Anticipación mínima', value: m.ANTICIPACION_MIN_EVENTO_PRIVADO_D ? `${m.ANTICIPACION_MIN_EVENTO_PRIVADO_D} días` : '—' },
  ]
  return (
    <ModuleCard
      icon={CalendarRange} color="bg-violet-50 text-violet-600"
      title="Eventos privados"
      description="Anticipación mínima para solicitar eventos"
      summary={summary}
      editSize="sm:max-w-md"
      viewContent={<ReadOnlyList items={summary} />}
      editContent={<EventosTab configs={configs} />}
    />
  )
}

function SeguridadCard({ configs }: { configs: ConfiguracionSistema[] }) {
  const m = toMap(configs)
  const summary: SummaryItem[] = [
    { label: 'Intentos antes bloqueo', value: m.INTENTOS_LOGIN_ANTES_BLOQUEO    ?? '—' },
    { label: 'Duración bloqueo',       value: m.DURACION_BLOQUEO_LOGIN_MIN ? `${m.DURACION_BLOQUEO_LOGIN_MIN} min` : '—' },
    { label: 'Expiración sesión',      value: m.EXPIRACION_SESION_ADMIN_MIN ? `${m.EXPIRACION_SESION_ADMIN_MIN} min` : '—' },
  ]
  return (
    <ModuleCard
      icon={ShieldAlert} color="bg-red-50 text-red-600"
      title="Seguridad de acceso"
      description="Intentos de login, bloqueos y expiración de sesión"
      summary={summary}
      viewContent={<ReadOnlyList items={summary} />}
      editContent={<SeguridadTab configs={configs} />}
    />
  )
}

function PagosCard({ configs }: { configs: ConfiguracionSistema[] }) {
  const m = toMap(configs)
  const summary: SummaryItem[] = [
    { label: 'Proveedor PSE', value: m.PSE_PROVEEDOR ?? '—' },
  ]
  return (
    <ModuleCard
      icon={CreditCard} color="bg-emerald-50 text-emerald-600"
      title="Pagos y facturación"
      description="Proveedor de servicios electrónicos SUNAT"
      summary={summary}
      editSize="sm:max-w-md"
      viewContent={<ReadOnlyList items={summary} />}
      editContent={<PagosTab configs={configs} />}
    />
  )
}

function SedeCard({ idSede }: { idSede: number | null }) {
  const { data: sede } = useSede(idSede)
  const [modal, setModal] = useState<'view' | 'edit' | null>(null)

  const summary: SummaryItem[] = sede ? [
    { label: 'Nombre',     value: sede.nombre      },
    { label: 'Ciudad',     value: sede.ciudad       },
    { label: 'RUC',        value: sede.ruc ?? '—'   },
  ] : []

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Datos de la sede</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Nombre, dirección, contacto y RUC del local
          </p>
        </div>
      </div>

      {summary.length > 0 && (
        <ul className="space-y-1.5 border-t border-gray-50 pt-3">
          {summary.map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500 truncate">{label}</span>
              <span className="text-xs font-semibold text-gray-800 shrink-0 text-right max-w-[60%] truncate">{value}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 mt-auto">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => setModal('view')}>
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
        </Button>
        <Button size="sm" className="flex-1 bg-brand-azul hover:bg-brand-azul/90 text-white" onClick={() => setModal('edit')}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
        </Button>
      </div>

      <Dialog open={modal === 'view'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Datos de la sede
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            {sede ? (
              <ReadOnlyList items={[
                { label: 'Nombre',       value: sede.nombre           },
                { label: 'Dirección',    value: sede.direccion        },
                { label: 'Ciudad',       value: sede.ciudad           },
                { label: 'Departamento', value: sede.departamento     },
                { label: 'Teléfono',     value: sede.telefono ?? '—'  },
                { label: 'Correo',       value: sede.correo   ?? '—'  },
                { label: 'RUC',          value: sede.ruc      ?? '—'  },
              ]} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Sin datos.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'edit'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Editar: Datos de la sede
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <SedeTab />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CatalogosCard() {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-gray-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Catálogos del sistema</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Valores de referencia fijos del dominio del negocio
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 border-t border-gray-50 pt-3">
        <li className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500">Grupos definidos</span>
          <span className="text-xs font-semibold text-gray-800">9</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500">Editable</span>
          <span className="text-xs font-semibold text-gray-400">Solo lectura</span>
        </li>
      </ul>

      <div className="flex gap-2 mt-auto">
        <Button size="sm" variant="outline" className="w-full" onClick={() => setOpen(true)}>
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver catálogos
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Catálogos del sistema
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <CatalogosTab />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-52 animate-pulse" />
      ))}
    </div>
  )
}

export default function ConfiguracionPage() {
  const { idSede }                                       = useAuth()
  const { data: configs, isLoading, isError, refetch }   = useConfiguracion()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Configuración' }]} />
      <PageHeader
        title="Configuración del sistema"
        description="Centro de control operativo y técnico del negocio"
      />

      {isLoading ? (
        <GridSkeleton />
      ) : isError || !configs ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <OperacionCard  configs={configs} />
          <ReservasCard   configs={configs} />
          <EventosCard    configs={configs} />
          <SeguridadCard  configs={configs} />
          <PagosCard      configs={configs} />
          <SedeCard       idSede={idSede ?? null} />
          <SistemaCard />
          <CatalogosCard />
        </div>
      )}
    </div>
  )
}
