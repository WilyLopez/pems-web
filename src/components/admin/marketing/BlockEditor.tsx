'use client'

import { useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Type,
  AlignLeft,
  Image,
  MousePointerClick,
  Minus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmailBlock, BlockTipo, parsearBloques, serializarBloques } from '@/types/emailBlocks.types'
import { VariableChips } from './VariableChips'
import { Button } from '@/components/ui/Button'

interface Props {
  value: string
  onChange: (json: string) => void
}

interface TipoConfig {
  label: string
  icon: LucideIcon
  placeholder: string
}

const TIPO_CONFIG: Record<BlockTipo, TipoConfig> = {
  heading:   { label: 'Título',    icon: Type,              placeholder: 'Escribe el título...' },
  paragraph: { label: 'Párrafo',   icon: AlignLeft,         placeholder: 'Escribe el contenido...' },
  image:     { label: 'Imagen',    icon: Image,             placeholder: 'https://...' },
  button:    { label: 'Botón',     icon: MousePointerClick, placeholder: 'Texto del botón' },
  divider:   { label: 'Separador', icon: Minus,             placeholder: '' },
}

const ADD_BUTTONS: { tipo: BlockTipo; label: string; icon: LucideIcon }[] = [
  { tipo: 'heading',   label: 'Título',    icon: Type },
  { tipo: 'paragraph', label: 'Texto',     icon: AlignLeft },
  { tipo: 'image',     label: 'Imagen',    icon: Image },
  { tipo: 'button',    label: 'Botón',     icon: MousePointerClick },
  { tipo: 'divider',   label: 'Separador', icon: Minus },
]

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

