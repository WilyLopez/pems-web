'use client'

import { PreferenciaAdmin } from '@/types/preferencias.types'
import {
  LayoutDashboard,
  Bell,
  Settings,
  Users,
  ChevronLeft,
  BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  prefs: PreferenciaAdmin
}

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Users, label: 'Clientes' },
  { icon: BarChart2, label: 'Ventas' },
  { icon: Bell, label: 'Alertas' },
  { icon: Settings, label: 'Config' },
]

export function PreviewPanel({ prefs }: Props) {
  const isDark = prefs.tema === 'DARK'
  const isCompact = prefs.modoCompacto
  const isCollapsed = prefs.sidebarColapsado
  const primary = prefs.colorPrimario ?? (isDark ? '#38bdf8' : '#00AEEF')

  const radius =
    prefs.radiosBordes === 'SMALL'
      ? '3px'
      : prefs.radiosBordes === 'LARGE'
        ? '14px'
        : '7px'

  const bg = isDark ? '#111827' : '#ffffff'
  const surface = isDark ? '#1f2937' : '#f9fafb'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const textMuted = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Vista previa
      </p>

      <div
        className="overflow-hidden border shadow-sm transition-all duration-300"
        style={{
          background: bg,
          borderColor: border,
          borderRadius: radius,
        }}
      >
        <div className="flex" style={{ height: '220px' }}>
          <div
            className="flex flex-col border-r transition-all duration-200"
            style={{
              width: isCollapsed ? '36px' : '88px',
              background: surface,
              borderColor: border,
            }}
          >
            <div
              className="flex items-center justify-between px-2 py-2 border-b"
              style={{ borderColor: border }}
            >
              {!isCollapsed && (
                <span
                  className="text-[8px] font-bold tracking-tight truncate"
                  style={{ color: primary }}
                >
                  PLAYZONE
                </span>
              )}
              <ChevronLeft
                className={cn(
                  'shrink-0 opacity-40 transition-transform',
                  isCollapsed && 'rotate-180'
                )}
                style={{
                  width: '9px',
                  height: '9px',
                  color: text,
                }}
              />
            </div>

            <div className="flex flex-col gap-0.5 p-1.5 flex-1">
              {MENU_ITEMS.map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 transition-colors"
                  style={{
                    background: i === 0 ? primary : 'transparent',
                    color: i === 0 ? '#fff' : textMuted,
                    borderRadius: isCompact ? '3px' : radius,
                    padding: isCompact ? '2px 4px' : '3px 5px',
                  }}
                >
                  <Icon
                    style={{
                      width: '9px',
                      height: '9px',
                      flexShrink: 0,
                    }}
                  />
                  {!isCollapsed && (
                    <span
                      style={{
                        fontSize: '8px',
                        fontWeight: i === 0 ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex flex-1 flex-col"
            style={{
              padding: isCompact ? '8px' : '10px',
              gap: isCompact ? '6px' : '8px',
            }}
          >
            {prefs.mostrarMigaspan && (
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontSize: '7px',
                    color: textMuted,
                  }}
                >
                  Inicio
                </span>
                <span
                  style={{
                    fontSize: '7px',
                    color: textMuted,
                  }}
                >
                  /
                </span>
                <span
                  style={{
                    fontSize: '7px',
                    color: text,
                    fontWeight: 500,
                  }}
                >
                  Dashboard
                </span>
              </div>
            )}

            <div className="flex gap-1.5">
              {['Ventas', 'Clientes', 'Eventos'].map((label, i) => (
                <div
                  key={label}
                  className="flex-1"
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: radius,
                    padding: isCompact ? '5px' : '7px',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '3px',
                      background: primary,
                      borderRadius: '2px',
                      opacity: 0.6,
                      marginBottom: '4px',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: text,
                    }}
                  >
                    {i === 0 ? '142' : i === 1 ? '38' : '7'}
                  </div>
                  <div
                    style={{
                      fontSize: '7px',
                      color: textMuted,
                      marginTop: '1px',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex-1"
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: radius,
                padding: isCompact ? '5px 6px' : '7px 8px',
              }}
            >
              <div
                style={{
                  fontSize: '7px',
                  fontWeight: 600,
                  color: text,
                  marginBottom: '5px',
                }}
              >
                Reservas recientes
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                  style={{
                    paddingTop: isCompact ? '2px' : '3px',
                    paddingBottom: isCompact ? '2px' : '3px',
                    borderBottom: i < 3 ? `1px solid ${border}` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '4px',
                      background: textMuted,
                      borderRadius: '2px',
                      opacity: 0.3,
                    }}
                  />
                  <div
                    style={{
                      fontSize: '6px',
                      background: primary,
                      color: '#fff',
                      borderRadius: '3px',
                      padding: '1px 4px',
                      opacity: 0.9,
                    }}
                  >
                    OK
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Tema</span>
          <span className="text-[10px] font-medium">{prefs.tema}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Fuente</span>
          <span className="text-[10px] font-medium">{prefs.tamanioFuente}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Bordes</span>
          <span className="text-[10px] font-medium">{prefs.radiosBordes}</span>
        </div>
        {prefs.colorPrimario && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Color</span>
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full border border-border/60"
                style={{ background: prefs.colorPrimario }}
              />
              <span className="text-[10px] font-mono">
                {prefs.colorPrimario}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
