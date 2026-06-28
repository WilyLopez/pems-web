import { Cliente } from '../../../shared/types'
import { fileUrl, formatDate, getInitials } from '@/lib/utils'
import { Camera, Star } from 'lucide-react'

interface ProfileHeaderProps {
  cliente: Cliente
  onAvatarClick: () => void
}

export function ProfileHeader({ cliente, onAvatarClick }: ProfileHeaderProps) {
  const avatarUrl = fileUrl(cliente.fotoPerfilPath)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="h-24 sm:h-28 bg-gradient-to-r from-gray-900 via-gray-800 to-slate-700" />
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-12 sm:-mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-4">
            <div
              className="relative shrink-0 group cursor-pointer"
              onClick={onAvatarClick}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg bg-brand-rosa overflow-hidden flex items-center justify-center relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={cliente.nombreCompleto}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <span className="text-white text-2xl sm:text-3xl font-black">
                    {getInitials(cliente.nombreCompleto)}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-7 h-7 bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
                aria-label="Cambiar foto de perfil"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  {cliente.nombreCompleto}
                </h1>
                {cliente.esVip && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    <Star className="h-2.5 w-2.5 fill-white" />
                    VIP
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{cliente.correo}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
          <span className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">Miembro desde</span>{' '}
            {formatDate(cliente.creadoEn, 'MMMM yyyy')}
          </span>
          {cliente.segmentoCodigo && (
            <span className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">Segmento</span>{' '}
              {cliente.segmentoCodigo}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
