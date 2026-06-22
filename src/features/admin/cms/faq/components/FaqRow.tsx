'use client'

import { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Faq } from '@/types/faq.types'

interface FaqRowProps {
  faq: Faq
  index: number
  total: number
  onEdit: (f: Faq) => void
  onToggle: (f: Faq) => void
  onDelete: (id: number) => void
  onMoveUp: (i: number) => void
  onMoveDown: (i: number) => void
  disableReorder?: boolean
}

export function FaqRow({
  faq,
  index,
  total,
  onEdit,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableReorder = false,
}: FaqRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start gap-3 p-4">
          {/* Reorder */}
          <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
            <button
              type="button"
              disabled={disableReorder || index === 0}
              onClick={() => onMoveUp(index)}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
              title="Mover arriba"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={disableReorder || index === total - 1}
              onClick={() => onMoveDown(index)}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
              title="Mover abajo"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="font-medium text-sm text-left hover:text-brand-azul transition-colors"
                onClick={() => setExpanded(!expanded)}
              >
                {faq.pregunta}
              </button>
              {!faq.visible && (
                <Badge
                  variant="outline"
                  className="text-xs h-5 text-muted-foreground"
                >
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Oculta
                </Badge>
              )}
            </div>
            {expanded && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-normal">
                {faq.respuesta}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onToggle(faq)}
              title={faq.visible ? 'Ocultar' : 'Mostrar'}
            >
              {faq.visible ? (
                <Eye className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onEdit(faq)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:text-destructive"
              onClick={() => onDelete(faq.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
