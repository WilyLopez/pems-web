import { cn, formatDate } from '@/lib/utils'
import { Banner } from '@/types/banner.types'

type EstadoBanner = 'ACTIVO' | 'PROGRAMADO' | 'VENCIDO' | 'INACTIVO'

export function calcularEstado(banner: Banner): EstadoBanner {
  const ahora = new Date()
  const inicio = new Date(banner.fechaInicio)
  const fin = banner.fechaFin ? new Date(banner.fechaFin) : null
  if (!banner.activo) return 'INACTIVO'
  if (inicio > ahora) return 'PROGRAMADO'
  if (fin && fin < ahora) return 'VENCIDO'
  return 'ACTIVO'
}

const CONFIG: Record<EstadoBanner, { label: string; cls: string }> = {
  ACTIVO:     { label: 'Activo',     cls: 'bg-green-100 text-green-800 border-green-200'    },
  PROGRAMADO: { label: 'Programado', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  VENCIDO:    { label: 'Vencido',    cls: 'bg-red-100 text-red-700 border-red-200'          },
  INACTIVO:   { label: 'Inactivo',   cls: 'bg-gray-100 text-gray-500 border-gray-200'       },
}

interface BannerEstadoBadgeProps {
  banner: Banner
}

export function BannerEstadoBadge({ banner }: BannerEstadoBadgeProps) {
  const estado = calcularEstado(banner)
  const { label, cls } = CONFIG[estado]

  const diasVencido =
    estado === 'VENCIDO' && banner.fechaFin
      ? Math.floor((Date.now() - new Date(banner.fechaFin).getTime()) / (1000 * 60 * 60 * 24))
      : null

  return (
    <div>
      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cls)}>
        {label}
      </span>
      {estado === 'PROGRAMADO' && (
        <p className="text-[10px] text-gray-400 mt-0.5">Inicia {formatDate(banner.fechaInicio)}</p>
      )}
      {estado === 'VENCIDO' && diasVencido !== null && (
        <p className="text-[10px] text-red-400 mt-0.5">Vencio hace {diasVencido} dias</p>
      )}
    </div>
  )
}
