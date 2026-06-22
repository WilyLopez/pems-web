'use client'

interface Props {
  titulo:      string
  descripcion: string
  imagenUrl:   string | null
  textoCta?:   string
  visibleHome: boolean
}

export function NovedadPreview({ titulo, descripcion, imagenUrl, textoCta, visibleHome }: Props) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        {visibleHome ? 'Vista previa — Homepage' : 'Vista previa — Novedades'}
      </p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="aspect-[16/7] bg-gray-100 relative">
          {imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagenUrl} alt={titulo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs text-gray-300">Sin imagen</p>
            </div>
          )}
          {visibleHome && (
            <span className="absolute top-2 left-2 bg-brand-rosa text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Inicio
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-gray-900 line-clamp-2">
            {titulo || <span className="text-gray-300">Título de la novedad</span>}
          </h3>
          {descripcion && (
            <p className="text-xs text-gray-500 line-clamp-2">{descripcion}</p>
          )}
          {textoCta && (
            <span className="inline-block text-xs font-bold text-brand-azul">{textoCta} →</span>
          )}
        </div>
      </div>
    </div>
  )
}
