import { cn } from '@/lib/utils'

const items = [
  { color: 'bg-white border border-gray-200',           label: 'Disponible'         },
  { color: 'bg-green-100 border border-green-300',      label: 'Baja ocupacion'     },
  { color: 'bg-yellow-100 border border-yellow-300',    label: 'Media ocupacion'    },
  { color: 'bg-orange-100 border border-orange-300',    label: 'Alta ocupacion'     },
  { color: 'bg-red-50 border border-red-200',           label: 'Lleno / Bloqueado'  },
  { color: 'bg-purple-50 border border-purple-200',     label: 'Feriado'            },
  { color: 'bg-brand-azul/5 border border-brand-azul/40', label: 'Hoy'             },
]

export function CalendarioLeyenda() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3 border-t border-gray-100">
      {items.map(({ color, label }) => (
        <span key={label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className={cn('h-3 w-3 rounded-sm shrink-0', color)} />
          {label}
        </span>
      ))}
    </div>
  )
}