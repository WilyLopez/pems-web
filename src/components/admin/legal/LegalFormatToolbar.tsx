'use client'

import { RefObject } from 'react'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Eraser,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/utils'

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  wrap?: [string, string]
  block?: string
  insert?: string
}

const ACCIONES: ToolbarAction[] = [
  { icon: <Bold className="h-3.5 w-3.5" />, label: 'Negrita', wrap: ['<strong>', '</strong>'] },
  { icon: <Italic className="h-3.5 w-3.5" />, label: 'Cursiva', wrap: ['<em>', '</em>'] },
  { icon: <Heading2 className="h-3.5 w-3.5" />, label: 'Encabezado H2', block: 'h2' },
  { icon: <Heading3 className="h-3.5 w-3.5" />, label: 'Encabezado H3', block: 'h3' },
  { icon: <List className="h-3.5 w-3.5" />, label: 'Lista no ordenada', block: 'ul-li' },
  { icon: <ListOrdered className="h-3.5 w-3.5" />, label: 'Lista ordenada', block: 'ol-li' },
  { icon: <Minus className="h-3.5 w-3.5" />, label: 'Separador', insert: '<hr />' },
]

interface Props {
  textareaRef: RefObject<HTMLTextAreaElement>
  onChange: (value: string) => void
  className?: string
}

export function LegalFormatToolbar({ textareaRef, onChange, className }: Props) {
  function applyAction(action: ToolbarAction) {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const value = el.value
    const selected = value.slice(start, end)

    let replacement = ''

    if (action.insert) {
      replacement = action.insert + '\n'
    } else if (action.wrap) {
      const [open, close] = action.wrap
      replacement = selected ? `${open}${selected}${close}` : `${open}${close}`
    } else if (action.block === 'h2') {
      replacement = selected ? `<h2>${selected}</h2>` : '<h2></h2>'
    } else if (action.block === 'h3') {
      replacement = selected ? `<h3>${selected}</h3>` : '<h3></h3>'
    } else if (action.block === 'ul-li') {
      const lines = selected
        ? selected.split('\n').map((l) => `  <li>${l}</li>`).join('\n')
        : '  <li></li>'
      replacement = `<ul>\n${lines}\n</ul>`
    } else if (action.block === 'ol-li') {
      const lines = selected
        ? selected.split('\n').map((l) => `  <li>${l}</li>`).join('\n')
        : '  <li></li>'
      replacement = `<ol>\n${lines}\n</ol>`
    }

    const newValue = value.slice(0, start) + replacement + value.slice(end)
    onChange(newValue)

    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + replacement.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  function limpiarHtml() {
    const el = textareaRef.current
    if (!el) return
    const plain = el.value.replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim()
    onChange(plain)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 bg-muted/40 px-2 py-1',
        className
      )}
    >
      {ACCIONES.map((action) => (
        <Button
          key={action.label}
          type="button"
          variant="ghost"
          size="sm"
          title={action.label}
          onClick={() => applyAction(action)}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          {action.icon}
        </Button>
      ))}

      <Separator orientation="vertical" className="mx-1 h-5" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Quitar formato HTML"
        onClick={limpiarHtml}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
      >
        <Eraser className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
