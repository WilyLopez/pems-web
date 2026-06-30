'use client'

import { memo } from 'react'
import { Bell, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useNotificaciones } from '@/hooks/useNotificaciones'
import { useNotificacionesStore } from '@/lib/store/notificaciones.store'

export const NotificacionesMenu = memo(function NotificacionesMenu() {
  const {
    notificaciones,
    noLeidas,
    fetchNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    setPanelAbierto,
  } = useNotificacionesStore()
  
  // Estos import se necesitan para que el componente funcione igual que antes
  // pero son dependencias externas a este componente
  // En una refactorización estricta deberían pasarse por props o contexto
  const { TIPO_ICON, TIPO_BADGE, DOT_COLOR } = require('@/features/admin/shared/layout/AdminNavbar')

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) fetchNotificaciones()
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Bell className="h-[18px] w-[18px] text-gray-500" />
          {noLeidas > 0 && (
            <span className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full bg-brand-rosa ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 rounded-2xl overflow-hidden shadow-card-hover"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-bold text-sm text-gray-900">
            Notificaciones
          </span>
          {noLeidas > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-brand-rosa text-white text-[10px] h-5 px-2 rounded-full">
                {noLeidas} nuevas
              </Badge>
              <button
                onClick={marcarTodasLeidas}
                className="flex items-center gap-1 text-[10px] font-semibold text-brand-azul hover:text-brand-azul/70 transition-colors"
              >
                <Check className="h-3 w-3" />
                Marcar todas
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
          {notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell className="h-5 w-5 text-gray-300" />
              <p className="text-xs text-gray-400">Sin notificaciones</p>
            </div>
          ) : (
            notificaciones.map((n) => {
              const Icon = TIPO_ICON[n.tipo]
              return (
                <div
                  key={n.id}
                  onClick={() => marcarLeida(n.id)}
                  className={cn(
                    'flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                    !n.leida && 'bg-brand-azul/[0.03]'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 h-2 w-2 rounded-full shrink-0 mt-2',
                      !n.leida ? DOT_COLOR[n.tipo] : 'bg-transparent'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-xs leading-snug',
                        n.leida
                          ? 'text-gray-600'
                          : 'text-gray-900 font-semibold'
                      )}
                    >
                      {n.titulo}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                      {n.mensaje}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(n.fecha, {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                          TIPO_BADGE[n.tipo]
                        )}
                      >
                        {n.tipo}
                      </span>
                    </div>
                  </div>
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 mt-1',
                      TIPO_BADGE[n.tipo].split(' ')[1]
                    )}
                  />
                </div>
              )
            })
          )}
        </div>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={() => setPanelAbierto(true)}
            className="block w-full text-center text-xs text-brand-azul font-semibold py-2 rounded-xl hover:bg-brand-azul/8 transition-colors"
          >
            Ver todas las notificaciones
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
