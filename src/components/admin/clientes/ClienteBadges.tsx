// components/admin/clientes/ClienteBadges.tsx

import {
  Crown, CheckCircle, XCircle, Building2, User,
  Globe, MapPin, ShieldCheck, Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { OrigenCliente, SegmentoCliente } from '@/types/cliente.types'

/* ── VIP ─────────────────────────────────────────────────────────────────────── */
export function VipBadge({ descuento }: { descuento?: number | null }) {
  return (
    <Badge className="bg-brand-amarillo/20 text-yellow-800 border-brand-amarillo/40 gap-1 font-semibold">
      <Crown className="h-3 w-3" />
      VIP{descuento ? ` ${descuento}%` : ''}
    </Badge>
  )
}

/* ── Estado activo/inactivo ──────────────────────────────────────────────────── */
export function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          activo ? 'bg-green-500' : 'bg-gray-300'
        )}
      />
      <span
        className={cn(
          'text-xs font-medium',
          activo ? 'text-green-700' : 'text-gray-400'
        )}
      >
        {activo ? 'Activo' : 'Inactivo'}
      </span>
    </span>
  )
}

/* ── Verificacion de correo ──────────────────────────────────────────────────── */
export function VerificadoBadge({ verificado }: { verificado: boolean }) {
  return verificado ? (
    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
  ) : (
    <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
  )
}

/* ── Tipo de cliente ─────────────────────────────────────────────────────────── */
export function TipoBadge({ tipo }: { tipo?: string | null }) {
  if (tipo === 'EMPRESA') {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-xs border-brand-azul/30 text-brand-azul"
      >
        <Building2 className="h-3 w-3" />
        Empresa
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 text-xs text-gray-500 border-gray-200"
    >
      <User className="h-3 w-3" />
      Persona
    </Badge>
  )
}

/* ── Origen de registro ──────────────────────────────────────────────────────── */
export function OrigenBadge({ origen }: { origen?: OrigenCliente | null }) {
  if (origen === 'MOSTRADOR') {
    return (
      <Badge variant="outline" className="gap-1 text-xs text-orange-600 border-orange-200 bg-orange-50">
        <MapPin className="h-3 w-3" />
        Mostrador
      </Badge>
    )
  }
  if (origen === 'ADMIN') {
    return (
      <Badge variant="outline" className="gap-1 text-xs text-purple-600 border-purple-200 bg-purple-50">
        <ShieldCheck className="h-3 w-3" />
        Admin
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 text-xs text-brand-azul border-brand-azul/20 bg-brand-azul/5">
      <Globe className="h-3 w-3" />
      Web
    </Badge>
  )
}

/* ── Segmento ────────────────────────────────────────────────────────────────── */
const SEGMENTO_CONFIG: Record<SegmentoCliente, { label: string; cls: string }> = {
  NUEVO:       { label: 'Nuevo',       cls: 'text-gray-600 border-gray-200 bg-gray-50' },
  FRECUENTE:   { label: 'Frecuente',   cls: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
  VIP:         { label: 'VIP',         cls: 'text-yellow-700 border-yellow-200 bg-yellow-50' },
  CORPORATIVO: { label: 'Corporativo', cls: 'text-blue-700 border-blue-200 bg-blue-50' },
  INACTIVO:    { label: 'Inactivo',    cls: 'text-gray-400 border-gray-100 bg-gray-50' },
}

export function SegmentoBadge({ segmento }: { segmento?: SegmentoCliente | null }) {
  if (!segmento) return null
  const cfg = SEGMENTO_CONFIG[segmento] ?? SEGMENTO_CONFIG.NUEVO
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs font-semibold', cfg.cls)}>
      <Star className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

/* ── Visitas (frecuencia) ────────────────────────────────────────────────────── */
export function VisitasBadge({ visitas }: { visitas: number }) {
  const nivel =
    visitas >= 20
      ? {
          label: 'Frecuente',
          cls: 'bg-green-100 text-green-800 border-green-200',
        }
      : visitas >= 5
        ? {
            label: 'Regular',
            cls: 'bg-brand-azul/10 text-brand-azul border-brand-azul/20',
          }
        : {
            label: `${visitas}`,
            cls: 'bg-gray-100 text-gray-600 border-gray-200',
          }

  return (
    <Badge variant="outline" className={cn('text-xs font-semibold', nivel.cls)}>
      {visitas >= 5 ? `${visitas} · ${nivel.label}` : visitas}
    </Badge>
  )
}
