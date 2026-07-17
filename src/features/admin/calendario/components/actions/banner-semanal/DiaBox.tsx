import { cn } from '@/lib/utils'
import { DiaBanner } from './useBannerSemanalData'

interface Props {
  dia: DiaBanner
  size?: 'sm' | 'lg'
}

export function DiaBox({ dia, size = 'sm' }: Props) {
  const lg = size === 'lg'
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center rounded-xl border-2 border-brand-azul',
        lg ? 'w-[132px] gap-1.5 px-2 py-3' : 'w-[104px] gap-1 px-1.5 py-2'
      )}
    >
      <p
        className={cn(
          'text-center font-bold leading-tight text-brand-azul-dark',
          lg ? 'text-[15px]' : 'text-[12px]'
        )}
      >
        {dia.etiquetaCompleta}
      </p>
      <p
        className={cn(
          'text-center font-black leading-tight',
          lg ? 'text-[13px]' : 'text-[11px]',
          dia.tono === 'normal' ? 'text-emerald-700' : 'text-red-600'
        )}
      >
        {dia.estado}
      </p>
    </div>
  )
}
