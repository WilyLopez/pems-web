import Image from 'next/image'
import Link from 'next/link'
import { Shield, Zap } from 'lucide-react'
import { Banner } from '@/types/banner.types'
import { fileUrl } from '@/lib/utils'

async function getActiveBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/banners/publico`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.data as Banner[]) ?? []
  } catch {
    return []
  }
}

function HeroBannerFallback() {
  return (
    <div className="hidden lg:flex justify-center relative">
      <div className="relative w-[420px] h-[420px]">
        <div className="absolute inset-0 bg-brand-gradient rounded-3xl opacity-30 blur-2xl scale-110" />
        <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-brand-azul/30 to-brand-rosa/30 backdrop-blur h-full flex items-center justify-center">
          <Image
            src="/logo-principal.png"
            alt="Kiki y Lala"
            width={340}
            height={340}
            className="object-contain drop-shadow-2xl animate-float"
          />
        </div>
        <div className="absolute -top-4 -right-4 bg-brand-amarillo text-gray-900 rounded-2xl px-4 py-2 text-sm font-black shadow-lg rotate-6 flex items-center gap-1.5">
          <Zap className="h-4 w-4" />
          Nuevo show
        </div>
        <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2 text-sm font-bold shadow-lg -rotate-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-azul" />
          100% Seguro
        </div>
      </div>
    </div>
  )
}

export async function HeroBanner() {
  const banners = await getActiveBanners()
  const banner = banners[0]

  if (!banner) return <HeroBannerFallback />

  const content = (
    <div className="hidden lg:flex justify-center relative">
      <div className="relative w-[420px] h-[420px]">
        <div className="absolute inset-0 bg-brand-gradient rounded-3xl opacity-30 blur-2xl scale-110" />
        <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-brand-azul/30 to-brand-rosa/30 backdrop-blur h-full flex items-center justify-center">
          <Image
            src={fileUrl(banner.imagenUrl) ?? banner.imagenUrl}
            alt={banner.titulo}
            fill
            className="object-cover"
            sizes="420px"
            unoptimized
          />
          {banner.descripcion && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <p className="text-white font-bold text-sm leading-snug line-clamp-2">
                {banner.descripcion}
              </p>
            </div>
          )}
        </div>
        <div className="absolute -top-4 -right-4 bg-brand-amarillo text-gray-900 rounded-2xl px-4 py-2 text-sm font-black shadow-lg rotate-6 flex items-center gap-1.5">
          <Zap className="h-4 w-4" />
          {banner.titulo}
        </div>
        {banner.enlaceDestino && (
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2 text-sm font-bold shadow-lg -rotate-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-azul" />
            Ver más
          </div>
        )}
      </div>
    </div>
  )

  if (banner.enlaceDestino) {
    return (
      <Link href={banner.enlaceDestino} className="contents">
        {content}
      </Link>
    )
  }

  return content
}
