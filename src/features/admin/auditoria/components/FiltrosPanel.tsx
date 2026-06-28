'use client'

import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { AuditoriaFiltros, ACCIONES, MODULOS, NIVELES, RESULTADOS } from '../types'

interface Props {
  filtros: AuditoriaFiltros
  tieneFiltrosActivos: boolean
  onChange: <K extends keyof AuditoriaFiltros>(key: K, value: AuditoriaFiltros[K]) => void
  onLimpiar: () => void
}

export function FiltrosPanel({ filtros, tieneFiltrosActivos, onChange, onLimpiar }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <Input
            type="date"
            value={filtros.desde}
            onChange={(e) => onChange('desde', e.target.value)}
            className="w-36 h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <Input
            type="date"
            value={filtros.hasta}
            onChange={(e) => onChange('hasta', e.target.value)}
            className="w-36 h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Módulo</Label>
          <Select
            value={filtros.modulo ?? 'all'}
            onValueChange={(v) => onChange('modulo', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {MODULOS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Acción</Label>
          <Select
            value={filtros.accion ?? 'all'}
            onValueChange={(v) => onChange('accion', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {ACCIONES.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Nivel</Label>
          <Select
            value={filtros.nivel ?? 'all'}
            onValueChange={(v) => onChange('nivel', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {NIVELES.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Resultado</Label>
          <Select
            value={filtros.resultado ?? 'all'}
            onValueChange={(v) => onChange('resultado', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {RESULTADOS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Entidad</Label>
          <Input
            placeholder="Ej: Contrato"
            value={filtros.entidad ?? ''}
            onChange={(e) => onChange('entidad', e.target.value || undefined)}
            className="w-32 h-9"
          />
        </div>

        {tieneFiltrosActivos && (
          <Button size="sm" variant="ghost" onClick={onLimpiar} className="self-end">
            <X className="mr-1.5 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
