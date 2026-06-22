'use client'

import { PartyPopper, Plus } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { PaqueteEvento } from '@/types/comercial.types'
import { ExtraPaquete, ServicioCotizacion, Turno } from '@/types/evento.types'
import { Camino } from '../../../shared/types'

interface Props {
  tipoEvento: string | null
  tipoEventoLabel: string | null
  camino: Camino
  paquete: PaqueteEvento | null
  extras: ExtraPaquete[]
  extrasSeleccionados: number[]
  serviciosCotizacion: number[]
  servicios: ServicioCotizacion[]
  presupuestoEstimado: number
  presupuestoCliente?: number | null
  fecha: string | null
  turno: Turno | null
  nombreNino: string
  edadCumple: number | null
  invitados: number | null
}

function ItemResumen({
  label,
  valor,
  sub,
}: {
  label: string
  valor: React.ReactNode
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{valor}</p>
      {sub && <p className="text-xs text-brand-azul font-bold">{sub}</p>}
    </div>
  )
}

export function ResumenEnVivo({
  tipoEvento,
  tipoEventoLabel,
  camino,
  paquete,
  extras,
  extrasSeleccionados,
  serviciosCotizacion,
  servicios,
  presupuestoEstimado,
  presupuestoCliente,
  fecha,
  turno,
  nombreNino,
  edadCumple,
  invitados,
}: Props) {
  const nombresExtras = extrasSeleccionados
    .map((id) => extras.find((e) => e.id === id)?.nombre)
    .filter(Boolean) as string[]

  const nombresServicios = serviciosCotizacion
    .map((id) => servicios.find((s) => s.id === id)?.nombre)
    .filter(Boolean) as string[]

  const tieneContenido = tipoEvento || camino || fecha

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-[80px] space-y-4">
      <div className="flex items-center gap-2">
        <PartyPopper className="h-4 w-4 text-brand-rosa" />
        <h3 className="font-black text-gray-900 text-sm">Tu evento</h3>
      </div>

      {!tieneContenido ? (
        <p className="text-xs text-gray-400 text-center py-4">
          Completa los pasos para ver el resumen aquí.
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          {tipoEventoLabel && (
            <ItemResumen label="Tipo" valor={tipoEventoLabel} />
          )}

          {camino === 'paquete' && paquete && (
            <ItemResumen
              label="Paquete"
              valor={paquete.nombre}
              sub={formatCurrency(paquete.precio)}
            />
          )}

          {camino === 'cotizacion' && (
            <ItemResumen label="Modalidad" valor="Cotización personalizada" />
          )}

          {nombresExtras.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Extras</p>
              <ul className="space-y-1">
                {nombresExtras.map((nombre) => (
                  <li key={nombre} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <Plus className="h-3 w-3 text-brand-azul shrink-0" />
                    {nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nombresServicios.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Servicios</p>
              <ul className="space-y-1">
                {nombresServicios.map((nombre) => (
                  <li key={nombre} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <Plus className="h-3 w-3 text-brand-azul shrink-0" />
                    {nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fecha && (
            <ItemResumen
              label="Fecha"
              valor={formatDate(fecha)}
            />
          )}

          {turno && (
            <ItemResumen
              label="Turno"
              valor={`${turno.nombre} · ${turno.horaInicio}–${turno.horaFin}`}
            />
          )}

          {tipoEvento === 'CUMPLEANOS' && nombreNino && (
            <ItemResumen
              label="Cumpleañero/a"
              valor={`${nombreNino}${edadCumple ? ` · ${edadCumple} años` : ''}`}
            />
          )}

          {invitados && (
            <ItemResumen label="Invitados" valor={`~${invitados} personas`} />
          )}
        </div>
      )}

      {camino === 'cotizacion' && presupuestoEstimado > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide">Estimado orientativo</p>
          <p className="text-xl font-black text-brand-azul mt-0.5">
            {formatCurrency(presupuestoEstimado)}
          </p>
        </div>
      )}

      {presupuestoCliente && presupuestoCliente > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide">Tu presupuesto</p>
          <p className="text-xl font-black text-green-700 mt-0.5">
            {formatCurrency(presupuestoCliente)}
          </p>
        </div>
      )}

      <p
        className={cn(
          'text-[11px] text-gray-400 pt-3',
          tieneContenido && 'border-t border-gray-100'
        )}
      >
        El precio final lo confirma el equipo tras revisar tu solicitud.
      </p>
    </div>
  )
}
