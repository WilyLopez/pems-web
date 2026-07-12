'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, X, Send, ArrowLeft, Users } from 'lucide-react'

import { marketingService } from '@/services/marketing.service'
import { CampanaEmail } from '@/types/marketing.types'
import { Button } from '@/components/ui/Button'

interface FiltroEnvio {
  soloVip: boolean
  soloFrecuentes: boolean
  soloNuevos: boolean
  soloInactivos: boolean
  soloCorporativos: boolean
  soloConAccesoWeb: boolean
  soloPresenciales: boolean
}

const FILTROS: { key: keyof FiltroEnvio; label: string; desc: string }[] = [
  {
    key: 'soloVip',
    label: 'Solo VIP',
    desc: 'Clientes con descuento VIP activo',
  },
  {
    key: 'soloFrecuentes',
    label: 'Solo frecuentes',
    desc: 'Segmento FRECUENTE',
  },
  { key: 'soloNuevos', label: 'Solo nuevos', desc: 'Segmento NUEVO' },
  { key: 'soloInactivos', label: 'Solo inactivos', desc: 'Segmento INACTIVO' },
  {
    key: 'soloCorporativos',
    label: 'Solo corporativos',
    desc: 'Segmento CORPORATIVO',
  },
  {
    key: 'soloConAccesoWeb',
    label: 'Solo con acceso web',
    desc: 'tieneAccesoWeb = true',
  },
  {
    key: 'soloPresenciales',
    label: 'Solo presenciales',
    desc: 'Origen PRESENCIAL',
  },
]

interface Props {
  campana: CampanaEmail | null
  onClose: () => void
  onSent: () => void
}

export function EnviarCampanaDialog({ campana, onClose, onSent }: Props) {
  const [filtro, setFiltro] = useState<FiltroEnvio>({
    soloVip: false,
    soloFrecuentes: false,
    soloNuevos: false,
    soloInactivos: false,
    soloCorporativos: false,
    soloConAccesoWeb: false,
    soloPresenciales: false,
  })
  const [valoresVariables, setValoresVariables] = useState<
    Record<string, string>
  >({})
  const [campanaIdPrevia, setCampanaIdPrevia] = useState(campana?.id)
  const [confirmando, setConfirmando] = useState(false)

  if (campana?.id !== campanaIdPrevia) {
    setCampanaIdPrevia(campana?.id)
    setValoresVariables({})
    setConfirmando(false)
  }

  const { data: variablesRequeridas, isLoading: cargandoVariables } = useQuery({
    queryKey: ['variables-requeridas', campana?.id],
    queryFn: () => marketingService.obtenerVariablesRequeridas(campana!.id),
    enabled: !!campana,
  })

  const { data: totalDestinatarios, isFetching: contandoDestinatarios } =
    useQuery({
      queryKey: ['destinatarios-count', campana?.id, filtro],
      queryFn: () => marketingService.contarDestinatarios(campana!.id, filtro),
      enabled: !!campana,
    })

  const enviar = useMutation({
    mutationFn: () =>
      marketingService.enviarCampana(campana!.id, {
        ...filtro,
        valoresVariables,
      }),
    onSuccess: () => {
      toast.success(
        'Campaña iniciada. Los envíos se procesarán en segundo plano.'
      )
      onSent()
      onClose()
    },
    onError: () => {
      setConfirmando(false)
      toast.error('No se pudo iniciar el envío de la campaña.')
    },
  })

  if (!campana) return null

  const toggle = (key: keyof FiltroEnvio) => {
    setConfirmando(false)
    setFiltro((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const faltanVariables = (variablesRequeridas ?? []).some(
    (variable) => !valoresVariables[variable]?.trim()
  )

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900">Enviar campaña</h2>
              <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">
                {campana.nombre}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">
              Selecciona los segmentos de destinatarios. Si no seleccionas
              ninguno, se enviará a{' '}
              <span className="font-semibold">todos los clientes activos</span>{' '}
              que aceptan comunicaciones y tienen correo.
            </p>

            <div className="space-y-2">
              {FILTROS.map(({ key, label, desc }) => (
                <label
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filtro[key]}
                    onChange={() => toggle(key)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-azul focus:ring-brand-azul/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {label}
                    </p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {cargandoVariables && (
              <p className="text-xs text-gray-400">
                Revisando variables de la plantilla…
              </p>
            )}

            {!!variablesRequeridas?.length && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">
                  Completa las variables de la plantilla
                </p>
                {variablesRequeridas.map((variable) => (
                  <div key={variable}>
                    <label className="text-xs text-gray-500">
                      {`{{${variable}}}`}
                    </label>
                    <input
                      type="text"
                      value={valoresVariables[variable] ?? ''}
                      onChange={(e) =>
                        setValoresVariables((prev) => ({
                          ...prev,
                          [variable]: e.target.value,
                        }))
                      }
                      placeholder={`Valor para ${variable}`}
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-brand-azul/5 border border-brand-azul/20 p-3 text-sm text-brand-azul font-semibold">
              <Users className="h-4 w-4 shrink-0" />
              {contandoDestinatarios ? (
                <span className="text-gray-500 font-normal">
                  Calculando destinatarios…
                </span>
              ) : (
                <span>
                  {totalDestinatarios ?? 0} destinatario
                  {totalDestinatarios === 1 ? '' : 's'} recibirán este correo
                </span>
              )}
            </div>

            {confirmando && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 font-medium">
                Estás a punto de enviar esta campaña a {totalDestinatarios ?? 0}{' '}
                destinatario
                {totalDestinatarios === 1 ? '' : 's'}. Esta acción no se puede
                deshacer. Confirma para continuar.
              </div>
            )}

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              El envío se procesa en lotes de 50 correos por minuto.
            </div>
          </div>

          <div className="flex justify-end gap-3 px-5 pb-5 border-t border-gray-100 pt-4">
            {confirmando ? (
              <>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setConfirmando(false)}
                  disabled={enviar.isPending}
                  className="rounded-xl gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  onClick={() => enviar.mutate()}
                  disabled={enviar.isPending || contandoDestinatarios}
                  className="rounded-xl gap-1.5 bg-brand-azul hover:bg-brand-azul/90"
                >
                  {enviar.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Sí, enviar a {totalDestinatarios ?? 0} destinatario
                  {totalDestinatarios === 1 ? '' : 's'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setConfirmando(true)}
                  disabled={
                    cargandoVariables ||
                    faltanVariables ||
                    contandoDestinatarios ||
                    !totalDestinatarios
                  }
                  className="rounded-xl gap-1.5 bg-brand-azul hover:bg-brand-azul/90"
                >
                  <Send className="h-4 w-4" />
                  Iniciar envío
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
