import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Crown } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface ClienteAvatarProps {
  nombre: string
  fotoPerfil?: string | null
  esVip?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
}

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function ClienteAvatar({
  nombre,
  fotoPerfil,
  esVip = false,
  size = 'md',
  className,
}: ClienteAvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <Avatar className={sizeMap[size]}>
        {fotoPerfil && <AvatarImage src={fotoPerfil} alt={nombre} />}
        <AvatarFallback
          className={cn(
            'font-bold',
            textSizeMap[size],
            esVip
              ? 'bg-brand-amarillo/20 text-yellow-700'
              : 'bg-brand-azul/15 text-brand-azul'
          )}
        >
          {getInitials(nombre)}
        </AvatarFallback>
      </Avatar>

      {esVip && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-amarillo flex items-center justify-center shadow-sm">
          <Crown className="h-2.5 w-2.5 text-yellow-800" />
        </span>
      )}
    </div>
  )
}