interface BlockItemProps {
  block: EmailBlock
  index: number
  total: number
  isActive: boolean
  onActivate: (handler: (v: string) => void) => void
  onUpdate: (updated: EmailBlock) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function BlockItem({
  block,
  index,
  total,
  isActive,
  onActivate,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: BlockItemProps) {
  const cfg = TIPO_CONFIG[block.tipo]
  const Icon = cfg.icon
  const textRef = useRef<HTMLTextAreaElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  function insertIntoText(variable: string) {
    const el = textRef.current
    if (!el) { onUpdate({ ...block, texto: (block.texto ?? '') + variable }); return }
    const s = el.selectionStart ?? 0
    const e = el.selectionEnd ?? 0
    const next = (block.texto ?? '').slice(0, s) + variable + (block.texto ?? '').slice(e)
    onUpdate({ ...block, texto: next })
    setTimeout(() => { el.focus(); el.setSelectionRange(s + variable.length, s + variable.length) }, 0)
  }

  function insertIntoTextInput(variable: string) {
    const el = textInputRef.current
    if (!el) { onUpdate({ ...block, texto: (block.texto ?? '') + variable }); return }
    const s = el.selectionStart ?? 0
    const e = el.selectionEnd ?? 0
    const next = (block.texto ?? '').slice(0, s) + variable + (block.texto ?? '').slice(e)
    onUpdate({ ...block, texto: next })
    setTimeout(() => { el.focus(); el.setSelectionRange(s + variable.length, s + variable.length) }, 0)
  }

  function insertIntoUrl(variable: string) {
    const el = urlRef.current
    if (!el) { onUpdate({ ...block, url: (block.url ?? '') + variable }); return }
    const s = el.selectionStart ?? 0
    const e = el.selectionEnd ?? 0
    const next = (block.url ?? '').slice(0, s) + variable + (block.url ?? '').slice(e)
    onUpdate({ ...block, url: next })
    setTimeout(() => { el.focus(); el.setSelectionRange(s + variable.length, s + variable.length) }, 0)
  }

  return (
    <div
      className={cn(
        'group rounded-xl border transition-all',
        isActive
          ? 'border-brand-azul/40 shadow-sm bg-white'
          : 'border-gray-100 bg-white hover:border-gray-200'
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0" />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            {cfg.label}
          </span>
          {block.tipo === 'heading' && (
            <select
              value={block.nivel ?? 1}
              onChange={(e) => onUpdate({ ...block, nivel: Number(e.target.value) as 1 | 2 })}
              className="text-[11px] border border-gray-200 rounded-md px-1 py-0 text-gray-500 focus:outline-none"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
            </select>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {block.tipo === 'divider' && (
        <div className="px-3 py-3">
          <hr className="border-gray-200" />
        </div>
      )}

      {(block.tipo === 'heading' || block.tipo === 'paragraph') && (
        <div className="p-3">
          <textarea
            ref={textRef}
            rows={block.tipo === 'heading' ? 1 : 3}
            value={block.texto ?? ''}
            onChange={(e) => onUpdate({ ...block, texto: e.target.value })}
            placeholder={cfg.placeholder}
            onFocus={() => onActivate(insertIntoText)}
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-azul/30 resize-none leading-relaxed text-gray-800 placeholder:text-gray-300"
          />
        </div>
      )}

      {block.tipo === 'image' && (
        <div className="p-3 space-y-2">
          <input
            ref={urlRef}
            type="url"
            value={block.url ?? ''}
            onChange={(e) => onUpdate({ ...block, url: e.target.value })}
            placeholder="https://example.com/imagen.jpg"
            onFocus={() => onActivate(insertIntoUrl)}
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
          />
          <input
            type="text"
            value={block.alt ?? ''}
            onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
            placeholder="Texto alternativo (accesibilidad)"
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
          />
          {block.url && (
            <img
              src={block.url}
              alt={block.alt ?? ''}
              className="w-full max-h-32 object-cover rounded-lg border border-gray-100"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
        </div>
      )}

      {block.tipo === 'button' && (
        <div className="p-3 space-y-2">
          <input
            ref={textInputRef}
            type="text"
            value={block.texto ?? ''}
            onChange={(e) => onUpdate({ ...block, texto: e.target.value })}
            placeholder="Texto del botón (ej: Ver oferta)"
            onFocus={() => onActivate(insertIntoTextInput)}
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
          />
          <input
            ref={urlRef}
            type="url"
            value={block.url ?? ''}
            onChange={(e) => onUpdate({ ...block, url: e.target.value })}
            placeholder="https://... o {{urlReserva}}"
            onFocus={() => onActivate(insertIntoUrl)}
            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
          />
          {block.texto && (
            <div className="flex justify-center py-1">
              <span className="px-5 py-2 rounded-full bg-brand-azul text-white text-sm font-semibold">
                {block.texto}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function BlockEditor({ value, onChange }: Props) {
  const [bloques, setBloques] = useState<EmailBlock[]>(() => parsearBloques(value))
  const [activeId, setActiveId] = useState<string | null>(null)
  const insertHandlerRef = useRef<((v: string) => void) | null>(null)

  function commit(updated: EmailBlock[]) {
    setBloques(updated)
    onChange(serializarBloques(updated))
  }

  function addBlock(tipo: BlockTipo) {
    commit([...bloques, { id: generateId(), tipo }])
  }

  function updateBlock(index: number, updated: EmailBlock) {
    const next = [...bloques]
    next[index] = updated
    commit(next)
  }

  function removeBlock(index: number) {
    commit(bloques.filter((_, i) => i !== index))
  }

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...bloques]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    commit(next)
  }

  function moveDown(index: number) {
    if (index === bloques.length - 1) return
    const next = [...bloques]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    commit(next)
  }

  function handleActivate(blockId: string, handler: (v: string) => void) {
    setActiveId(blockId)
    insertHandlerRef.current = handler
  }

  function handleInsertVariable(variable: string) {
    insertHandlerRef.current?.(variable)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
      <div className="space-y-3">
        {bloques.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
            Agrega bloques para construir tu correo
          </div>
        )}

        {bloques.map((block, i) => (
          <BlockItem
            key={block.id}
            block={block}
            index={i}
            total={bloques.length}
            isActive={activeId === block.id}
            onActivate={(handler) => handleActivate(block.id, handler)}
            onUpdate={(updated) => updateBlock(i, updated)}
            onRemove={() => removeBlock(i)}
            onMoveUp={() => moveUp(i)}
            onMoveDown={() => moveDown(i)}
          />
        ))}

        <div className="flex flex-wrap gap-2 pt-1">
          {ADD_BUTTONS.map(({ tipo, label, icon: Icon }) => (
            <Button
              key={tipo}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock(tipo)}
              className="rounded-xl gap-1.5 text-xs text-gray-600 border-gray-200 hover:border-brand-azul/40 hover:text-brand-azul"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-4 self-start space-y-4">
        <VariableChips onInsert={handleInsertVariable} />

        {bloques.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Vista previa
            </p>
            <div className="border border-gray-100 rounded-xl bg-gray-50 p-3 space-y-2 max-h-64 overflow-y-auto">
              {bloques.map((b) => {
                if (b.tipo === 'divider') return <hr key={b.id} className="border-gray-300" />
                if (b.tipo === 'heading') return (
                  <p key={b.id} className={cn('font-black text-gray-900', b.nivel === 2 ? 'text-base' : 'text-lg')}>
                    {b.texto || <span className="text-gray-300 font-normal italic">Título vacío</span>}
                  </p>
                )
                if (b.tipo === 'paragraph') return (
                  <p key={b.id} className="text-gray-600 leading-relaxed text-xs">
                    {b.texto || <span className="text-gray-300 italic">Párrafo vacío</span>}
                  </p>
                )
                if (b.tipo === 'image') return b.url ? (
                  <img key={b.id} src={b.url} alt={b.alt ?? ''} className="w-full rounded-lg object-cover max-h-20" />
                ) : (
                  <div key={b.id} className="w-full h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )
                if (b.tipo === 'button') return (
                  <div key={b.id} className="flex justify-center">
                    <span className="px-4 py-1.5 rounded-full bg-brand-azul text-white text-xs font-semibold">
                      {b.texto || 'Botón'}
                    </span>
                  </div>
                )
                return null
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
