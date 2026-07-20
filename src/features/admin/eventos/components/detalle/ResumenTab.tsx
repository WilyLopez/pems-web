import {
  AlertTriangle,
  User,
  CalendarDays,
  Users,
  Clock,
  MessageCircle,
  FileText,
  Banknote,
  Package,
} from 'lucide-react'
import { usePaquete } from '@/hooks/useComercial'
import { InfoRow } from '@/components/common/InfoRow'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency } from '@/lib/utils'
import { EventoPrivado } from '../../types'

const ORIGEN_LABELS: Record<string, string> = {
  PRESENCIAL: 'Presencial',
  TELEFONO: 'Teléfono',
  WHATSAPP: 'WhatsApp',
  WEB: 'Web',
}

interface ResumenTabProps {
  evento: EventoPrivado
}

export function ResumenTab({ evento }: ResumenTabProps) {
  const { data: paquete } = usePaquete(evento.idPaquete ?? undefined)

  return (
    <div className="space-y-4">
      {evento.estado === 'CANCELADA' && evento.motivoCancelacion && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-red-500 dark:text-red-400 mb-1">
              Motivo de cancelación
            </p>
            <p className="text-sm text-red-800 dark:text-red-300">
              {evento.motivoCancelacion}
            </p>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Datos del evento
          </h3>
          {evento.esCotizacionPersonalizada && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-azul bg-brand-azul/10 px-2.5 py-1 rounded-full shrink-0">
              <FileText className="h-3.5 w-3.5" />
              Cotización personalizada
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={User} label="Cliente" value={evento.nombreCliente} />
          <InfoRow
            icon={CalendarDays}
            label="Fecha"
            value={formatDate(evento.fechaEvento)}
          />
          <InfoRow
            icon={Clock}
            label="Turno"
            value={`${evento.turno} · ${evento.horaInicio} - ${evento.horaFin}`}
          />
          <InfoRow
            icon={Users}
            label="Aforo"
            value={
              evento.aforoDeclarado ? `${evento.aforoDeclarado} personas` : null
            }
          />
          {paquete && (
            <InfoRow icon={Package} label="Paquete" value={paquete.nombre} />
          )}
          {evento.origenContacto && (
            <InfoRow
              icon={MessageCircle}
              label="Canal de contacto"
              value={
                ORIGEN_LABELS[evento.origenContacto] ?? evento.origenContacto
              }
            />
          )}
          {evento.presupuestoEstimado && (
            <InfoRow
              icon={Banknote}
              label="Presupuesto cliente"
              value={formatCurrency(evento.presupuestoEstimado)}
            />
          )}
        </div>
        {(evento.nombreNino || evento.contactoAdicional) && (
          <>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow
                icon={User}
                label="Nombre del niño"
                value={evento.nombreNino}
              />
              <InfoRow
                icon={User}
                label="Edad"
                value={evento.edadCumple ? `${evento.edadCumple} años` : null}
              />
              <InfoRow
                icon={User}
                label="Contacto adicional"
                value={evento.contactoAdicional}
              />
            </div>
          </>
        )}
        {evento.descripcionPersonalizada && (
          <>
            <Separator />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                Descripción del cliente
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {evento.descripcionPersonalizada}
              </p>
            </div>
          </>
        )}
        {evento.observaciones && (
          <>
            <Separator />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                Observaciones
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {evento.observaciones}
              </p>
            </div>
          </>
        )}
        {evento.extras && evento.extras.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                Extras solicitados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {evento.extras.map((ex) =>
                  ex.idExtra ? (
                    <span
                      key={ex.id}
                      className="text-xs bg-brand-rosa/10 text-brand-rosa px-2 py-0.5 rounded-full font-medium"
                    >
                      {ex.nombreExtra}
                    </span>
                  ) : (
                    <span
                      key={ex.id}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium border border-dashed border-gray-300 dark:border-gray-600"
                    >
                      {ex.nombreLibre}
                    </span>
                  )
                )}
              </div>
            </div>
          </>
        )}
        {evento.estado === 'COMPLETADA' &&
          (evento.horaInicioReal || evento.horaFinReal) && (
            <>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={Clock}
                  label="Inicio real"
                  value={
                    evento.horaInicioReal
                      ? formatDate(evento.horaInicioReal, 'HH:mm')
                      : null
                  }
                />
                <InfoRow
                  icon={Clock}
                  label="Fin real"
                  value={
                    evento.horaFinReal
                      ? formatDate(evento.horaFinReal, 'HH:mm')
                      : null
                  }
                />
              </div>
            </>
          )}
      </div>
    </div>
  )
}
