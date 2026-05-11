'use client'

import { Search, X } from 'lucide-react'
import { AuditoriaFiltros } from '@/types/auditoria.types'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

interface Props {
  filtros: AuditoriaFiltros
  onChange: (f: AuditoriaFiltros) => void
  onBuscar: () => void
}

const ACCIONES = ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CONSULTAR', 'LOGIN', 'LOGOUT']
const MODULOS  = ['Reservas', 'Eventos', 'Contratos', 'Promociones', 'CMS', 'Finanzas', 'Usuarios', 'Accesos']

export function AuditoriaFiltrosPanel({ filtros, onChange, onBuscar }: Props) {
  function set<K extends keyof AuditoriaFiltros>(key: K, value: AuditoriaFiltros[K]) {
    onChange({ ...filtros, [key]: value })
  }

  function limpiarFiltros() {
    onChange({
      desde: filtros.desde,
      hasta: filtros.hasta,
      idUsuario: undefined,
      modulo: undefined,
      accion: undefined,
      entidad: undefined,
    })
  }

  const tieneFiltrosAdicionales = !!(filtros.modulo || filtros.accion || filtros.entidad || filtros.idUsuario)

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Fechas */}
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <Input
            type="date"
            value={filtros.desde}
            onChange={e => set('desde', e.target.value)}
            className="w-36 h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <Input
            type="date"
            value={filtros.hasta}
            onChange={e => set('hasta', e.target.value)}
            className="w-36 h-9"
          />
        </div>

        {/* Acción */}
        <div className="space-y-1.5">
          <Label className="text-xs">Acción</Label>
          <Select value={filtros.accion ?? 'all'} onValueChange={v => set('accion', v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {ACCIONES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Módulo */}
        <div className="space-y-1.5">
          <Label className="text-xs">Módulo</Label>
          <Select value={filtros.modulo ?? 'all'} onValueChange={v => set('modulo', v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {MODULOS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Entidad */}
        <div className="space-y-1.5">
          <Label className="text-xs">Entidad</Label>
          <Input
            placeholder="ej: Contrato"
            value={filtros.entidad ?? ''}
            onChange={e => set('entidad', e.target.value || undefined)}
            className="w-32 h-9"
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onBuscar}>
            <Search className="mr-1.5 h-4 w-4" />
            Consultar
          </Button>
          {tieneFiltrosAdicionales && (
            <Button size="sm" variant="ghost" onClick={limpiarFiltros}>
              <X className="mr-1.5 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
