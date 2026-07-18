'use client'

import { Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { LogAuditoria } from '@/features/admin/auditoria/types'
import { AccionBadge } from '@/features/admin/auditoria/components/AccionBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/lib/utils'

export function HistorialAuditoriaUsuario({ staffId }: { staffId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['auditoria-staff', staffId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PagedResponse<LogAuditoria>>>(
        `/auditoria/entidad/Staff/${staffId}`,
        { params: { pagina: 0, tamano: 10 } }
      )
      return data.data.content
    },
  })

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold text-gray-700">
          Historial de auditoría
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">
          Sin acciones registradas para esta cuenta.
        </p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {data.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-2.5 py-2"
            >
              <AccionBadge accion={log.accion} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-gray-800">
                  {log.descripcion ?? log.accion}
                </p>
                <p className="font-mono text-[10px] text-gray-400">
                  {formatDateTime(log.fechaLog)}
                  {log.nombreUsuario && (
                    <span className="ml-1.5">· {log.nombreUsuario}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
