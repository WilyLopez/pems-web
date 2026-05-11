'use client'

import { Activity, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { LogAuditoria } from '@/types/auditoria.types'
import { AccionBadge } from '@/components/admin/auditoria/AccionBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export function ActividadReciente({ idAdmin }: { idAdmin: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['actividad-perfil', idAdmin],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PagedResponse<LogAuditoria>>>(
        `/auditoria/usuarios/${idAdmin}`,
        { params: { pagina: 0, tamano: 8 } },
      )
      return data.data.content
    },
  })

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 h-fit">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
            <Activity className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Actividad reciente</h3>
            <p className="text-xs text-gray-500">Ultimas 8 acciones</p>
          </div>
        </div>
        <Link
          href="/admin/auditoria"
          className="text-xs text-brand-azul font-semibold hover:underline flex items-center gap-1"
        >
          Ver todo
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Activity className="h-5 w-5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">Sin actividad registrada</p>
          <p className="text-xs text-gray-300 mt-1">Las acciones que realices apareceran aqui</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3.5 py-3 hover:bg-gray-50 transition-colors"
            >
              <AccionBadge accion={log.accion} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {log.descripcion ??
                    `${log.accion} ${log.entidadAfectada}${log.idEntidad ? ` #${log.idEntidad}` : ''}`}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                  {formatDateTime(log.fechaLog)}
                  {log.modulo && (
                    <span className="ml-2 text-gray-300">· {log.modulo}</span>
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