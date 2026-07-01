import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

export function Logo({
  variant = 'secundario',
  size = 'md',
  href = '/',
  onClick,
  className,
}: LogoProps) {
  const { w, h } = sizeMap[size]
  const src =
    variant === 'principal' ? '/logo-principal.png' : '/logo-secundario.png'

  const img = (
    <Image
      src={src}
      alt="Kiki y Lala"
      width={w}
      height={h}
      className={cn('object-contain', className)}
      style={{ width: 'auto', height: 'auto' }}
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
