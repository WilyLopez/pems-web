import { forwardRef } from 'react'
import {
  Megaphone,
  Clock,
  MessageCircle,
  MapPin,
  PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BannerSemanalData, DiaBanner } from './useBannerSemanalData'

interface Props {
  width: number
  height: number
  data: BannerSemanalData
}

export const BannerSemanalVertical = forwardRef<HTMLDivElement, Props>(
  function BannerSemanalVertical({ width, height, data }, ref) {
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
        className="flex flex-col overflow-hidden bg-white font-poppins"
      >
        <div className="flex shrink-0 flex-col items-center px-10 pt-9">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={nombreNegocio}
            crossOrigin="anonymous"
            className="h-[100px] w-auto object-contain"
          />
          <p className="mt-1.5 text-[20px] font-bold text-gray-900">
            Juegos infantiles y eventos
          </p>

          <h1 className="mt-5 text-center text-[52px] font-black leading-[0.95] text-brand-rosa">
            PROGRAMACIÓN
            <br />
            SEMANAL
          </h1>
          <p className="mt-2.5 text-[24px] font-bold text-gray-900">
            {rangoTexto}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-4 gap-2.5 px-10 mt-7">
          {dias.slice(0, 4).map((dia) => (
            <DiaBox key={dia.fecha} dia={dia} />
          ))}
        </div>
        <div className="grid shrink-0 grid-cols-4 gap-2.5 px-10 mt-2.5">
          {dias.slice(4, 7).map((dia) => (
            <DiaBox key={dia.fecha} dia={dia} />
          ))}
          <div />
        </div>

        <div className="mx-10 mt-5 flex shrink-0 items-center gap-2.5">
          <Megaphone className="h-6 w-6 shrink-0 text-brand-rosa" />
          <p className="text-[17px] font-bold leading-tight text-brand-rosa">
            En los eventos privados NO hay atención al público en general
          </p>
        </div>

        <div className="mt-5 flex shrink-0 items-stretch gap-4 px-10">
          <div className="flex-1 text-center">
            <p className="text-[38px] font-black leading-none text-brand-azul">
              {precioSemana != null ? `S/.${precioSemana.toFixed(0)}` : 'S/.20'}
            </p>
            <p className="mt-1 text-[16px] font-bold text-gray-900">
              De lunes a viernes
            </p>
            <p className="text-[14px] font-semibold text-gray-500">
              ({duracionSemana})
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[22px] font-bold text-gray-900">Entradas:</p>
            <p className="text-[38px] font-black leading-none text-brand-azul">
              {precioFinSemana != null
                ? `S/.${precioFinSemana.toFixed(0)}`
                : 'S/.25'}
            </p>
            <p className="mt-1 text-[15px] font-bold text-gray-900">
              Sábado, Domingo y feriados
            </p>
            <p className="text-[13px] font-semibold text-gray-500">
              ({duracionFinSemana})
            </p>
          </div>
        </div>

        <div className="mt-6 flex shrink-0 items-center gap-3 px-10">
          <Clock className="h-8 w-8 shrink-0 text-brand-rosa" />
          <div>
            <p className="text-[19px] font-black leading-none text-gray-900">
              Horario de ATENCIÓN
            </p>
            <p className="mt-0.5 text-[18px] font-semibold text-gray-600">
              {horario}
            </p>
          </div>
        </div>

        <div className="mt-5 flex shrink-0 flex-col gap-2 px-10">
          <span className="w-fit rounded-full bg-emerald-500 px-3 py-1 text-[13px] font-black uppercase tracking-wide text-white">
            Contacto
          </span>
          {whatsapp && (
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 shrink-0 text-emerald-600" />
              <p className="text-[18px] font-bold text-gray-900">{whatsapp}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 shrink-0 text-brand-rosa" />
            <p className="text-[18px] font-bold text-gray-900">{direccion}</p>
          </div>
        </div>

        <div className="relative mx-10 mb-9 mt-6 min-h-0 flex-1 overflow-hidden rounded-2xl bg-gray-100">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt=""
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-rosa/25 to-brand-azul/25">
              <PartyPopper className="h-16 w-16 text-brand-rosa/40" />
            </div>
          )}
        </div>
      </div>
    )
  }
)

function DiaBox({ dia }: { dia: DiaBanner }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-brand-azul py-2.5">
      <p className="px-1 text-center text-[13px] font-bold leading-tight text-brand-azul-dark">
        {dia.etiquetaCompleta}
      </p>
      <p
        className={cn(
          'px-1 text-center text-[13px] font-black leading-tight',
          dia.tono === 'normal' ? 'text-emerald-700' : 'text-red-600'
        )}
      >
        {dia.estado}
      </p>
    </div>
  )
}
