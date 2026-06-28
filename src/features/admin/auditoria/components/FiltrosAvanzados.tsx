'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
import { AuditoriaFiltros } from '../types'

const TAMANOS = [10, 20, 50] as const

interface Props {
  filtros: AuditoriaFiltros
  onChange: <K extends keyof AuditoriaFiltros>(key: K, value: AuditoriaFiltros[K]) => void
}

export function FiltrosAvanzados({ filtros, onChange }: Props) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setAbierto((p) => !p)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {abierto ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        Filtros avanzados
      </button>

      {abierto && (
        <div className="flex flex-wrap gap-3 items-end px-4 pb-4">
          <div className="space-y-1.5">
            <Label className="text-xs">ID Usuario (UUID)</Label>
            <Input
              placeholder="xxxxxxxx-xxxx-xxxx-..."
              value={filtros.idUsuario ?? ''}
              onChange={(e) => onChange('idUsuario', e.target.value || undefined)}
              className="w-64 h-9 font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Registros por página</Label>
            <Select
              value={String(filtros.tamano ?? 20)}
              onValueChange={(v) => onChange('tamano', Number(v))}
            >
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAMANOS.map((t) => (
                  <SelectItem key={t} value={String(t)}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
