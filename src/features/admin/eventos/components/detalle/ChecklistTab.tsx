'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Plus, XCircle } from 'lucide-react'
import {
  useChecklist,
  useCompletarTarea,
  useDescompletarTarea,
  useAgregarTarea,
  useEliminarTarea,
} from '../../hooks/useEventos'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ChecklistTabProps {
  idEvento: number
}

export function ChecklistTab({ idEvento }: ChecklistTabProps) {
  const { data: checklist = [], isLoading: loadingChecklist } =
    useChecklist(idEvento)
  const completar = useCompletarTarea()
  const descompletar = useDescompletarTarea()
  const agregarTarea = useAgregarTarea()
  const eliminarTarea = useEliminarTarea()
  const [nuevaTarea, setNuevaTarea] = useState('')

  const completadas = checklist.filter((c) => c.completada).length
  const pctChecklist =
    checklist.length > 0
      ? Math.round((completadas / checklist.length) * 100)
      : 0

  function agregar() {
    if (!nuevaTarea.trim()) return
    agregarTarea.mutate(
      { idEvento, tarea: nuevaTarea.trim() },
      { onSuccess: () => setNuevaTarea('') }
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Checklist operativo
        </h3>
        <span
          className={cn(
            'text-xs font-bold px-2 py-1 rounded-full',
            pctChecklist === 100
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
          )}
        >
          {completadas}/{checklist.length} completadas
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={cn(
            'h-2 rounded-full transition-all',
            pctChecklist === 100 ? 'bg-green-500' : 'bg-amber-400'
          )}
          style={{ width: `${pctChecklist}%` }}
        />
      </div>
      {loadingChecklist ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : (
        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-xl border transition-all',
                item.completada
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50'
                  : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-brand-azul/30'
              )}
            >
              <button
                type="button"
                className="shrink-0"
                aria-label={
                  item.completada
                    ? `Desmarcar tarea "${item.tarea}"`
                    : `Completar tarea "${item.tarea}"`
                }
                onClick={() => {
                  if (completar.isPending || descompletar.isPending) return
                  if (item.completada) {
                    descompletar.mutate({ idEvento, idChecklist: item.id })
                  } else {
                    completar.mutate({ idEvento, idChecklist: item.id })
                  }
                }}
              >
                {item.completada ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600 hover:text-brand-azul transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    item.completada
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-100'
                  )}
                >
                  {item.tarea}
                </p>
                {item.completada && item.usuarioCompleto && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {item.usuarioCompleto}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  eliminarTarea.mutate({ idEvento, idChecklist: item.id })
                }
                disabled={eliminarTarea.isPending}
                aria-label={`Eliminar tarea "${item.tarea}"`}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nuevaTarea.trim()) {
                  e.preventDefault()
                  agregar()
                }
              }}
              placeholder="Nueva tarea..."
              className="h-9 rounded-xl text-sm flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 rounded-xl gap-1.5 text-xs shrink-0"
              disabled={!nuevaTarea.trim() || agregarTarea.isPending}
              onClick={agregar}
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
