'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePublicConfig } from '@/features/public/shared/hooks/usePublicConfig'

interface LogoProps {
  variant?: 'principal' | 'secundario'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  onClick?: () => void
  className?: string
}

const sizeMap = {
  sm: { w: 80, h: 36 },
  md: { w: 120, h: 54 },
  lg: { w: 160, h: 72 },
  xl: { w: 220, h: 100 },
}

const sizeClassMap = {
  sm: 'w-14 h-auto sm:w-20',
  md: 'w-20 h-auto sm:w-28',
  lg: 'w-28 h-auto sm:w-36',
  xl: 'w-36 h-auto sm:w-48',
}

export function Logo({
  variant = 'secundario',
  size = 'md',
  href = '/',
  onClick,
  className,
}: LogoProps) {
  const { data: config } = usePublicConfig()
  const { w, h } = sizeMap[size]

  const fallback =
    variant === 'principal' ? '/logo-principal.png' : '/logo-secundario.png'
  const configUrl =
    variant === 'principal' ? config?.logoUrl : config?.logoSecundarioUrl
  const src = configUrl || fallback
  const esExterno = src.startsWith('http')

  const img = (
    <Image
      src={src}
      alt={config?.nombreNegocio ?? 'Kiki y Lala'}
      width={w}
      height={h}
      unoptimized={esExterno}
      className={cn('object-contain', sizeClassMap[size], className)}
      priority
    />
  )

  if (!href) return img
  return (
    <Link href={href} onClick={onClick}>
      {img}
    </Link>
  )
}
