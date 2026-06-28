'use client'

import { useState } from 'react'
import { Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'

export interface SummaryItem {
  label: string
  value: string
}

interface ModuleCardProps {
  icon: React.ElementType
  color: string
  title: string
  description: string
  summary?: SummaryItem[]
  editSize?: 'sm:max-w-md' | 'sm:max-w-lg' | 'sm:max-w-xl'
  viewContent: React.ReactNode
  editContent: React.ReactNode
  navProps?: SeccionNavProps
}

export function ModuleCard({
  icon: Icon,
  color,
  title,
  description,
  summary,
  editSize = 'sm:max-w-lg',
  viewContent,
  editContent,
  navProps,
}: ModuleCardProps) {
  const [localModal, setLocalModal] = useState<'view' | 'edit' | null>(null)

  const activeModal = navProps ? navProps.forceModal : localModal
  const setActive = navProps
    ? (m: 'view' | 'edit' | null) => navProps.onOpenChange(m)
    : setLocalModal

  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-card-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {description}
          </p>
        </div>
      </div>

      {summary && summary.length > 0 && (
        <ul className="space-y-1.5 border-t border-border pt-3">
          {summary.map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground truncate">
                {label}
              </span>
              <span className="text-xs font-semibold text-foreground shrink-0">
                {value}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 mt-auto">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => setActive('view')}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-brand-azul hover:bg-brand-azul/90 text-white"
          onClick={() => setActive('edit')}
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
        </Button>
      </div>

      <Dialog
        open={activeModal === 'view'}
        onOpenChange={(v) => !v && setActive(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-4 w-4" /> {title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">{viewContent}</div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeModal === 'edit'}
        onOpenChange={(v) => !v && setActive(null)}
      >
        <DialogContent className={editSize}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Editar: {title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 max-h-[70vh] overflow-y-auto pr-1">
            {editContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
