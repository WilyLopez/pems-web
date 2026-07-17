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

const ANCHO_FOTO_PCT = 0.36

export const BannerSemanalMovil = forwardRef<HTMLDivElement, Props>(
  function BannerSemanalMovil({ width, height, data }, ref) {
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

    const radioFoto = height / 2

    return (
      <div
        ref={ref}
        style={{ width, height }}
        className="relative flex overflow-hidden bg-white font-poppins"
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-7 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={nombreNegocio}
            crossOrigin="anonymous"
            className="h-[64px] w-auto object-contain"
          />

          <p className="text-center text-[24px] font-black leading-none text-brand-rosa">
            PROGRAMACIÓN SEMANAL
          </p>
          <p className="text-[14px] font-bold text-gray-900">{rangoTexto}</p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {dias.map((dia) => (
              <DiaBox key={dia.fecha} dia={dia} />
            ))}
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <Megaphone className="h-4 w-4 shrink-0 text-brand-rosa" />
            <p className="text-[12px] font-bold leading-tight text-brand-rosa">
              En los Eventos privados NO HAY ATENCIÓN al público en general
            </p>
          </div>

          <div className="mt-1.5 flex items-center gap-4">
            <div className="text-center">
              <p className="text-[13px] font-bold text-gray-900">Entradas:</p>
              <p className="text-[26px] font-black leading-none text-brand-azul">
                {precioSemana != null
                  ? `S/.${precioSemana.toFixed(0)}`
                  : 'S/.20'}
              </p>
              <p className="text-[12px] font-bold text-gray-900">
                De lunes a viernes
              </p>
              <p className="text-[11px] font-semibold text-gray-500">
                ({duracionSemana})
              </p>
            </div>
            <div className="h-16 w-px shrink-0 bg-gray-200" />
            <div className="text-center">
              <p className="text-[26px] font-black leading-none text-brand-azul">
                {precioFinSemana != null
                  ? `S/.${precioFinSemana.toFixed(0)}`
                  : 'S/.25'}
              </p>
              <p className="text-[12px] font-bold text-gray-900">
                Sábado, Domingo
                <br />y feriados
              </p>
              <p className="text-[11px] font-semibold text-gray-500">
                ({duracionFinSemana})
              </p>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0 text-brand-rosa" />
            <span className="text-[13px] font-black text-brand-rosa">
              Horario de ATENCIÓN
            </span>
            <span className="text-[13px] font-semibold text-gray-600">
              de {horario}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            {whatsapp && (
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-[13px] font-bold text-gray-900">
                  {whatsapp}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-brand-rosa" />
              <span className="text-[13px] font-bold text-gray-900">
                {direccion}
              </span>
            </div>
          </div>
        </div>

        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: width * ANCHO_FOTO_PCT,
            borderTopLeftRadius: radioFoto,
            borderBottomLeftRadius: radioFoto,
          }}
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
              <PartyPopper className="h-12 w-12 text-brand-rosa/50" />
            </div>
          )}
        </div>
      </div>
    )
  }
)
