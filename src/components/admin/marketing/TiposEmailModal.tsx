'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { TiposEmailManager } from './TiposEmailManager'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function TiposEmailModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tipos de correo</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <TiposEmailManager />
        </div>
      </DialogContent>
    </Dialog>
  )
}
