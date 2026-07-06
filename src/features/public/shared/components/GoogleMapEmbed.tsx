import { cn } from '@/lib/utils'

interface GoogleMapEmbedProps {
  src: string
  title?: string
  className?: string
}

export function GoogleMapEmbed({
  src,
  title = 'Ubicación en Google Maps',
  className,
}: GoogleMapEmbedProps) {
  return (
    <iframe
      src={src}
      title={title}
      className={cn('h-full w-full border-0', className)}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  )
}
