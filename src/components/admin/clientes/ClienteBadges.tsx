// components/admin/clientes/ClienteBadges.tsx

import { Crown, CheckCircle, XCircle, Building2, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

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
