'use client'

import Link from 'next/link'
import { Clock, Loader2, PartyPopper } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { TimerPhase } from '@/hooks/useWizardTimer'
import { PaqueteEvento } from '@/types/comercial.types'
import { ExtraPaquete, ServicioCotizacion, Turno } from '@/types/evento.types'
import { nombreServicioSeleccionado } from '../../lib/servicio-precio'
import { Camino } from '../../../shared/types'
import { FilaResumen } from '../ui/FilaResumen'

interface Props {
  tipoEvento: string | null
  tipoEventoLabel: string | null
  camino: Camino
  paqueteSeleccionado: PaqueteEvento | null
  extras: ExtraPaquete[]
  extrasSeleccionados: number[]
  servicios: ServicioCotizacion[]
  serviciosCotizacion: number[]
  variantesSeleccionadas: Record<number, number>
  presupuestoEstimado: number
  fechaSel: string | null
  turnoSeleccionado: Turno | null
  nombreNino: string
  edadCumple: number | null
  invitados: number | null
  presupuestoCliente: number | null
  timerPhase: TimerPhase
  timerDisplay: string
  aceptaLegal: boolean
  setAceptaLegal: (value: boolean) => void
  isSubmitting: boolean
  datosValidos: boolean
  onAtras: () => void
  onSolicitar: () => void
}

export function PasoResumenFinal({
  tipoEvento,
  tipoEventoLabel,
  camino,
  paqueteSeleccionado,
  extras,
  extrasSeleccionados,
  servicios,
  serviciosCotizacion,
  variantesSeleccionadas,
  presupuestoEstimado,
  fechaSel,
  turnoSeleccionado,
  nombreNino,
  edadCumple,
  invitados,
  presupuestoCliente,
  timerPhase,
  timerDisplay,
  aceptaLegal,
  setAceptaLegal,
  isSubmitting,
  datosValidos,
  onAtras,
  onSolicitar,
}: Props) {
  return (
    <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 lg:max-w-2xl lg:mx-auto">
      <div>
        <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
          Paso 4 de 4
        </Badge>
        <h2 className="text-2xl font-black text-gray-900">
          Revisa tu solicitud
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Confirma los datos antes de enviar. Te contactaremos en menos de 24
          horas.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {tipoEventoLabel && (
          <FilaResumen label="Tipo de celebración" valor={tipoEventoLabel} />
        )}
        {camino === 'paquete' && paqueteSeleccionado && (
          <FilaResumen
            label="Paquete"
            valor={`${paqueteSeleccionado.nombre} · ${formatCurrency(paqueteSeleccionado.precio)}`}
          />
        )}
        {camino === 'paquete' && extrasSeleccionados.length > 0 && (
          <FilaResumen
            label="Extras"
            valor={extrasSeleccionados
              .map((id) => extras.find((e) => e.id === id)?.nombre)
              .filter(Boolean)
              .join(', ')}
          />
        )}
        {camino === 'cotizacion' && (
          <>
            <FilaResumen label="Modalidad" valor="Cotización personalizada" />
            {serviciosCotizacion.length > 0 && (
              <FilaResumen
                label="Servicios"
                valor={serviciosCotizacion
                  .map((id) => {
                    const servicio = servicios.find((s) => s.id === id)
                    return servicio
                      ? nombreServicioSeleccionado(
                          servicio,
                          variantesSeleccionadas[id]
                        )
                      : null
                  })
                  .filter(Boolean)
                  .join(', ')}
              />
            )}
            {presupuestoEstimado > 0 && (
              <FilaResumen
                label="Estimado servicios"
                valor={
                  <span className="text-brand-azul font-bold">
                    {formatCurrency(presupuestoEstimado)}
                  </span>
                }
              />
            )}
          </>
        )}
        <FilaResumen
          label="Fecha"
          valor={fechaSel ? formatDate(fechaSel) : '—'}
        />
        <FilaResumen
          label="Turno"
          valor={
            turnoSeleccionado
              ? `${turnoSeleccionado.nombre} · ${turnoSeleccionado.horaInicio}–${turnoSeleccionado.horaFin}`
              : '—'
          }
        />
        {tipoEvento === 'CUMPLEANOS' && nombreNino && (
          <FilaResumen
            label="Cumpleañero/a"
            valor={`${nombreNino}${edadCumple !== null ? ` · ${edadCumple} años` : ''}`}
          />
        )}
        {invitados && (
          <FilaResumen label="Invitados" valor={`~${invitados} personas`} />
        )}
        {presupuestoCliente && presupuestoCliente > 0 && (
          <FilaResumen
            label="Tu presupuesto"
            valor={
              <span className="text-green-700 font-bold">
                {formatCurrency(presupuestoCliente)}
              </span>
            }
          />
        )}
      </div>

      {timerPhase !== 'safe' && (
        <div
          className={cn(
            'flex items-start gap-2 p-3 rounded-xl border',
            timerPhase === 'critical'
              ? 'bg-red-50 border-red-300'
              : 'bg-amber-50 border-amber-200'
          )}
        >
          <Clock
            className={cn(
              'h-4 w-4 shrink-0 mt-0.5',
              timerPhase === 'critical' ? 'text-red-600' : 'text-amber-600'
            )}
          />
          <p
            className={cn(
              'text-xs font-semibold',
              timerPhase === 'critical' ? 'text-red-800' : 'text-amber-800'
            )}
          >
            Tu sesión expira en {timerDisplay}. Envía tu solicitud antes de que
            se cancele.
          </p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-xs text-amber-800">
          El precio final será confirmado por el equipo según los detalles de tu
          solicitud.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={aceptaLegal}
          onCheckedChange={(v) => setAceptaLegal(v === true)}
          className="mt-0.5"
        />
        <span className="text-xs text-gray-700 leading-relaxed">
          He leído y acepto los{' '}
          <Link
            href="/legal/terminos"
            target="_blank"
            className="text-brand-azul underline font-semibold"
          >
            Términos y Condiciones
          </Link>{' '}
          y la{' '}
          <Link
            href="/legal/privacidad"
            target="_blank"
            className="text-brand-azul underline font-semibold"
          >
            Política de Privacidad
          </Link>
          .
        </span>
      </label>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={onAtras}
        >
          Atrás
        </Button>
        <Button
          className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl font-black text-base gap-2 h-12"
          disabled={isSubmitting || !aceptaLegal || !datosValidos}
          onClick={onSolicitar}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <PartyPopper className="h-5 w-5" />
              Enviar solicitud
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
