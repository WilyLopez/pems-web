'use client'

import {
  Cake,
  Baby,
  Gift,
  GraduationCap,
  Briefcase,
  Sparkles,
  PartyPopper,
} from 'lucide-react'

interface Props {
  icono?: string
  className?: string
}

export function IconoTipoEvento({ icono, className = 'h-4 w-4' }: Props) {
  switch (icono) {
    case 'cake':
      return <Cake className={className} />
    case 'baby':
      return <Baby className={className} />
    case 'gift':
      return <Gift className={className} />
    case 'graduation-cap':
      return <GraduationCap className={className} />
    case 'briefcase':
      return <Briefcase className={className} />
    case 'sparkles':
      return <Sparkles className={className} />
    case 'party-popper':
      return <PartyPopper className={className} />
    default:
      return <PartyPopper className={className} />
  }
}
