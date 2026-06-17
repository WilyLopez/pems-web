'use client'

import { useState } from 'react'
import {
  Cake, PartyPopper, Gift, Heart, Crown, Star, Sparkles, Music, Music2,
  Zap, Gamepad2, Trophy, Palette, Camera,
  Utensils, Coffee, Wine, IceCream,
  Package, Truck, Mic, Headphones, Flower2,
  Users, Baby, GraduationCap,
  MapPin, Clock, Calendar, Smile, Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'

const ICON_MAP: Record<string, React.ElementType> = {
  Cake,
  PartyPopper,
  Gift,
  Heart,
  Crown,
  Star,
  Sparkles,
  Music,
  Music2,
  Zap,
  Gamepad2,
  Trophy,
  Palette,
  Camera,
  Utensils,
  Coffee,
  Wine,
  IceCream,
  Package,
  Truck,
  Mic,
  Headphones,
  Flower2,
  Users,
  Baby,
  GraduationCap,
  MapPin,
  Clock,
  Calendar,
  Smile,
  Tag,
}

export { ICON_MAP }

interface DynamicIconProps {
  name?: string | null
  className?: string
  fallback?: React.ElementType
}

export function DynamicIcon({ name, className, fallback: Fallback = Tag }: DynamicIconProps) {
  const matchedKey = name
    ? Object.keys(ICON_MAP).find((k) => k.toLowerCase() === name.toLowerCase())
    : undefined
  const Icon = matchedKey ? ICON_MAP[matchedKey] : undefined
  const Render = Icon ?? Fallback
  return <Render className={className} />
}

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedKey = value
    ? Object.keys(ICON_MAP).find((k) => k.toLowerCase() === value.toLowerCase())
    : undefined
  const SelectedIcon = (selectedKey ? ICON_MAP[selectedKey] : undefined) ?? Tag

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors w-full"
        >
          <div className="h-6 w-6 rounded bg-brand-azul/10 text-brand-azul flex items-center justify-center shrink-0">
            <SelectedIcon className="h-3.5 w-3.5" />
          </div>
          <span className={cn('flex-1 text-left', value ? 'text-foreground' : 'text-muted-foreground')}>
            {value || 'Seleccionar icono'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Iconos disponibles
        </p>
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(ICON_MAP).map(([k, Icon]) => (
            <button
              key={k}
              type="button"
              title={k}
              onClick={() => { onChange(k); setOpen(false) }}
              className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center transition-colors hover:bg-accent',
                selectedKey === k
                  ? 'bg-brand-azul/10 text-brand-azul ring-1 ring-brand-azul/30'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
