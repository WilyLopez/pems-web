import { forwardRef } from 'react'
import {
  Megaphone,
  Clock,
  MessageCircle,
  MapPin,
  PartyPopper,
} from 'lucide-react'
import { BannerSemanalData } from './useBannerSemanalData'
import { DiaBox } from './DiaBox'

interface Props {
  width: number
  height: number
  data: BannerSemanalData
}

const ANCHO_FOTO = 460
const ANCHO_DEGRADADO = 240

export const BannerSemanalHorizontal = forwardRef<HTMLDivElement, Props>(
  function BannerSemanalHorizontal({ width, height, data }, ref) {
    const {
      dias,
      rangoTexto,
      precioSemana,
      precioFinSemana,
      duracionSemana,
      duracionFinSemana,
      horario,
      whatsapp,
      direccion,
      fotoUrl,
      logoUrl,
      nombreNegocio,
    } = data

    return (
      <div
        ref={ref}
        style={{ width, height }}
        className="relative overflow-hidden bg-white font-poppins"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={nombreNegocio}
          crossOrigin="anonymous"
          className="absolute left-9 top-6 z-10 h-[150px] w-auto object-contain"
        />

        <div
          className="absolute top-8 z-10 flex flex-col items-end gap-1.5"
          style={{ right: ANCHO_FOTO + 48 }}
        >
          <p className="text-[16px] font-bold text-gray-900">Entradas:</p>
          <div className="text-right">
            <p className="text-[38px] font-black leading-none text-brand-azul">
              {precioSemana != null ? `S/.${precioSemana.toFixed(0)}` : 'S/.20'}
            </p>
            <p className="text-[14px] font-bold text-gray-900">
              De lunes a viernes
            </p>
            <p className="text-[12px] font-semibold text-gray-500">
              ({duracionSemana})
            </p>
          </div>
          <div className="mt-1.5 text-right">
            <p className="text-[38px] font-black leading-none text-brand-azul">
              {precioFinSemana != null
                ? `S/.${precioFinSemana.toFixed(0)}`
                : 'S/.25'}
            </p>
            <p className="text-[14px] font-bold text-gray-900">
              Sábado, Domingo y feriados
            </p>
            <p className="text-[12px] font-semibold text-gray-500">
              ({duracionFinSemana})
            </p>
          </div>
        </div>

        <div
          className="relative z-10 flex h-full flex-col items-center justify-center gap-4"
          style={{ paddingRight: ANCHO_FOTO + 24, paddingLeft: 40 }}
        >
          <p className="text-center text-[42px] font-black leading-none text-brand-rosa">
            PROGRAMACIÓN SEMANAL
          </p>
          <p className="text-[19px] font-bold text-gray-900">{rangoTexto}</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {dias.map((dia) => (
              <DiaBox key={dia.fecha} dia={dia} size="lg" />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 shrink-0 text-brand-rosa" />
            <p className="text-[17px] font-bold leading-tight text-brand-rosa">
              En los Eventos privados NO HAY ATENCIÓN al público en general
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 shrink-0 text-brand-rosa" />
              <span className="text-[17px] font-black text-gray-900">
                Horario de ATENCIÓN
              </span>
              <span className="text-[17px] font-semibold text-gray-600">
                de {horario}
              </span>
            </div>
            {whatsapp && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-[17px] font-bold text-gray-900">
                  {whatsapp}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 shrink-0 text-brand-rosa" />
              <span className="text-[17px] font-bold text-gray-900">
                {direccion}
              </span>
            </div>
          </div>
        </div>

        <div
          className="absolute right-0 top-0 z-0 h-full"
          style={{ width: ANCHO_FOTO }}
        >
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt=""
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-rosa/25 to-brand-azul/25">
              <PartyPopper className="h-14 w-14 text-brand-rosa/50" />
            </div>
          )}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-white/70 to-transparent"
            style={{ width: ANCHO_DEGRADADO }}
          />
        </div>
      </div>
    )
  }
)
